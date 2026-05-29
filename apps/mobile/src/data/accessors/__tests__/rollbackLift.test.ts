import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { getLiftProgress } from '../liftProgress';
import { countCompletedSessionsForLift, rollbackLift } from '../rollbackLift';
import { completeSession, createSession } from '../session';
import { seedDefaultSettings } from '../settings';
import { setTrainingMax } from '../trainingMax';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type TestDb = ReturnType<typeof drizzle<typeof schema>> & any;

function freshDb(): { db: TestDb; sqlite: BetterSqlite3.Database } {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
  return { db: drizzle(sqlite, { schema }) as any, sqlite };
}

async function seedCompletedSession(db: TestDb, lift: 'squat' | 'bench' | 'deadlift' | 'press') {
  const s = await createSession(db, lift);
  await completeSession(db, s.id as number);
}

describe('rollbackLift', () => {
  it('returns 0 when no completed sessions exist', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'bench', 200, 'lbs');
    const deleted = await rollbackLift(db, 'bench', 1);
    expect(deleted).toBe(0);
  });

  it('rolls back a single session and reverts liftProgress', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'bench', 200, 'lbs');

    // Complete week 1 → progress now at week 2
    await seedCompletedSession(db, 'bench');
    const afterOne = await getLiftProgress(db, 'bench');
    expect(afterOne.week).toBe(2);

    // Rollback 1 session → should revert to week 1
    const deleted = await rollbackLift(db, 'bench', 1);
    expect(deleted).toBe(1);

    const reverted = await getLiftProgress(db, 'bench');
    expect(reverted.week).toBe(1);
    expect(reverted.currentCycle).toBe(1);
  });

  it('rolls back multiple sessions', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 300, 'lbs');

    // Complete weeks 1, 2, 3
    await seedCompletedSession(db, 'squat');
    await seedCompletedSession(db, 'squat');
    await seedCompletedSession(db, 'squat');

    const afterThree = await getLiftProgress(db, 'squat');
    expect(afterThree.week).toBe(4);

    // Rollback 2 → should be at week 2
    const deleted = await rollbackLift(db, 'squat', 2);
    expect(deleted).toBe(2);

    const reverted = await getLiftProgress(db, 'squat');
    expect(reverted.week).toBe(2);
    expect(reverted.currentCycle).toBe(1);
  });

  it('clamps to available sessions when n > completed count', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'press', 100, 'lbs');

    await seedCompletedSession(db, 'press');
    await seedCompletedSession(db, 'press');

    // Request 5 but only 2 exist
    const deleted = await rollbackLift(db, 'press', 5);
    expect(deleted).toBe(2);
  });

  it('does not touch other lifts', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 300, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');

    await seedCompletedSession(db, 'squat');
    await seedCompletedSession(db, 'bench');

    const benchBefore = await getLiftProgress(db, 'bench');

    await rollbackLift(db, 'squat', 1);

    const benchAfter = await getLiftProgress(db, 'bench');
    expect(benchAfter.week).toBe(benchBefore.week);
    expect(benchAfter.currentCycle).toBe(benchBefore.currentCycle);
  });

  it('deletes the pr row when no amrap logs survive', async () => {
    const { db, sqlite } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 300, 'lbs');

    const s = await createSession(db, 'squat');
    const sessionId = s.id as number;
    sqlite
      .prepare(
        'INSERT INTO set_logs (session_id, "index", kind, prescribed_weight, prescribed_reps, actual_reps, completed_at, is_pr, estimated_1rm) VALUES (?, 2, \'amrap\', 300, 5, 8, 1000, 1, 450)',
      )
      .run(sessionId);
    sqlite
      .prepare(
        "INSERT INTO prs (lift, best_e1rm, set_log_id, achieved_at) VALUES ('squat', 450, last_insert_rowid(), 0)",
      )
      .run();
    await completeSession(db, sessionId);

    await rollbackLift(db, 'squat', 1);

    const prsLeft = sqlite.prepare("SELECT * FROM prs WHERE lift = 'squat'").all();
    expect(prsLeft).toHaveLength(0);
  });
});

describe('countCompletedSessionsForLift', () => {
  it('returns 0 for a lift with no sessions', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    const count = await countCompletedSessionsForLift(db, 'deadlift');
    expect(count).toBe(0);
  });

  it('counts only completed sessions for the specified lift', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'deadlift', 400, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');

    await seedCompletedSession(db, 'deadlift');
    await seedCompletedSession(db, 'deadlift');
    await seedCompletedSession(db, 'bench');

    expect(await countCompletedSessionsForLift(db, 'deadlift')).toBe(2);
    expect(await countCompletedSessionsForLift(db, 'bench')).toBe(1);
  });
});
