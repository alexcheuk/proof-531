import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import {
  completeSession,
  createSession,
  getActiveSession,
  getSession,
  getSessions,
} from '../session';
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

  it('getSessions returns all sessions, newest first', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');
    const a = await createSession(db, 'squat');
    // Complete the first session before creating the second — the
    // single-session invariant means createSession would reuse the
    // existing in_progress row otherwise.
    await completeSession(db, a.id as number);
    // Force a later startedAt so ordering is deterministic regardless of clock
    // resolution within the same ms.
    await new Promise((r) => setTimeout(r, 2));
    const b = await createSession(db, 'bench');

    const list = await getSessions(db);
    expect(list).toHaveLength(2);
    expect(list[0]?.id).toBe(b.id);
    expect(list[1]?.id).toBe(a.id);
  });

  it('createSession reuses an existing in_progress row for the same lift', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    const first = await createSession(db, 'squat');
    const second = await createSession(db, 'squat');
    expect(second.id).toBe(first.id);
    const list = await getSessions(db);
    expect(list).toHaveLength(1);
  });

  it('createSession refuses to create a parallel session for a different lift', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');
    await createSession(db, 'squat');
    await expect(createSession(db, 'bench')).rejects.toThrow(/in-progress session/);
  });

  it('getSessions returns an empty array when no sessions exist', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    const list = await getSessions(db);
    expect(list).toEqual([]);
  });

  it('getActiveSession returns the in-progress row, or null when none', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');

    // No sessions yet.
    expect(await getActiveSession(db)).toBeNull();

    const s = await createSession(db, 'squat');
    const active = await getActiveSession(db);
    expect(active?.id).toBe(s.id);
    expect(active?.status).toBe('in_progress');

    // After completion the in-progress row should be gone.
    await completeSession(db, s.id as number);
    expect(await getActiveSession(db)).toBeNull();
  });
});
