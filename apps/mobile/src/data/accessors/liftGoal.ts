/**
 * Per-lift goal accessors.
 *
 * The `lift_goals` table holds at most one row per lift (lift is PK). Zero
 * rows = "no goal set" — the Progress screen's empty/unset state. Stored
 * in storage units to match `trainingMaxes`; the render boundary converts
 * to the user's display unit at read time.
 *
 * A goal carries a `kind`:
 *   - `'tm'`  — target training max
 *   - `'1rm'` — target estimated one-rep max (TM ≈ 0.9 × 1RM)
 *
 * `setLiftGoal` is an upsert (ON CONFLICT lift). `clearLiftGoal` deletes
 * the row entirely so the next read returns `null`.
 */
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift, Unit } from '../../domain/types';
import { liftGoals } from '../drizzle/schema';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type LiftGoalKind = 'tm' | '1rm';
export type LiftGoal = typeof liftGoals.$inferSelect;

/** Read a single lift's goal, or `null` if none has been set. */
export async function getLiftGoal(db: AnyDb, lift: Lift): Promise<LiftGoal | null> {
  const rows = (await Promise.resolve(
    db.select().from(liftGoals).where(eq(liftGoals.lift, lift)),
  )) as LiftGoal[];
  return rows[0] ?? null;
}

/** Read every persisted lift goal (one row per lift, or none). */
export async function getLiftGoals(db: AnyDb): Promise<LiftGoal[]> {
  return (await Promise.resolve(db.select().from(liftGoals))) as LiftGoal[];
}

/**
 * Upsert a goal for the given lift. The PK is `lift`, so this either
 * inserts a fresh row or updates the existing target via
 * `ON CONFLICT(lift) DO UPDATE`. Returns the persisted row.
 */
export async function setLiftGoal(
  db: AnyDb,
  lift: Lift,
  kind: LiftGoalKind,
  targetValue: number,
  unit: Unit,
): Promise<LiftGoal> {
  const updatedAt = Date.now();
  const row = { lift, kind, targetValue, unit, updatedAt };
  const inserted = (await Promise.resolve(
    db
      .insert(liftGoals)
      .values(row)
      .onConflictDoUpdate({
        target: liftGoals.lift,
        set: { kind, targetValue, unit, updatedAt },
      })
      .returning(),
  )) as LiftGoal[];
  const result = inserted[0];
  if (!result) throw new Error('setLiftGoal: insert returned no row');
  return result;
}

/** Remove the goal for a lift (idempotent — no-op if no row exists). */
export async function clearLiftGoal(db: AnyDb, lift: Lift): Promise<void> {
  await Promise.resolve(db.delete(liftGoals).where(eq(liftGoals.lift, lift)));
}
