/**
 * resetSession accessor — covers the loop-005 PR-rebuild contract
 * documented in `session.ts`. The base "wipe set_logs + bump startedAt"
 * is asserted; the new rebuild paths (no surviving AMRAP → delete prs;
 * surviving AMRAP → update prs with the next-best e1RM) are the focus.
 */
import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { resetSession } from '../session';
import { seedDefaultSettings } from '../settings';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

function freshDb(): { db: TestDb; sqlite: BetterSqlite3.Database } {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  return { db: drizzle(sqlite, { schema }), sqlite };
}

function seedSession(sqlite: BetterSqlite3.Database, id: number, lift: string, status: string) {
  sqlite
    .prepare(
      "INSERT INTO sessions (id, lift, cycle, week, started_at, ended_at, status, training_max_snapshot, storage_unit_snapshot, display_unit_snapshot) VALUES (?, ?, 1, 1, 0, NULL, ?, 300, 'lbs', 'lbs')",
    )
    .run(id, lift, status);
}

function seedAmrap(
  sqlite: BetterSqlite3.Database,
  id: number,
  sessionId: number,
  weight: number,
  reps: number,
  e1rm: number,
) {
  sqlite
    .prepare(
      'INSERT INTO set_logs (id, session_id, "index", kind, prescribed_weight, prescribed_reps, actual_reps, completed_at, is_pr, estimated_1rm) VALUES (?, ?, 2, \'amrap\', ?, 5, ?, ?, 1, ?)',
    )
    .run(id, sessionId, weight, reps, id, e1rm);
}

describe('resetSession', () => {
  it('wipes set_logs and bumps startedAt', async () => {
    const { db, sqlite } = freshDb();
    await seedDefaultSettings(db);
    seedSession(sqlite, 1, 'squat', 'in_progress');
    sqlite
      .prepare(
        'INSERT INTO set_logs (session_id, "index", kind, prescribed_weight, prescribed_reps, actual_reps, completed_at, is_pr) VALUES (1, 0, \'working\', 225, 5, 5, 100, 0)',
      )
      .run();

    await resetSession(db, 1);

    const remainingLogs = sqlite
      .prepare('SELECT count(*) as n FROM set_logs WHERE session_id = 1')
      .get() as { n: number };
    expect(remainingLogs.n).toBe(0);
    const session = sqlite.prepare('SELECT started_at FROM sessions WHERE id = 1').get() as {
      started_at: number;
    };
    expect(session.started_at).toBeGreaterThan(0);
  });

  it('deletes the prs row when no AMRAP rows survive elsewhere', async () => {
    const { db, sqlite } = freshDb();
    await seedDefaultSettings(db);
    seedSession(sqlite, 1, 'squat', 'in_progress');
    seedAmrap(sqlite, 10, 1, 255, 8, 399);
    sqlite
      .prepare(
        "INSERT INTO prs (lift, best_e1rm, set_log_id, achieved_at) VALUES ('squat', 399, 10, 0)",
      )
      .run();

    await resetSession(db, 1);

    const remainingPrs = sqlite
      .prepare("SELECT count(*) as n FROM prs WHERE lift = 'squat'")
      .get() as { n: number };
    expect(remainingPrs.n).toBe(0);
  });

  it('rebuilds prs.bestE1RM from the next-best surviving AMRAP across other sessions', async () => {
    const { db, sqlite } = freshDb();
    await seedDefaultSettings(db);
    // Session 1: prior PR (380), still completed.
    seedSession(sqlite, 1, 'squat', 'completed');
    seedAmrap(sqlite, 10, 1, 250, 7, 380);
    // Session 2: in-progress with a higher AMRAP (399), set the prs row.
    seedSession(sqlite, 2, 'squat', 'in_progress');
    seedAmrap(sqlite, 20, 2, 255, 8, 399);
    sqlite
      .prepare(
        "INSERT INTO prs (lift, best_e1rm, set_log_id, achieved_at) VALUES ('squat', 399, 20, 0)",
      )
      .run();

    await resetSession(db, 2);

    const pr = sqlite
      .prepare("SELECT best_e1rm, set_log_id FROM prs WHERE lift = 'squat'")
      .get() as { best_e1rm: number; set_log_id: number };
    expect(pr.best_e1rm).toBe(380);
    expect(pr.set_log_id).toBe(10);
  });

  it('throws when the session does not exist', async () => {
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await expect(resetSession(db, 99)).rejects.toThrow(/does not exist/);
  });

  it('throws when the session is already cancelled', async () => {
    const { db, sqlite } = freshDb();
    await seedDefaultSettings(db);
    seedSession(sqlite, 1, 'squat', 'cancelled');
    await expect(resetSession(db, 1)).rejects.toThrow(/not in_progress/);
  });
});
