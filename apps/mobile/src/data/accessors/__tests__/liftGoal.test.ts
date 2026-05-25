import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { clearLiftGoal, getLiftGoal, getLiftGoals, setLiftGoal } from '../liftGoal';

function freshDb() {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: structural typing
  return drizzle(sqlite, { schema }) as any;
}

describe('liftGoal accessors', () => {
  it('returns null when no goal exists', async () => {
    const db = freshDb();
    expect(await getLiftGoal(db, 'squat')).toBeNull();
    expect(await getLiftGoals(db)).toEqual([]);
  });

  it('upserts a single row per lift', async () => {
    const db = freshDb();
    const first = await setLiftGoal(db, 'squat', 315, 'lbs');
    expect(first.targetE1RM).toBe(315);
    const second = await setLiftGoal(db, 'squat', 335, 'lbs');
    expect(second.targetE1RM).toBe(335);
    const rows = await getLiftGoals(db);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.targetE1RM).toBe(335);
  });

  it('keeps goals per lift independent', async () => {
    const db = freshDb();
    await setLiftGoal(db, 'squat', 315, 'lbs');
    await setLiftGoal(db, 'bench', 225, 'lbs');
    expect((await getLiftGoal(db, 'squat'))?.targetE1RM).toBe(315);
    expect((await getLiftGoal(db, 'bench'))?.targetE1RM).toBe(225);
  });

  it('clearLiftGoal removes the row idempotently', async () => {
    const db = freshDb();
    await setLiftGoal(db, 'press', 145, 'lbs');
    await clearLiftGoal(db, 'press');
    expect(await getLiftGoal(db, 'press')).toBeNull();
    // Second clear is a no-op.
    await clearLiftGoal(db, 'press');
    expect(await getLiftGoal(db, 'press')).toBeNull();
  });
});
