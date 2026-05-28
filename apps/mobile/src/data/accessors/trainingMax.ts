/**
 * Training-max accessors.
 *
 * Mirrors the PWA accessors.
 * TM history is **append-only** per locked planner decision — `setTrainingMax`
 * always INSERTs a new row, never overwrites an existing one. The "current" TM
 * for a lift is the most recently inserted row for that lift.
 *
 * Accessors take a Drizzle db handle as the first argument so tests can inject
 * a better-sqlite3-backed db (see `__tests__/trainingMax.test.ts`) while
 * production callers pass the expo-sqlite-backed `db` from `../drizzle/client`.
 * The Drizzle query API is identical across drivers.
 */
import { desc, eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift, Unit } from '../../domain/types';
import { trainingMaxes } from '../drizzle/schema';

// Drizzle's BaseSQLiteDatabase generic params vary by driver (expo-sqlite vs
// better-sqlite3); this structural-poly accessor only needs the common
// `.insert` / `.select` surface which is identical across drivers.
// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type TrainingMax = typeof trainingMaxes.$inferSelect;

/** Append a new TrainingMax row. Never overwrites. Returns the persisted row with id populated. */
export async function setTrainingMax(
  db: AnyDb,
  lift: Lift,
  value: number,
  unit: Unit,
): Promise<TrainingMax> {
  const updatedAt = Date.now();
  const inserted = await Promise.resolve(
    db.insert(trainingMaxes).values({ lift, value, unit, updatedAt }).returning(),
  );
  const row = (inserted as TrainingMax[])[0];
  if (!row) throw new Error('setTrainingMax: insert returned no row');
  return row;
}

/**
 * Return the latest TrainingMax row per lift (one row per lift, or zero rows
 * if a lift has never been set). Used by the onboarding gate, by createSession
 * to take a snapshot, and by Settings UIs.
 */
export async function getCurrentTrainingMaxes(db: AnyDb): Promise<TrainingMax[]> {
  const allRows = (await Promise.resolve(
    db.select().from(trainingMaxes).orderBy(desc(trainingMaxes.updatedAt), desc(trainingMaxes.id)),
  )) as TrainingMax[];
  const seen = new Set<Lift>();
  const out: TrainingMax[] = [];
  for (const row of allRows) {
    const lift = row.lift as Lift;
    if (seen.has(lift)) continue;
    seen.add(lift);
    out.push(row);
  }
  return out;
}

/** Full append-history for a single lift, newest first. */
export async function getTrainingMaxHistory(db: AnyDb, lift: Lift): Promise<TrainingMax[]> {
  const rows = await Promise.resolve(
    db
      .select()
      .from(trainingMaxes)
      .where(eq(trainingMaxes.lift, lift))
      .orderBy(desc(trainingMaxes.updatedAt), desc(trainingMaxes.id)),
  );
  return rows as TrainingMax[];
}
