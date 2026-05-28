/**
 * Storage-unit migration accessor.
 *
 * Mirrors the PWA accessor at
 * `the PWA reference`.
 *
 * Switch the *storage* unit (the currency that future TM bumps and session
 * snapshots are denominated in). For each lift whose current TM is NOT
 * already in the target unit, we APPEND a new TM row at
 * `value = convertAndSnap(old, oldUnit, newUnit)`, `unit = newUnit`,
 * `note = 'unit-migration'`. Existing rows are NOT mutated — TM history is
 * append-only per docs/technical-design.md §4 (the PD-04 invariant). We
 * then patch `Settings.storageUnit` to the new unit. If
 * `Settings.displayUnit` was tied to the old storage (i.e. user hadn't
 * picked a different display), we also flip `displayUnit` to the new unit
 * — KISS, the user sees migrated numbers immediately.
 *
 * In-flight sessions (status === 'in_progress') are NOT touched — their
 * `storageUnitSnapshot` was set at createSession and remains valid. Any
 * `advanceCycle()` after this migration bumps the *new* (latest) TM rows
 * in the new unit, since `tmIncrement` keys off the row's own `tm.unit`.
 *
 * No-op when the requested unit already equals the current storage.
 *
 * Atomicity: the inserts + settings patch run inside a SQLite transaction
 * (BEGIN/COMMIT) executed against the underlying driver, so a process kill
 * between the loop and the settings update cannot leave a hybrid state
 * where some TMs are in the new unit but settings.storageUnit still names
 * the old one. If the BEGIN/COMMIT helpers aren't available on the driver
 * (e.g. a mocked test handle), we fall back to sequential writes with the
 * same crash-recovery property as before.
 */
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Unit } from '../../domain/types';
import { convertAndSnap, convertWeight } from '../../domain/units';
import { prs, trainingMaxes } from '../drizzle/schema';
import { getSettings, updateSettings } from './settings';
import { getCurrentTrainingMaxes } from './trainingMax';

// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

/**
 * Best-effort raw-SQL exec against drizzle's underlying session. drizzle
 * surfaces a `.run` that takes a `sql` template; we don't want to depend
 * on that here, so we reach for the underlying driver via the same shape
 * runMigrations uses (`execSync` for expo-sqlite, `exec` for
 * better-sqlite3). Returns false if neither is available — caller falls
 * back to non-transactional writes.
 */
function execRaw(db: AnyDb, sql: string): boolean {
  // biome-ignore lint/suspicious/noExplicitAny: structural reach across drivers
  const session = (db as any).session;
  // biome-ignore lint/suspicious/noExplicitAny: structural reach across drivers
  const client: any = session?.client;
  if (client) {
    if (typeof client.execSync === 'function') {
      client.execSync(sql);
      return true;
    }
    if (typeof client.exec === 'function') {
      client.exec(sql);
      return true;
    }
  }
  return false;
}

export async function migrateStorageUnit(db: AnyDb, newUnit: Unit): Promise<void> {
  const settings = await getSettings(db);
  if (settings.storageUnit === newUnit) return;
  const tms = await getCurrentTrainingMaxes(db);

  const inTransaction = execRaw(db, 'BEGIN;');
  try {
    const now = Date.now();
    for (const tm of tms) {
      if (tm.unit === newUnit) continue;
      await Promise.resolve(
        db.insert(trainingMaxes).values({
          lift: tm.lift,
          value: convertAndSnap(tm.value, tm.unit, newUnit),
          unit: newUnit,
          updatedAt: now,
          note: 'unit-migration',
        }),
      );
    }
    // PRs (`prs.bestE1RM`) are stored as bare numbers in whatever storage
    // unit was in effect when the AMRAP set was logged — the table has no
    // unit column. Before this migration, every existing PR was in the
    // OLD storage unit (single-unit invariant pre-migration), so converting
    // them all in one pass keeps `pickBestLift`'s numeric `>` comparison
    // honest after future PRs land in the new unit. Without this, a 100 kg
    // PR sits at `100` while a fresh 220 lb PR sits at `220` — the lb
    // value falsely "wins" the heaviest-lift badge.
    const existingPrs = (await Promise.resolve(db.select().from(prs))) as Array<{
      lift: 'squat' | 'bench' | 'deadlift' | 'press';
      bestE1RM: number;
    }>;
    for (const row of existingPrs) {
      const converted = convertWeight(row.bestE1RM, settings.storageUnit, newUnit);
      await Promise.resolve(
        db.update(prs).set({ bestE1RM: converted }).where(eq(prs.lift, row.lift)),
      );
    }
    const patch: { storageUnit: Unit; displayUnit?: Unit } = { storageUnit: newUnit };
    // If displayUnit was tied to the old storage (the default state), drag it
    // along so the user sees the migrated numbers immediately.
    if (settings.displayUnit === settings.storageUnit) {
      patch.displayUnit = newUnit;
    }
    await updateSettings(db, patch);
    if (inTransaction) execRaw(db, 'COMMIT;');
  } catch (err) {
    if (inTransaction) execRaw(db, 'ROLLBACK;');
    throw err;
  }
}
