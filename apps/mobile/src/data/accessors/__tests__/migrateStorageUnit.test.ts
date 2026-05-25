/**
 * Tests for the storage-unit migration accessor. Asserts that migrateStorageUnit
 * appends new TM rows per lift in the target unit (note='unit-migration'),
 * leaves prior rows intact (append-only), patches Settings.storageUnit, drags
 * Settings.displayUnit along iff it was tied to the old storage, and is a
 * no-op when the target equals the current storage.
 */
import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { runMigrations } from '../../drizzle/runMigrations';
import * as schema from '../../drizzle/schema';
import { migrateStorageUnit } from '../migrateStorageUnit';
import { getSettings, seedDefaultSettings, updateSettings } from '../settings';
import { getCurrentTrainingMaxes, getTrainingMaxHistory, setTrainingMax } from '../trainingMax';

type TestDb = ReturnType<typeof drizzle<typeof schema>>;

function freshDb(): TestDb {
  const sqlite = new BetterSqlite3(':memory:');
  runMigrations(sqlite);
  return drizzle(sqlite, { schema });
}

describe('migrateStorageUnit', () => {
  it('appends new TMs in the target unit with note="unit-migration"', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 200, 'lbs');
    await migrateStorageUnit(db, 'kg');

    const tms = await getCurrentTrainingMaxes(db);
    const squat = tms.find((t) => t.lift === 'squat');
    const bench = tms.find((t) => t.lift === 'bench');
    expect(squat?.unit).toBe('kg');
    expect(bench?.unit).toBe('kg');
    expect(squat?.note).toBe('unit-migration');
    expect(bench?.note).toBe('unit-migration');
    // 250 lb × 0.45359237 = 113.398… kg → snap to 2.5 → 112.5 kg
    expect(squat?.value).toBe(112.5);
    // 200 lb × 0.45359237 = 90.718… kg → snap to 2.5 → 90 kg
    expect(bench?.value).toBe(90);
  });

  it('leaves prior TM rows intact (append-only)', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await migrateStorageUnit(db, 'kg');
    const history = await getTrainingMaxHistory(db, 'squat');
    expect(history).toHaveLength(2);
    // Newest first
    expect(history[0]?.unit).toBe('kg');
    expect(history[0]?.note).toBe('unit-migration');
    expect(history[1]?.unit).toBe('lbs');
    expect(history[1]?.value).toBe(250);
    expect(history[1]?.note).toBeNull();
  });

  it('patches settings.storageUnit and drags displayUnit when it was tied to old storage', async () => {
    const db = freshDb();
    await seedDefaultSettings(db); // storageUnit=lbs, displayUnit=lbs (defaults)
    await migrateStorageUnit(db, 'kg');
    const s = await getSettings(db);
    expect(s.storageUnit).toBe('kg');
    expect(s.displayUnit).toBe('kg'); // dragged
  });

  it('does NOT drag displayUnit when it differs from old storage', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    // Manually pick a different display unit (storage=lbs, display=kg).
    await updateSettings(db, { displayUnit: 'kg' });
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await migrateStorageUnit(db, 'kg');
    const s = await getSettings(db);
    expect(s.storageUnit).toBe('kg');
    // Display was already kg (≠ old storage 'lbs') so it stays put — but
    // the value lands at kg either way, so the user-visible currency is kg.
    expect(s.displayUnit).toBe('kg');
  });

  it('is a no-op when target equals current storage', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await migrateStorageUnit(db, 'lbs');
    const history = await getTrainingMaxHistory(db, 'squat');
    expect(history).toHaveLength(1); // no migration row appended
    const s = await getSettings(db);
    expect(s.storageUnit).toBe('lbs');
  });

  it('skips lifts whose current TM is already in the target unit', async () => {
    const db = freshDb();
    await seedDefaultSettings(db); // storage=lbs
    // Bench's latest TM happens to be in kg already (e.g. a partial earlier
    // migration). Squat is still in lbs.
    await setTrainingMax(db, 'squat', 250, 'lbs');
    await setTrainingMax(db, 'bench', 90, 'kg');
    await migrateStorageUnit(db, 'kg');
    const squatHistory = await getTrainingMaxHistory(db, 'squat');
    const benchHistory = await getTrainingMaxHistory(db, 'bench');
    expect(squatHistory).toHaveLength(2); // appended
    expect(benchHistory).toHaveLength(1); // skipped — already kg
    expect(benchHistory[0]?.unit).toBe('kg');
    expect(benchHistory[0]?.value).toBe(90);
  });

  it('converts existing prs.bestE1RM to the new unit so mixed-unit best-lift comparisons stay correct', async () => {
    const db = freshDb();
    await seedDefaultSettings(db);
    // Seed minimal session + set_log + prs rows directly so we can assert
    // on the post-migration prs.bestE1RM in isolation (without going
    // through the full AMRAP flow, which would require a full LiveScreen
    // render). 399 lb e1RM on squat, 220 lb on bench — both pre-migration.
    const sqlite = (db as unknown as { session: { client: BetterSqlite3.Database } }).session
      .client;
    sqlite
      .prepare(
        "INSERT INTO sessions (id, lift, cycle, week, started_at, ended_at, status, training_max_snapshot, storage_unit_snapshot, display_unit_snapshot) VALUES (1, 'squat', 1, 1, 0, NULL, 'completed', 300, 'lbs', 'lbs')",
      )
      .run();
    sqlite
      .prepare(
        "INSERT INTO set_logs (id, session_id, \"index\", kind, prescribed_weight, prescribed_reps, actual_reps, completed_at, is_pr, estimated_1rm) VALUES (1, 1, 2, 'amrap', 255, 5, 8, 0, 1, 399), (2, 1, 2, 'amrap', 185, 5, 8, 0, 1, 220)",
      )
      .run();
    sqlite
      .prepare(
        "INSERT INTO prs (lift, best_e1rm, set_log_id, achieved_at) VALUES ('squat', 399, 1, 0), ('bench', 220, 2, 0)",
      )
      .run();

    await migrateStorageUnit(db, 'kg');

    const rows = (await Promise.resolve(db.select().from(schema.prs))) as Array<{
      lift: string;
      bestE1RM: number;
    }>;
    const squat = rows.find((r) => r.lift === 'squat');
    const bench = rows.find((r) => r.lift === 'bench');
    // 399 lb × 0.45359237 ≈ 180.98 kg (no snap — e1RM keeps full precision)
    expect(squat?.bestE1RM).toBeCloseTo(180.98, 1);
    // 220 lb × 0.45359237 ≈ 99.79 kg
    expect(bench?.bestE1RM).toBeCloseTo(99.79, 1);
  });
});
