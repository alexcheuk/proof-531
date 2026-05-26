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
 * Transactional trade-off: the PWA wraps `seedDefaultSettings` /
 * `updateSettings` in Dexie transactions. drizzle-orm's
 * `db.transaction((tx) => ...)` exists but its typing varies across drivers and
 * we'd need to thread the tx through `setTrainingMax` / `getCurrentTrainingMaxes`
 * (which take `AnyDb`, not the more specific tx type). Since the mobile DB is
 * single-writer (JS event loop, no concurrent expo-sqlite writers in practice)
 * we skip the wrapper. Each call's reads/writes are still sequential.
 *
 * NOTE: the `currentCycle` / `week` / `day` columns on this table are
 * **legacy** — the per-lift split (see `liftProgress.ts`) is the source of
 * truth for cycle/week now. These columns survive only to seed new
 * `lift_progress` rows on first read for users upgrading from the
 * single-cycle build.
 */
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
    restTargetSeconds: s.restTargetSeconds,
    bbbRestTargetSeconds: s.bbbRestTargetSeconds,
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
    restTargetSeconds: row.restTargetSeconds,
    bbbRestTargetSeconds: row.bbbRestTargetSeconds,
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
  // Single read — the prior version called selectSingleton twice on every
  // patch.
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

/**
 * Flip the *display* unit without touching any persisted weights. Safe to call
 * any time — render sites convert via `displayWeight()` on the fly. Distinct
 * from `migrateStorageUnit`, which rewrites TM rows.
 */
export async function setDisplayUnit(db: AnyDb, unit: Unit): Promise<Settings> {
  return updateSettings(db, { displayUnit: unit });
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
