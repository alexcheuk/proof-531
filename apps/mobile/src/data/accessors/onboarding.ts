/**
 * Onboarding accessor.
 *
 * Mirrors the PWA accessor at `~/Development/531-pwa/src/db/accessors/onboarding.ts`
 * (PWA name: `finishOnboarding`). Patches the singleton Settings row with the
 * user's chosen unit + enabled lifts, then appends one TrainingMax row per
 * enabled lift (TM = 90 % of the supplied 1RM, snapped to the unit step).
 *
 * Atomicity trade-off: the PWA wraps the whole operation in a Dexie `rw`
 * transaction so a mid-flight throw rolls back IndexedDB. drizzle-orm's
 * `db.transaction((tx) => ...)` exists but its typing varies across drivers
 * (better-sqlite3 vs expo-sqlite) and we'd need to thread `tx` through every
 * downstream call. Instead we validate every `oneRM` up-front before any
 * writes, so the only way to reach the write loop is with valid input — there
 * is no partial-write window in normal use. (Disk-full / SQLITE_FULL between
 * writes remains theoretically possible; we accept that risk on the mobile
 * single-writer DB.)
 */
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { DEFAULT_SETTINGS, type Lift, type Settings, type Unit } from '../../domain/types';
import { trainingMaxFrom } from '../../domain/units';
import { settings, trainingMaxes } from '../drizzle/schema';

// Structural-poly across sqlite drivers — see trainingMax.ts for rationale.
// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export type FinishOnboardingInput = {
  unit: Unit;
  /** Ordered subset of LIFT_ORDER, length 1..4. */
  enabledLifts: Lift[];
  /** One entry per enabled lift. Positive 1RM in `unit`. */
  oneRMs: Partial<Record<Lift, number>>;
};

export async function completeOnboarding(db: AnyDb, input: FinishOnboardingInput): Promise<void> {
  if (input.enabledLifts.length === 0) {
    throw new Error('completeOnboarding: enabledLifts must not be empty');
  }

  // Validate all oneRMs before any writes (so we don't partially commit on
  // single-driver setups without true transaction support).
  for (const lift of input.enabledLifts) {
    const oneRM = input.oneRMs[lift];
    if (oneRM == null || oneRM <= 0) {
      throw new Error(`completeOnboarding: missing oneRM for enabled lift '${lift}'`);
    }
  }

  // Read existing settings (if any), patch storage/display unit + enabledLifts.
  const existingRows = (await Promise.resolve(
    db.select().from(settings).where(eq(settings.id, 1)),
  )) as Array<typeof settings.$inferSelect>;
  const existing = existingRows[0];
  const next: Settings = {
    ...(existing
      ? {
          id: 1 as const,
          storageUnit: existing.storageUnit,
          displayUnit: existing.displayUnit,
          plateSet: existing.plateSet,
          enabledLifts: JSON.parse(existing.enabledLifts) as Lift[],
          currentCycle: existing.currentCycle,
          week: existing.week as Settings['week'],
          day: existing.day as Settings['day'],
          restTargetSeconds: existing.restTargetSeconds,
        }
      : { id: 1 as const, ...DEFAULT_SETTINGS }),
    storageUnit: input.unit,
    displayUnit: input.unit,
    enabledLifts: input.enabledLifts,
  };

  const row = {
    id: next.id,
    storageUnit: next.storageUnit,
    displayUnit: next.displayUnit,
    plateSet: next.plateSet,
    enabledLifts: JSON.stringify(next.enabledLifts),
    currentCycle: next.currentCycle,
    week: next.week,
    day: next.day,
    restTargetSeconds: next.restTargetSeconds,
  };

  if (existing) {
    await Promise.resolve(db.update(settings).set(row).where(eq(settings.id, 1)));
  } else {
    await Promise.resolve(db.insert(settings).values(row));
  }

  // Single `now` so all TM rows share an `updatedAt` (this is logically one tick).
  const now = Date.now();
  for (const lift of input.enabledLifts) {
    const oneRM = input.oneRMs[lift];
    if (oneRM == null) continue; // already validated above
    await Promise.resolve(
      db.insert(trainingMaxes).values({
        lift,
        value: trainingMaxFrom(oneRM, input.unit),
        unit: input.unit,
        updatedAt: now,
      }),
    );
  }
}
