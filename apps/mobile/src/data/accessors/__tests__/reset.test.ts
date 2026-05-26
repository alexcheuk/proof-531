/**
 * Tests for the hard-reset accessor. Asserts that resetEverything truncates
 * all seven persisted tables in one logical operation and that subsequent
 * reads see the empty state (which the FirstLaunchGate uses to redirect to
 * onboarding).
 */
import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { getLiftProgress } from '../liftProgress';
import { resetEverything } from '../reset';
import { completeSession, createSession } from '../session';
import { seedDefaultSettings } from '../settings';
import { getCurrentTrainingMaxes, setTrainingMax } from '../trainingMax';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

function freshDb(): { db: TestDb; sqlite: BetterSqlite3.Database } {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  return { db: drizzle(sqlite, { schema }), sqlite };
}

describe('resetEverything', () => {
  it('truncates all 5 tables', async () => {
    const { db, sqlite } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await createSession(db, 'squat');

    // Sanity: rows are present before reset.
    expect((await getCurrentTrainingMaxes(db)).length).toBeGreaterThan(0);

    // Seed lift_progress by reading it (auto-seeds on first read).
    await getLiftProgress(db, 'squat');

    await resetEverything(db);

    expect(await getCurrentTrainingMaxes(db)).toEqual([]);

    const tableNames = [
      'settings',
      'training_maxes',
      'sessions',
      'set_logs',
      'prs',
      'lift_progress',
      'lift_goals',
    ];
    for (const tbl of tableNames) {
      const { c } = sqlite.prepare(`SELECT COUNT(*) AS c FROM ${tbl}`).get() as {
        c: number;
      };
      expect(c).toBe(0);
    }
  });

  it('wipes the per-lift cycle/week so a fresh install starts at C1·W1 again', async () => {
    // Discord 1508776628: stale lift_progress rows survived a hard reset and
    // the next user landed on the prior install's cycle/week.
    const { db } = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    // Drive squat through one completed cycle so its lift_progress row
    // advances past the default (C1, W1).
    for (let i = 0; i < 4; i++) {
      const s = await createSession(db, 'squat');
      await completeSession(db, s.id);
    }
    const before = await getLiftProgress(db, 'squat');
    expect(before.currentCycle).toBeGreaterThan(1);

    await resetEverything(db);
    await seedDefaultSettings(db);
    const after = await getLiftProgress(db, 'squat');
    expect(after).toEqual(expect.objectContaining({ lift: 'squat', currentCycle: 1, week: 1 }));
  });

  it('is idempotent on an empty database', async () => {
    const { db } = freshDb();
    await expect(resetEverything(db)).resolves.toBeUndefined();
    await expect(resetEverything(db)).resolves.toBeUndefined();
    expect(await getCurrentTrainingMaxes(db)).toEqual([]);
  });
});
