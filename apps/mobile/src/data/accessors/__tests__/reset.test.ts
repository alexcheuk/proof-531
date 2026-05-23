/**
 * Tests for the hard-reset accessor. Asserts that resetEverything truncates
 * all five tables in one logical operation and that subsequent reads see
 * the empty state (which the FirstLaunchGate uses to redirect to onboarding).
 */
import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { resetEverything } from '../reset';
import { createSession } from '../session';
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

    await resetEverything(db);

    expect(await getCurrentTrainingMaxes(db)).toEqual([]);

    const tableNames = ['settings', 'training_maxes', 'sessions', 'set_logs', 'prs'];
    for (const tbl of tableNames) {
      const { c } = sqlite.prepare(`SELECT COUNT(*) AS c FROM ${tbl}`).get() as {
        c: number;
      };
      expect(c).toBe(0);
    }
  });

  it('is idempotent on an empty database', async () => {
    const { db } = freshDb();
    await expect(resetEverything(db)).resolves.toBeUndefined();
    await expect(resetEverything(db)).resolves.toBeUndefined();
    expect(await getCurrentTrainingMaxes(db)).toEqual([]);
  });
});
