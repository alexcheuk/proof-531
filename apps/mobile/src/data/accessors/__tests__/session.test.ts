import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { cancelSession, completeSession, createSession, getSession } from '../session';
import { getSettings, seedDefaultSettings } from '../settings';
import { setTrainingMax } from '../trainingMax';

function freshDb() {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
  return drizzle(sqlite, { schema }) as any;
}

describe('session accessor', () => {
  it('createSession snapshots TM and units from current settings', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    const s = await createSession(db, 'squat');
    expect(s.lift).toBe('squat');
    expect(s.trainingMaxSnapshot).toBe(250);
    expect(s.storageUnitSnapshot).toBe('lbs');
    expect(s.displayUnitSnapshot).toBe('lbs');
    expect(s.status).toBe('in_progress');
    expect(s.id).toBeGreaterThan(0);
  });

  it('changing TM after createSession does NOT change session snapshot', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    const s = await createSession(db, 'squat');
    const sessionId = s.id as number;
    // Bump TM mid-session
    await setTrainingMax(db, 'squat', 260, 'lbs');
    // Re-read the session by id
    const reread = await getSession(db, sessionId);
    expect(reread?.trainingMaxSnapshot).toBe(250);
  });

  it('createSession throws if no TM exists for lift', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await expect(createSession(db, 'squat')).rejects.toThrow();
  });

  it('completeSession marks complete and advances day', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    const s = await createSession(db, 'squat');
    const sessionId = s.id as number;
    await completeSession(db, sessionId);
    const after = await getSession(db, sessionId);
    expect(after?.status).toBe('completed');
    expect(after?.endedAt).toBeGreaterThan(0);
    const settings = await getSettings(db);
    expect(settings.day).toBe(2);
  });

  it('completeSession is idempotent', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    const s = await createSession(db, 'squat');
    const sessionId = s.id as number;
    await completeSession(db, sessionId);
    await expect(completeSession(db, sessionId)).resolves.toBeUndefined();
    const settings = await getSettings(db);
    expect(settings.day).toBe(2); // not advanced twice
  });

  it('cancelSession marks cancelled and does NOT advance day', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    const s = await createSession(db, 'squat');
    const sessionId = s.id as number;
    await cancelSession(db, sessionId);
    const after = await getSession(db, sessionId);
    expect(after?.status).toBe('cancelled');
    const settings = await getSettings(db);
    expect(settings.day).toBe(1); // unchanged
  });
});
