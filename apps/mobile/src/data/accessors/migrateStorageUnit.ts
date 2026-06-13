// TM history is append-only (PD-04 invariant)  -  new rows are INSERTed, never mutated.
// The whole operation runs inside a raw BEGIN/COMMIT so a mid-flight crash can't leave a
// hybrid state (some TMs in the new unit, settings.storageUnit still naming the old one).
// Falls back to sequential writes when the driver doesn't expose execSync/exec (test handles).
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Unit } from '../../domain/types';
import { convertAndSnap, convertWeight } from '../../domain/units';
import { prs, trainingMaxes } from '../drizzle/schema';
import { getSettings, updateSettings } from './settings';
import { getCurrentTrainingMaxes } from './trainingMax';

// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

// Reach the underlying driver via the same shape runMigrations uses (execSync for expo-sqlite,
// exec for better-sqlite3). Returns false when neither is available  -  caller falls back to
// sequential writes.
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
    // prs.bestE1RM has no unit column  -  it's bare numbers in whatever storage unit was active
    // when the AMRAP set was logged. Converting them all keeps pickBestLift's numeric > honest:
    // without this, a 100 kg PR (stored as 100) would lose to a 220 lb PR (stored as 220).
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
