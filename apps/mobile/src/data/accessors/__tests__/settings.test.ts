import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import {
  advanceCycle,
  advanceDay,
  getSettings,
  seedDefaultSettings,
  setDisplayUnit,
  setTrainingMaxFromOneRM,
  updateSettings,
} from '../settings';
import { getCurrentTrainingMaxes, setTrainingMax } from '../trainingMax';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

function freshDb(): TestDb {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  return drizzle(sqlite, { schema });
}

describe('settings accessor', () => {
  it('getSettings seeds defaults on first call', async () => {
    const db = freshDb();
    const s = await getSettings(db);
    expect(s.id).toBe(1);
    expect(s.storageUnit).toBe('lbs');
    expect(s.displayUnit).toBe('lbs');
    expect(s.plateSet).toBe('standard');
    expect(s.enabledLifts).toEqual(['squat', 'bench', 'deadlift', 'press']);
    expect(s.currentCycle).toBe(1);
    expect(s.week).toBe(1);
    expect(s.day).toBe(1);
    expect(s.restTargetSeconds).toBe(180);
  });

  it('updateSettings round-trips restTargetSeconds', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    const updated = await updateSettings(db, { restTargetSeconds: 180 });
    expect(updated.restTargetSeconds).toBe(180);
    const reread = await getSettings(db);
    expect(reread.restTargetSeconds).toBe(180);
  });

  it('getSettings returns existing row on subsequent calls (no duplicate seed)', async () => {
    const db = freshDb();
    await getSettings(db);
    await updateSettings(db, { storageUnit: 'kg' });
    const s = await getSettings(db);
    expect(s.storageUnit).toBe('kg');
  });

  it('seedDefaultSettings is idempotent', async () => {
    const db = freshDb();
    const a = await seedDefaultSettings(db);
    const b = await seedDefaultSettings(db);
    expect(a).toEqual(b);
  });

  it('seedDefaultSettings does not overwrite existing customisations', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await updateSettings(db, { storageUnit: 'kg', plateSet: 'kg-standard' });
    const s = await seedDefaultSettings(db);
    expect(s.storageUnit).toBe('kg');
    expect(s.plateSet).toBe('kg-standard');
  });

  it('updateSettings preserves id and merges patch', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    const updated = await updateSettings(db, { storageUnit: 'kg', displayUnit: 'kg' });
    expect(updated.id).toBe(1);
    expect(updated.storageUnit).toBe('kg');
    expect(updated.displayUnit).toBe('kg');
    // Untouched fields preserved
    expect(updated.enabledLifts).toEqual(['squat', 'bench', 'deadlift', 'press']);
    expect(updated.currentCycle).toBe(1);
    expect(updated.plateSet).toBe('standard');
  });

  it('updateSettings round-trips enabledLifts through JSON', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    const updated = await updateSettings(db, { enabledLifts: ['press', 'bench'] });
    expect(updated.enabledLifts).toEqual(['press', 'bench']);
    // Re-read to ensure persisted JSON decodes back to an array.
    const reread = await getSettings(db);
    expect(reread.enabledLifts).toEqual(['press', 'bench']);
  });

  it('updateSettings seeds defaults when no row exists yet', async () => {
    const db = freshDb();
    const s = await updateSettings(db, { displayUnit: 'kg' });
    expect(s.id).toBe(1);
    expect(s.displayUnit).toBe('kg');
    expect(s.storageUnit).toBe('lbs'); // came from defaults
  });

  it('setDisplayUnit flips display unit only', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    const s = await setDisplayUnit(db, 'kg');
    expect(s.displayUnit).toBe('kg');
    expect(s.storageUnit).toBe('lbs');
  });

  it('advanceDay advances day, wraps to week, then to cycle', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    // 4 enabled lifts → day cycles 1..4
    let s = await advanceDay(db);
    expect(s.day).toBe(2);
    s = await advanceDay(db);
    expect(s.day).toBe(3);
    s = await advanceDay(db);
    expect(s.day).toBe(4);
    // Next call wraps: day=1, week=2
    s = await advanceDay(db);
    expect(s.day).toBe(1);
    expect(s.week).toBe(2);
  });

  it('advanceDay rolls into the next cycle after week 4 day 4', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');
    await setTrainingMax(db, 'deadlift', 300, 'lbs');
    await setTrainingMax(db, 'press', 140, 'lbs');
    // Fast-forward to week 4 day 4.
    await updateSettings(db, { week: 4, day: 4 });
    const s = await advanceDay(db);
    expect(s.currentCycle).toBe(2);
    expect(s.week).toBe(1);
    expect(s.day).toBe(1);
  });

  it('advanceCycle increments cycle, resets week/day, bumps TMs', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');
    await setTrainingMax(db, 'deadlift', 300, 'lbs');
    await setTrainingMax(db, 'press', 140, 'lbs');
    const s = await advanceCycle(db);
    expect(s.currentCycle).toBe(2);
    expect(s.week).toBe(1);
    expect(s.day).toBe(1);

    // TMs bumped: lower body +10, upper body +5 (in lbs)
    const tms = await getCurrentTrainingMaxes(db);
    const find = (l: string) => tms.find((t) => t.lift === l)?.value;
    expect(find('squat')).toBe(260);
    expect(find('deadlift')).toBe(310);
    expect(find('bench')).toBe(205);
    expect(find('press')).toBe(145);
  });

  it("advanceCycle bumps in each TM row's own unit", async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    // squat row was set in kg → should bump +5 kg, not +10 lb
    await setTrainingMax(db, 'squat', 110, 'kg');
    await setTrainingMax(db, 'bench', 80, 'kg');
    await setTrainingMax(db, 'deadlift', 140, 'kg');
    await setTrainingMax(db, 'press', 60, 'kg');
    await advanceCycle(db);
    const tms = await getCurrentTrainingMaxes(db);
    const find = (l: string) => tms.find((t) => t.lift === l);
    expect(find('squat')?.value).toBe(115);
    expect(find('squat')?.unit).toBe('kg');
    expect(find('deadlift')?.value).toBe(145);
    expect(find('bench')?.value).toBe(82.5);
    expect(find('press')?.value).toBe(62.5);
  });

  it('advanceCycle skips lifts without a TM history row', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    // No other TMs set.
    const s = await advanceCycle(db);
    expect(s.currentCycle).toBe(2);
    const tms = await getCurrentTrainingMaxes(db);
    expect(tms).toHaveLength(1);
    expect(tms[0]?.value).toBe(260);
  });

  it('setTrainingMaxFromOneRM persists TM = 90% × 1RM snapped', async () => {
    const db = freshDb();
    const row = await setTrainingMaxFromOneRM(db, 'squat', 300, 'lbs');
    // 90% of 300 = 270, snapped to 5 lb step = 270
    expect(row.value).toBe(270);
    expect(row.lift).toBe('squat');
    expect(row.unit).toBe('lbs');
  });

  it('setTrainingMaxFromOneRM snaps to the unit step (kg → 2.5 kg)', async () => {
    const db = freshDb();
    const row = await setTrainingMaxFromOneRM(db, 'bench', 100, 'kg');
    // 90% of 100 = 90, already on the 2.5 kg grid
    expect(row.value).toBe(90);
    expect(row.unit).toBe('kg');
  });
});
