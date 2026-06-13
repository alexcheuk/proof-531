// No DB transaction: all oneRMs are validated up-front so the write loop can't be reached with
// invalid input  -  no partial-write window in normal use. (Disk-full between writes is accepted.)
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { Lift, Unit } from '../../domain/types';
import { trainingMaxFrom } from '../../domain/units';
import { trainingMaxes } from '../drizzle/schema';
import { updateSettings } from './settings';

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

  await updateSettings(db, {
    storageUnit: input.unit,
    displayUnit: input.unit,
    enabledLifts: input.enabledLifts,
  });

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
