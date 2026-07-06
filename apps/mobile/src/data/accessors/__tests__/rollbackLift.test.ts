import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { getLiftProgress } from '../liftProgress';
import { countCompletedSessionsForLift, rollbackLift } from '../rollbackLift';
import { completeSession, createSession, getActiveSession, resetSession } from '../session';
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

  it('cancels an in_progress session for the lift before rolling back', async () => {
    // Regression: reset + rollback desync (Discord 1523487664270213179).
    // Scenario: user completes Day 1, starts Day 2, resets Day 2 (session stays
    // in_progress), then rolls back Day 1. liftProgress goes back to week=1 but
    // the in_progress Day 2 session (week=2) was never cancelled. createSession
    // then returns the ghost Day 2 session instead of creating a fresh Day 1 session.
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'bench', 200, 'lbs');

    // Complete Day 1
    const s1 = await createSession(db, 'bench');
    await completeSession(db, s1.id as number);

    // Start and reset Day 2 (leaves an in_progress session)
    const s2 = await createSession(db, 'bench');
    await resetSession(db, s2.id as number);

    const activeBefore = await getActiveSession(db);
    expect(activeBefore?.id).toBe(s2.id);
    expect(activeBefore?.status).toBe('in_progress');
    expect(activeBefore?.week).toBe(2);

    // Rollback Day 1 - should cancel the in_progress Day 2 session first
    const deleted = await rollbackLift(db, 'bench', 1);
    expect(deleted).toBe(1);

    // The in_progress Day 2 session must be cancelled - no ghost remains
    const activeAfter = await getActiveSession(db);
    expect(activeAfter).toBeNull();

    // liftProgress is back at week=1 ready for a clean Day 1 redo
    const progress = await getLiftProgress(db, 'bench');
    expect(progress.week).toBe(1);
  });

  it('does not cancel in_progress sessions for other lifts during rollback', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 300, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');

    // Complete a squat session, then start a bench session (stays in_progress)
    const sq = await createSession(db, 'squat');
    await completeSession(db, sq.id as number);
    const bSession = await createSession(db, 'bench');

    // Rolling back squat should NOT touch the bench in_progress session
    await rollbackLift(db, 'squat', 1);

    const active = await getActiveSession(db);
    expect(active?.id).toBe(bSession.id);
    expect(active?.status).toBe('in_progress');
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
