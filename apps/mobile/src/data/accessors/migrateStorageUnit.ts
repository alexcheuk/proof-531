/**
 * Storage-unit migration accessor.
 *
 * Mirrors the PWA accessor at
 * `~/Development/531-pwa/src/db/accessors/migrateStorageUnit.ts`.
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
 * Transactional trade-off: the PWA wraps this in a Dexie rw transaction.
 * drizzle-orm's `db.transaction((tx) => ...)` exists but its typing varies
 * across drivers (better-sqlite3 vs expo-sqlite) and we'd need to thread
 * the tx through `getCurrentTrainingMaxes` / `updateSettings` (which take
 * the wider `AnyDb` structural-poly). Since the mobile DB is single-writer
 * (JS event loop, no concurrent expo-sqlite writers in practice) we run
 * the inserts and the settings patch sequentially. Validation happens up
 * front so a partial failure during inserts leaves prior rows intact (the
 * append-only contract makes partial-write recovery a re-run of the same
 * migration).
 */
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Unit } from '../../domain/types';
import { convertAndSnap } from '../../domain/units';
import { trainingMaxes } from '../drizzle/schema';
import { getSettings, updateSettings } from './settings';
import { getCurrentTrainingMaxes } from './trainingMax';

// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export async function migrateStorageUnit(db: AnyDb, newUnit: Unit): Promise<void> {
  const settings = await getSettings(db);
  if (settings.storageUnit === newUnit) return;
  const tms = await getCurrentTrainingMaxes(db);
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
  const patch: { storageUnit: Unit; displayUnit?: Unit } = { storageUnit: newUnit };
  // If displayUnit was tied to the old storage (the default state), drag it
  // along so the user sees the migrated numbers immediately.
  if (settings.displayUnit === settings.storageUnit) {
    patch.displayUnit = newUnit;
  }
  await updateSettings(db, patch);
}
