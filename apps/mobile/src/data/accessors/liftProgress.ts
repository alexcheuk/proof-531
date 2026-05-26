/**
 * Per-lift progress accessors.
 *
 * Each lift owns its own (cycle, week) — completing a bench session
 * advances bench's progress without moving squat. Backed by the
 * `lift_progress` table; one row per lift.
 *
 * Rows are seeded lazily: the first call to `getLiftProgress(lift)` (or
 * `getAllLiftProgress`) inserts a row with the legacy global
 * `settings.currentCycle`/`settings.week` as initial values, so users
 * upgrading from the pre-split build land on the same cycle/day they
 * left off. After that the row is the source of truth.
 */
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { tmIncrement } from '../../domain/increments';
import type { Lift, Week } from '../../domain/types';
import { liftProgress } from '../drizzle/schema';
import { getSettings } from './settings';
import { getCurrentTrainingMaxes, setTrainingMax } from './trainingMax';

// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

type LiftProgress = {
  lift: Lift;
  currentCycle: number;
  week: Week;
  updatedAt: number;
};

type LiftProgressRow = typeof liftProgress.$inferSelect;

function fromRow(row: LiftProgressRow): LiftProgress {
  return {
    lift: row.lift,
    currentCycle: row.currentCycle,
    week: clampWeek(row.week),
    updatedAt: row.updatedAt,
  };
}

function clampWeek(w: number): Week {
  if (w <= 1) return 1;
  if (w === 2) return 2;
  if (w === 3) return 3;
  return 4;
}

async function selectRow(db: AnyDb, lift: Lift): Promise<LiftProgressRow | null> {
  const rows = (await Promise.resolve(
    db.select().from(liftProgress).where(eq(liftProgress.lift, lift)).limit(1),
  )) as LiftProgressRow[];
  return rows[0] ?? null;
}

/**
 * Get a lift's progress, seeding from the legacy global `settings` if no
 * row exists yet. Always returns a row.
 */
export async function getLiftProgress(db: AnyDb, lift: Lift): Promise<LiftProgress> {
  const existing = await selectRow(db, lift);
  if (existing) return fromRow(existing);
  const settings = await getSettings(db);
  const row: LiftProgressRow = {
    lift,
    currentCycle: settings.currentCycle,
    week: settings.week,
    updatedAt: Date.now(),
  };
  await Promise.resolve(db.insert(liftProgress).values(row));
  return fromRow(row);
}

/**
 * Return progress for every lift, seeding any missing rows from the legacy
 * global `settings`. Order matches the input `lifts` array; pass
 * `settings.enabledLifts` to mirror the user's training split.
 */
export async function getAllLiftProgress(
  db: AnyDb,
  lifts: readonly Lift[],
): Promise<LiftProgress[]> {
  const out: LiftProgress[] = [];
  for (const lift of lifts) {
    out.push(await getLiftProgress(db, lift));
  }
  return out;
}

/**
 * Advance a single lift's progress by one session.
 *
 *   - `week < 4` → bump week.
 *   - `week === 4` (deload just finished) → wrap to next cycle, week 1,
 *     and bump THIS lift's TM (only) per 5/3/1 progression rules.
 *
 * Bumps to other lifts' TMs never happen — that's the whole point of the
 * per-lift split.
 */
export async function advanceLift(db: AnyDb, lift: Lift): Promise<LiftProgress> {
  const current = await getLiftProgress(db, lift);
  const nextWeekRaw = current.week + 1;
  if (nextWeekRaw <= 4) {
    return updateLiftProgress(db, lift, {
      currentCycle: current.currentCycle,
      week: nextWeekRaw as Week,
    });
  }
  // Cycle wrap: bump THIS lift's TM, then reset week to 1 and advance cycle.
  const tms = await getCurrentTrainingMaxes(db);
  const tm = tms.find((t) => t.lift === lift);
  if (tm) {
    const bump = tmIncrement(tm.unit, lift);
    await setTrainingMax(db, lift, tm.value + bump, tm.unit);
  }
  return updateLiftProgress(db, lift, {
    currentCycle: current.currentCycle + 1,
    week: 1,
  });
}

async function updateLiftProgress(
  db: AnyDb,
  lift: Lift,
  patch: { currentCycle: number; week: Week },
): Promise<LiftProgress> {
  const updatedAt = Date.now();
  await Promise.resolve(
    db
      .update(liftProgress)
      .set({ currentCycle: patch.currentCycle, week: patch.week, updatedAt })
      .where(eq(liftProgress.lift, lift)),
  );
  return { lift, currentCycle: patch.currentCycle, week: patch.week, updatedAt };
}
