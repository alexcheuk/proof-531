// settings.currentCycle / week / day are legacy columns — liftProgress.ts is now the source
// of truth. They survive only to seed lift_progress rows for users upgrading from the
// single-cycle build.
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import {
  DEFAULT_SETTINGS,
  type Day,
  type Lift,
  type Settings,
  type Unit,
  type Week,
} from '../../domain/types';
import { trainingMaxFrom } from '../../domain/units';
import { settings } from '../drizzle/schema';
import { type TrainingMax, setTrainingMax } from './trainingMax';

// Structural-poly across sqlite drivers — see trainingMax.ts for rationale.
// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

type SettingsRow = typeof settings.$inferSelect;
type SettingsInsert = typeof settings.$inferInsert;

function toRow(s: Settings): SettingsInsert {
  return {
    id: s.id,
    storageUnit: s.storageUnit,
    displayUnit: s.displayUnit,
    plateSet: s.plateSet,
    enabledLifts: JSON.stringify(s.enabledLifts),
    currentCycle: s.currentCycle,
    week: s.week,
    day: s.day,
    restTargetSeconds: s.restTargetSeconds,
    bbbRestTargetSeconds: s.bbbRestTargetSeconds,
    // Drizzle's column type for this is INTEGER NOT NULL (no `mode:
    // 'boolean'`) so we round-trip the flag as 0/1 ourselves.
    liveScreenInverted: s.liveScreenInverted ? 1 : 0,
  };
}

function fromRow(row: SettingsRow): Settings {
  return {
    id: 1,
    storageUnit: row.storageUnit,
    displayUnit: row.displayUnit,
    plateSet: row.plateSet,
    enabledLifts: JSON.parse(row.enabledLifts) as Lift[],
    currentCycle: row.currentCycle,
    week: row.week as Week,
    day: row.day as Day,
    restTargetSeconds: row.restTargetSeconds,
    bbbRestTargetSeconds: row.bbbRestTargetSeconds,
    liveScreenInverted: !!row.liveScreenInverted,
  };
}

async function selectSingleton(db: AnyDb): Promise<Settings | undefined> {
  const rows = (await Promise.resolve(
    db.select().from(settings).where(eq(settings.id, 1)).limit(1),
  )) as SettingsRow[];
  const row = rows[0];
  return row ? fromRow(row) : undefined;
}

export async function getSettings(db: AnyDb): Promise<Settings> {
  const existing = await selectSingleton(db);
  if (existing) return existing;
  return seedDefaultSettings(db);
}

export async function seedDefaultSettings(db: AnyDb): Promise<Settings> {
  const existing = await selectSingleton(db);
  if (existing) return existing;
  const row: Settings = { id: 1, ...DEFAULT_SETTINGS };
  await Promise.resolve(db.insert(settings).values(toRow(row)));
  return row;
}

export async function updateSettings(
  db: AnyDb,
  patch: Partial<Omit<Settings, 'id'>>,
): Promise<Settings> {
  const current = await selectSingleton(db);
  const base = current ?? { id: 1 as const, ...DEFAULT_SETTINGS };
  const next: Settings = { ...base, ...patch, id: 1 };
  if (current) {
    await Promise.resolve(db.update(settings).set(toRow(next)).where(eq(settings.id, 1)));
  } else {
    await Promise.resolve(db.insert(settings).values(toRow(next)));
  }
  return next;
}

// Distinct from migrateStorageUnit which rewrites TM rows — this only changes the display conversion.
export async function setDisplayUnit(db: AnyDb, unit: Unit): Promise<Settings> {
  return updateSettings(db, { displayUnit: unit });
}

export async function setTrainingMaxFromOneRM(
  db: AnyDb,
  lift: Lift,
  oneRM: number,
  unit: Unit,
): Promise<TrainingMax> {
  return setTrainingMax(db, lift, trainingMaxFrom(oneRM, unit), unit);
}
