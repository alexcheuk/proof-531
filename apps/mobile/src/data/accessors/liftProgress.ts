// Rows are seeded lazily from legacy settings.currentCycle/week so users upgrading from the pre-split build
// land on the same cycle/day they left off. After the first call the row is the source of truth.
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
