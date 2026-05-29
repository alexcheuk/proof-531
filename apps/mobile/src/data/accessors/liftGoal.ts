// Zero rows per lift = no goal set. Stored in storage units; render boundary converts to display units.
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift, Unit } from '../../domain/types';
import { liftGoals } from '../drizzle/schema';

// biome-ignore lint/suspicious/noExplicitAny: structural typing for cross-driver drizzle
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type LiftGoalKind = 'tm' | '1rm';
export type LiftGoal = typeof liftGoals.$inferSelect;

export async function getLiftGoal(db: AnyDb, lift: Lift): Promise<LiftGoal | null> {
  const rows = (await Promise.resolve(
    db.select().from(liftGoals).where(eq(liftGoals.lift, lift)),
  )) as LiftGoal[];
  return rows[0] ?? null;
}

export async function getLiftGoals(db: AnyDb): Promise<LiftGoal[]> {
  return (await Promise.resolve(db.select().from(liftGoals))) as LiftGoal[];
}

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

export async function clearLiftGoal(db: AnyDb, lift: Lift): Promise<void> {
  await Promise.resolve(db.delete(liftGoals).where(eq(liftGoals.lift, lift)));
}

export async function setLiftGoalDaysPerWeek(
  db: AnyDb,
  lift: Lift,
  daysPerWeek: number | null,
): Promise<void> {
  await Promise.resolve(
    db
      .update(liftGoals)
      .set({ daysPerWeek, updatedAt: Date.now() })
      .where(eq(liftGoals.lift, lift)),
  );
}
