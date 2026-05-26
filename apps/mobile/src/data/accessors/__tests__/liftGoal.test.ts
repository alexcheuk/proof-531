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

  it('upserts a single row per lift, preserving kind on update', async () => {
    const db = freshDb();
    const first = await setLiftGoal(db, 'squat', 'tm', 315, 'lbs');
    expect(first.kind).toBe('tm');
    expect(first.targetValue).toBe(315);
    const second = await setLiftGoal(db, 'squat', '1rm', 405, 'lbs');
    expect(second.kind).toBe('1rm');
    expect(second.targetValue).toBe(405);
    const rows = await getLiftGoals(db);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.kind).toBe('1rm');
    expect(rows[0]?.targetValue).toBe(405);
  });

  it('keeps goals per lift independent', async () => {
    const db = freshDb();
    await setLiftGoal(db, 'squat', 'tm', 315, 'lbs');
    await setLiftGoal(db, 'bench', '1rm', 250, 'lbs');
    const squat = await getLiftGoal(db, 'squat');
    const bench = await getLiftGoal(db, 'bench');
    expect(squat?.kind).toBe('tm');
    expect(squat?.targetValue).toBe(315);
    expect(bench?.kind).toBe('1rm');
    expect(bench?.targetValue).toBe(250);
  });

  it('clearLiftGoal removes the row idempotently', async () => {
    const db = freshDb();
    await setLiftGoal(db, 'press', 'tm', 145, 'lbs');
    await clearLiftGoal(db, 'press');
    expect(await getLiftGoal(db, 'press')).toBeNull();
    // Second clear is a no-op.
    await clearLiftGoal(db, 'press');
    expect(await getLiftGoal(db, 'press')).toBeNull();
  });
});
