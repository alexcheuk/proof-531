// One row per lift for the missed-rep Program Correction feature. No row =
// missCount 0 (the empty state). Timestamps are ISO-8601 strings (TEXT).
import { eq, sql } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { missResetTm } from '../../domain/progression';
import type { Lift, Unit } from '../../domain/types';
import { liftMissState } from '../drizzle/schema';
import { getCurrentTrainingMaxes, setTrainingMax } from './trainingMax';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type LiftMissState = typeof liftMissState.$inferSelect;

export async function getMissState(db: AnyDb, lift: Lift): Promise<LiftMissState | null> {
  const rows = (await Promise.resolve(
    db.select().from(liftMissState).where(eq(liftMissState.lift, lift)),
  )) as LiftMissState[];
  return rows[0] ?? null;
}

/**
 * Upsert that increments `missCount` by 1: inserts with `missCount: 1` on the
 * first miss; on conflict, `miss_count = miss_count + 1`. Refreshes
 * `lastMissDate` and `updatedAt` to the current ISO strings. Returns the row.
 */
export async function recordMiss(db: AnyDb, lift: Lift): Promise<LiftMissState> {
  const now = new Date().toISOString();
  const inserted = (await Promise.resolve(
    db
      .insert(liftMissState)
      .values({ lift, missCount: 1, lastMissDate: now, updatedAt: now })
      .onConflictDoUpdate({
        target: liftMissState.lift,
        set: {
          missCount: sql`${liftMissState.missCount} + 1`,
          lastMissDate: now,
          updatedAt: now,
        },
      })
      .returning(),
  )) as LiftMissState[];
  const row = inserted[0];
  if (!row) throw new Error('recordMiss: upsert returned no row');
  return row;
}

/** Off-day / post-reset clear: deletes the row so the empty state is "no row". */
export async function clearMissState(db: AnyDb, lift: Lift): Promise<void> {
  await Promise.resolve(db.delete(liftMissState).where(eq(liftMissState.lift, lift)));
}

/**
 * The combined Apply operation: reads the current TM for the lift, computes the
 * 10% reset through the domain `missResetTm`, writes the new TM via
 * `setTrainingMax` (append-only TM history), then clears the miss state.
 * Returns the new TM and its storage unit. No inline weight math lives here:
 * the reset percentage and plate snapping are entirely in `missResetTm`.
 */
export async function applyMissReset(
  db: AnyDb,
  lift: Lift,
): Promise<{ newTm: number; unit: Unit }> {
  const tms = await getCurrentTrainingMaxes(db);
  const current = tms.find((t) => t.lift === lift);
  if (!current) throw new Error(`applyMissReset: no training max for ${lift}`);
  const unit = current.unit as Unit;
  const newTm = missResetTm(current.value, unit);
  await setTrainingMax(db, lift, newTm, unit);
  await clearMissState(db, lift);
  return { newTm, unit };
}
