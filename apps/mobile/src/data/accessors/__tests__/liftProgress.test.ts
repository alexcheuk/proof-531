import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { advanceLift, getAllLiftProgress, getLiftProgress } from '../liftProgress';
import { seedDefaultSettings, updateSettings } from '../settings';
import { getCurrentTrainingMaxes, setTrainingMax } from '../trainingMax';

function freshDb() {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  // biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
  return drizzle(sqlite, { schema }) as any;
}

describe('liftProgress accessor', () => {
  it('getLiftProgress seeds from global settings on first read', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    // Pre-existing user mid-cycle: simulate by patching legacy columns.
    await updateSettings(db, { currentCycle: 3, week: 2 });
    const squat = await getLiftProgress(db, 'squat');
    expect(squat).toMatchObject({ lift: 'squat', currentCycle: 3, week: 2 });
  });

  it('seeding happens once per lift; later setting edits do not re-seed', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await updateSettings(db, { currentCycle: 3, week: 2 });
    const first = await getLiftProgress(db, 'squat');
    expect(first.currentCycle).toBe(3);
    // Mutate legacy settings; the seeded row should NOT shift.
    await updateSettings(db, { currentCycle: 7, week: 4 });
    const second = await getLiftProgress(db, 'squat');
    expect(second).toMatchObject({ currentCycle: 3, week: 2 });
  });

  it('advanceLift bumps week 1 → 2 → 3 → 4 without touching other lifts', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');
    let squat = await advanceLift(db, 'squat');
    expect(squat.week).toBe(2);
    squat = await advanceLift(db, 'squat');
    expect(squat.week).toBe(3);
    squat = await advanceLift(db, 'squat');
    expect(squat.week).toBe(4);
    const bench = await getLiftProgress(db, 'bench');
    expect(bench).toMatchObject({ currentCycle: 1, week: 1 });
  });

  it("advanceLift on week 4 wraps to next cycle + bumps THAT lift's TM only", async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');
    await setTrainingMax(db, 'deadlift', 300, 'lbs');
    await setTrainingMax(db, 'press', 140, 'lbs');
    // Fast-forward squat to week 4.
    await advanceLift(db, 'squat');
    await advanceLift(db, 'squat');
    await advanceLift(db, 'squat');
    const squatBefore = await getLiftProgress(db, 'squat');
    expect(squatBefore.week).toBe(4);
    // Wrap.
    const squatAfter = await advanceLift(db, 'squat');
    expect(squatAfter).toMatchObject({ currentCycle: 2, week: 1 });
    // Only squat's TM bumped (+10 lower body); others unchanged.
    const tms = await getCurrentTrainingMaxes(db);
    const find = (l: string) => tms.find((t) => t.lift === l)?.value;
    expect(find('squat')).toBe(260);
    expect(find('bench')).toBe(200);
    expect(find('deadlift')).toBe(300);
    expect(find('press')).toBe(140);
  });

  it('getAllLiftProgress returns one row per requested lift in order', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    const rows = await getAllLiftProgress(db, ['press', 'squat', 'bench']);
    expect(rows.map((r) => r.lift)).toEqual(['press', 'squat', 'bench']);
    for (const r of rows) expect(r).toMatchObject({ currentCycle: 1, week: 1 });
  });
});
