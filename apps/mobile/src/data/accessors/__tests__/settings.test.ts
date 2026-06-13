import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import {
  getSettings,
  seedDefaultSettings,
  setDisplayUnit,
  setTrainingMaxFromOneRM,
  updateSettings,
} from '../settings';

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

  it('reviewPromptedAt defaults to undefined and round-trips a timestamp', async () => {
    const db = freshDb();
    const initial = await getSettings(db);
    expect(initial.reviewPromptedAt).toBeUndefined();

    const ts = 1718000000000;
    const updated = await updateSettings(db, { reviewPromptedAt: ts });
    expect(updated.reviewPromptedAt).toBe(ts);

    const reread = await getSettings(db);
    expect(reread.reviewPromptedAt).toBe(ts);
  });
});
