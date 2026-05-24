/**
 * 5/3/1 working-set schemes.
 *
 * Pure domain — no React, no async, no DB.
 * Ported from `~/Development/531-pwa/src/features/session/domain/schemes.ts`.
 */

import type { Lift, Unit, Week } from './types';
import { round } from './units';

/**
 * Shape of a row queued for `appendSetLog` — the subset of fields a pure
 * domain helper can populate. `completedAt`, `isPR`, `estimated1RM`, and the
 * row id are added by the data layer.
 */
export type AppendSetLogInput = {
  sessionId: number;
  index: number;
  kind: SetKind;
  prescribedWeight: number;
  prescribedReps: number;
  actualReps: number;
};

export type SetKind = 'warmup' | 'working' | 'amrap' | 'bbb' | 'assistance';

export type WorkingSet = {
  pct: number;
  reps: number;
  amrap?: boolean;
  kind: SetKind;
};

export type PlanEntry = {
  kind: SetKind;
  prescribedWeight: number;
  prescribedReps: number;
  amrap?: boolean;
};

/** Valid working-set indices on Today / Live: 0, 1, 2. */
export type WorkingSetIndex = 0 | 1 | 2;

/**
 * 5/3/1 warmups: 40/50/60% × 5/5/3. Applied to every session.
 */
export const WARMUPS: readonly WorkingSet[] = [
  { pct: 0.4, reps: 5, kind: 'warmup' },
  { pct: 0.5, reps: 5, kind: 'warmup' },
  { pct: 0.6, reps: 3, kind: 'warmup' },
];

const WEEK_SETS: Record<Week, readonly WorkingSet[]> = {
  1: [
    { pct: 0.65, reps: 5, kind: 'working' },
    { pct: 0.75, reps: 5, kind: 'working' },
    { pct: 0.85, reps: 5, amrap: true, kind: 'amrap' },
  ],
  2: [
    { pct: 0.7, reps: 3, kind: 'working' },
    { pct: 0.8, reps: 3, kind: 'working' },
    { pct: 0.9, reps: 3, amrap: true, kind: 'amrap' },
  ],
  3: [
    { pct: 0.75, reps: 5, kind: 'working' },
    { pct: 0.85, reps: 3, kind: 'working' },
    { pct: 0.95, reps: 1, amrap: true, kind: 'amrap' },
  ],
  4: [
    { pct: 0.4, reps: 5, kind: 'working' },
    { pct: 0.5, reps: 5, kind: 'working' },
    { pct: 0.6, reps: 5, kind: 'working' },
  ],
};

/** Returns the 3-set working scheme for a 5/3/1 week. Fresh array per call. */
export function prescription(week: Week): WorkingSet[] {
  return WEEK_SETS[week].map((s) => ({ ...s }));
}

/** Alias preserving PWA naming for callers porting verbatim. */
export const setsForWeek = prescription;

/**
 * Thin lookup for a single working set by (week, index). Throws on out-of-range.
 */
export function getWorkingSetByIndex(week: Week, setIndex: WorkingSetIndex): WorkingSet {
  if (setIndex !== 0 && setIndex !== 1 && setIndex !== 2) {
    throw new RangeError(`getWorkingSetByIndex: setIndex must be 0|1|2, got ${setIndex}`);
  }
  const set = prescription(week)[setIndex];
  if (!set) {
    throw new RangeError(`getWorkingSetByIndex: missing set at week=${week} index=${setIndex}`);
  }
  return set;
}

/**
 * Lowest non-completed index in {0,1,2}, or null if all three are done.
 * Defensive against duplicates and indices outside the working-set range.
 */
export function nextWorkingSetIndex(completedIndices: number[]): WorkingSetIndex | null {
  const done = new Set(completedIndices);
  for (const i of [0, 1, 2] as const) {
    if (!done.has(i)) return i;
  }
  return null;
}

/** True iff the (week, setIndex) position carries the AMRAP flag. */
export function isAmrapSet(week: Week, setIndex: WorkingSetIndex): boolean {
  return getWorkingSetByIndex(week, setIndex).amrap === true;
}

/** Boring But Big: 5×10 at `pct` of training max (default 50%). */
export function bbbSets(pct = 0.5): WorkingSet[] {
  return Array.from({ length: 5 }, () => ({ pct, reps: 10, kind: 'bbb' as const }));
}

/**
 * Plan for the session that comes after the one the user just finished.
 *
 * Lift order wraps within `enabledLifts`; week wraps from 4 to 1. The `day`
 * field is the 1-based position of `lift` within the cycle (1..enabledLifts.length).
 *
 * If `currentLift` is not in `enabledLifts` (defensive — the user could have
 * disabled it mid-cycle), `liftPos` falls back to 0 so the next position is
 * `enabledLifts[1] ?? enabledLifts[0]` without crashing.
 */
export function nextSessionPlan(
  currentLift: Lift,
  enabledLifts: readonly Lift[],
  currentWeek: Week,
): {
  lift: Lift;
  week: Week;
  day: number;
  topPct: number;
  topReps: number;
  amrap: boolean;
} {
  if (enabledLifts.length === 0) {
    throw new RangeError('nextSessionPlan: enabledLifts must be non-empty');
  }
  const idx = enabledLifts.indexOf(currentLift);
  const liftPos = idx < 0 ? 0 : idx;
  const nextPos = (liftPos + 1) % enabledLifts.length;
  const wrapWeek = nextPos === 0;
  const nextWeekRaw = wrapWeek ? currentWeek + 1 : currentWeek;
  const nextWeek = (nextWeekRaw > 4 ? 1 : nextWeekRaw) as Week;
  // biome-ignore lint/style/noNonNullAssertion: nextPos in [0, enabledLifts.length)
  const nextLift = enabledLifts[nextPos]!;
  const topSet = prescription(nextWeek)[2];
  if (!topSet) {
    throw new RangeError(`nextSessionPlan: prescription(${nextWeek}) missing top set`);
  }
  return {
    lift: nextLift,
    week: nextWeek,
    day: nextPos + 1,
    topPct: topSet.pct,
    topReps: topSet.reps,
    amrap: topSet.amrap === true,
  };
}

/**
 * Returns 5 `AppendSetLogInput`-shaped rows ready to be written for a BBB
 * session. Each row uses `kind: 'bbb'`, `index = 100 + i`, `actualReps = 10`,
 * `prescribedReps = 10`, and `prescribedWeight = round(tmStorage * pct, storageUnit)`.
 *
 * Convention-only: `index ≥ 100` keeps BBB rows past working-set indices for
 * easy filtering. Default pct = 0.5 matches `bbbSets`.
 */
export function bbbPlanRows(
  sessionId: number,
  tmStorage: number,
  storageUnit: Unit,
  pct = 0.5,
): AppendSetLogInput[] {
  const weight = round(tmStorage * pct, storageUnit);
  return Array.from({ length: 5 }, (_unused, i) => ({
    sessionId,
    index: 100 + i,
    kind: 'bbb' as const,
    prescribedWeight: weight,
    prescribedReps: 10,
    actualReps: 10,
  }));
}
