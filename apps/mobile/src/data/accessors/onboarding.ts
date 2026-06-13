// No DB transaction: all oneRMs are validated up-front so the write loop can't be reached with
// invalid input  -  no partial-write window in normal use. (Disk-full between writes is accepted.)
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { DEFAULT_SETTINGS, type Lift, type Settings, type Unit } from '../../domain/types';
import { trainingMaxFrom } from '../../domain/units';
import { settings, trainingMaxes } from '../drizzle/schema';

// Structural-poly across sqlite drivers  -  see trainingMax.ts for rationale.
// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

type FinishOnboardingInput = {
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

  for (const lift of input.enabledLifts) {
    const oneRM = input.oneRMs[lift];
    if (oneRM == null || oneRM <= 0) {
      throw new Error(`completeOnboarding: missing oneRM for enabled lift '${lift}'`);
    }
  }

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
          bbbRestTargetSeconds: existing.bbbRestTargetSeconds,
          liveScreenInverted: !!existing.liveScreenInverted,
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
    bbbRestTargetSeconds: next.bbbRestTargetSeconds,
    liveScreenInverted: next.liveScreenInverted ? 1 : 0,
  };

  if (existing) {
    await Promise.resolve(db.update(settings).set(row).where(eq(settings.id, 1)));
  } else {
    await Promise.resolve(db.insert(settings).values(row));
  }

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
