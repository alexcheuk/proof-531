/**
 * 5/3/1 working-set schemes.
 *
 * Pure domain — no React, no async, no DB.
 * Ported from `~/Development/531-pwa/src/features/session/domain/schemes.ts`.
 */

import type { Week } from './types';

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
