import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { getCompletedSessionsWithAmrapForLift } from '../liftProgression';
import { completeSession, createSession } from '../session';
import { appendSetLog } from '../setLog';
import { seedDefaultSettings } from '../settings';
import { setTrainingMax } from '../trainingMax';

function freshDb() {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: structural typing
  return drizzle(sqlite, { schema }) as any;
}

describe('getCompletedSessionsWithAmrapForLift', () => {
  it('returns empty array when no completed sessions exist', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    expect(await getCompletedSessionsWithAmrapForLift(db, 'squat')).toEqual([]);
  });

  it('joins each completed session to its AMRAP row (if any)', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');

    const session = await createSession(db, 'squat');
    await appendSetLog(db, {
      sessionId: session.id,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 8,
    });
    await completeSession(db, session.id);

    const rows = await getCompletedSessionsWithAmrapForLift(db, 'squat');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.amrap?.actualReps).toBe(8);
    expect(rows[0]?.amrap?.prescribedWeight).toBe(212.5);
  });

  it('returns sessions without AMRAP rows as amrap=null', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');

    const session = await createSession(db, 'squat');
    // Only a working set, no amrap.
    await appendSetLog(db, {
      sessionId: session.id,
      index: 0,
      kind: 'working',
      prescribedWeight: 162.5,
      prescribedReps: 5,
      actualReps: 5,
    });
    await completeSession(db, session.id);

    const rows = await getCompletedSessionsWithAmrapForLift(db, 'squat');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.amrap).toBeNull();
  });

  it('surfaces a tm-test top set on week-4 sessions', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');

    const session = await createSession(db, 'squat');
    await appendSetLog(db, {
      sessionId: session.id,
      index: 0,
      kind: 'tm-test',
      prescribedWeight: 250,
      prescribedReps: 5,
      actualReps: 5,
    });
    await completeSession(db, session.id);

    const rows = await getCompletedSessionsWithAmrapForLift(db, 'squat');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.amrap?.kind).toBe('tm-test');
    expect(rows[0]?.amrap?.actualReps).toBe(5);
    expect(rows[0]?.amrap?.prescribedWeight).toBe(250);
  });

  it('does not return sessions for other lifts', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 180, 'lbs');

    const squatSession = await createSession(db, 'squat');
    await appendSetLog(db, {
      sessionId: squatSession.id,
      index: 2,
      kind: 'amrap',
      prescribedWeight: 212.5,
      prescribedReps: 5,
      actualReps: 6,
    });
    await completeSession(db, squatSession.id);

    expect(await getCompletedSessionsWithAmrapForLift(db, 'bench')).toEqual([]);
  });
});
