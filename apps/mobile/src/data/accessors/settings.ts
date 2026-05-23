/**
 * Settings accessors.
 *
 * Mirrors the PWA accessors at `~/Development/531-pwa/src/db/accessors/settings.ts`.
 * The `settings` table is a **singleton** — `id` is always 1. The `enabled_lifts`
 * column is stored as JSON-encoded TEXT and round-tripped via `toRow` / `fromRow`.
 *
 * Accessors take a Drizzle db handle as the first argument so tests can inject
 * a better-sqlite3-backed db while production callers pass the expo-sqlite-backed
 * `db` from `../drizzle/client`. The Drizzle query API is identical across drivers.
 *
 * Transactional trade-off: the PWA wraps `advanceCycle` / `advanceDay` /
 * `seedDefaultSettings` / `updateSettings` in Dexie transactions. drizzle-orm's
 * `db.transaction((tx) => ...)` exists but its typing varies across drivers and
 * we'd need to thread the tx through `setTrainingMax` / `getCurrentTrainingMaxes`
 * (which take `AnyDb`, not the more specific tx type). Since the mobile DB is
 * single-writer (JS event loop, no concurrent expo-sqlite writers in practice)
 * we skip the wrapper. Each call's reads/writes are still sequential.
 */
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { tmIncrement } from '../../domain/increments';
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
import { type TrainingMax, getCurrentTrainingMaxes, setTrainingMax } from './trainingMax';

// Structural-poly across sqlite drivers — see trainingMax.ts for rationale.
// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

type SettingsRow = typeof settings.$inferSelect;
type SettingsInsert = typeof settings.$inferInsert;

/** Encode `Settings` for persistence (stringifies `enabledLifts`). */
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
  };
}

/** Decode a row from the `settings` table back to the in-memory shape. */
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
  };
}

async function selectSingleton(db: AnyDb): Promise<Settings | undefined> {
  const rows = (await Promise.resolve(
    db.select().from(settings).where(eq(settings.id, 1)).limit(1),
  )) as SettingsRow[];
  const row = rows[0];
  return row ? fromRow(row) : undefined;
}

/**
 * Read the singleton settings row, seeding defaults on first call. The row is
 * keyed at `id: 1` (singleton idiom).
 */
export async function getSettings(db: AnyDb): Promise<Settings> {
  const existing = await selectSingleton(db);
  if (existing) return existing;
  return seedDefaultSettings(db);
}

/**
 * Insert the default settings row if one does not already exist. Safe to call
 * on every app boot (idempotent).
 */
export async function seedDefaultSettings(db: AnyDb): Promise<Settings> {
  const existing = await selectSingleton(db);
  if (existing) return existing;
  const row: Settings = { id: 1, ...DEFAULT_SETTINGS };
  await Promise.resolve(db.insert(settings).values(toRow(row)));
  return row;
}

/**
 * Patch the singleton settings row. The `id: 1` field is always preserved.
 * Seeds defaults first if the row does not yet exist.
 */
export async function updateSettings(
  db: AnyDb,
  patch: Partial<Omit<Settings, 'id'>>,
): Promise<Settings> {
  const current = (await selectSingleton(db)) ?? { id: 1 as const, ...DEFAULT_SETTINGS };
  const next: Settings = { ...current, ...patch, id: 1 };
  const existing = await selectSingleton(db);
  if (existing) {
    await Promise.resolve(db.update(settings).set(toRow(next)).where(eq(settings.id, 1)));
  } else {
    await Promise.resolve(db.insert(settings).values(toRow(next)));
  }
  return next;
}

/**
 * Flip the *display* unit without touching any persisted weights. Safe to call
 * any time — render sites convert via `displayWeight()` on the fly. Distinct
 * from `migrateStorageUnit`, which rewrites TM rows.
 */
export async function setDisplayUnit(db: AnyDb, unit: Unit): Promise<Settings> {
  return updateSettings(db, { displayUnit: unit });
}

/**
 * Advance to the next training day, wrapping into the next week / cycle.
 * Called after a session is completed.
 */
export async function advanceDay(db: AnyDb): Promise<Settings> {
  const current = await getSettings(db);
  const enabledCount = current.enabledLifts.length || 4;
  const nextDayRaw = current.day + 1;
  if (nextDayRaw <= enabledCount) {
    return updateSettings(db, { day: nextDayRaw as Day });
  }
  // Wrap day → 1, advance week.
  const nextWeekRaw = current.week + 1;
  if (nextWeekRaw <= 4) {
    return updateSettings(db, { day: 1, week: nextWeekRaw as Week });
  }
  // Wrap week → 1, advance cycle (bumps TMs).
  return advanceCycle(db);
}

/**
 * Advance the cycle counter and bump every enabled lift's TM per the 5/3/1
 * progression rules (+5 lbs / +2.5 kg upper body; +10 lbs / +5 kg lower body).
 * Bumps are appended to the training_maxes history (never overwrite).
 */
export async function advanceCycle(db: AnyDb): Promise<Settings> {
  const current = await getSettings(db);
  const tms = await getCurrentTrainingMaxes(db);
  for (const lift of current.enabledLifts) {
    const tm = tms.find((t) => t.lift === lift);
    if (!tm) continue;
    // Bump is denominated in the row's own unit, not the live Settings unit —
    // an lb-historical TM keeps bumping in lb even after the user toggled
    // display to kg.
    const bump = tmIncrement(tm.unit, lift);
    await setTrainingMax(db, lift, tm.value + bump, tm.unit);
  }
  return updateSettings(db, {
    currentCycle: current.currentCycle + 1,
    week: 1,
    day: 1,
  });
}

/**
 * Convenience: compute a TM from a 1RM (90 %, snapped to the unit's step) and
 * append it to the training_maxes history.
 */
export async function setTrainingMaxFromOneRM(
  db: AnyDb,
  lift: Lift,
  oneRM: number,
  unit: Unit,
): Promise<TrainingMax> {
  return setTrainingMax(db, lift, trainingMaxFrom(oneRM, unit), unit);
}
