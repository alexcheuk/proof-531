/**
 * 5/3/1 working-set schemes.
 *
 * Pure domain — no React, no async, no DB.
 * Ported from `the PWA reference`.
 */

import type { Week } from './types';

export type SetKind = 'warmup' | 'working' | 'amrap' | 'bbb' | 'assistance' | 'tm-test';

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
  // Week 4 is the 7th-Week-Protocol TM test (Forever 5/3/1): a single set at
  // 100% TM with a 3–5 rep target. Replaces the classic Wendler deload. See
  // `_workspace/01_design_spec.md` and `docs/INTENT.md` for the rationale.
  4: [{ pct: 1.0, reps: 5, kind: 'tm-test' }],
};

/**
 * Returns the working-set scheme for a 5/3/1 week. Fresh array per call.
 *
 * Length contract:
 *   - Weeks 1–3 → 3 sets (two working + one AMRAP top set).
 *   - Week 4 → 1 set (the TM-test set; replaces the legacy deload triple).
 *
 * Code paths that destructure `prescription(week)[0..2]` MUST narrow on the
 * week first or route week-4 through {@link tmTestSet} instead.
 */
export function prescription(week: Week): WorkingSet[] {
  return WEEK_SETS[week].map((s) => ({ ...s }));
}

/**
 * The Week-4 TM test set spec. Single set at 100% TM, prescribed reps = 5
 * (top of the 3–5 band). Use this in week-4 code paths instead of
 * `prescription(4)[0]` so the intent is explicit at the call site.
 */
export function tmTestSet(): WorkingSet {
  // WEEK_SETS[4] is length 1 by construction; spread defensively.
  const s = WEEK_SETS[4][0];
  if (!s) throw new Error('tmTestSet: week-4 prescription is empty');
  return { ...s };
}

/**
 * Thin lookup for a single working set by (week, index). Throws on out-of-range.
 *
 * Week 4 has a single set (the TM test); calling with index 1 or 2 on week 4
 * throws. Callers in week-4 code paths should prefer {@link tmTestSet}.
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
 * Lowest non-completed working-set index for the given week, or null if all
 * required sets are done. Defensive against duplicates and indices outside
 * the working-set range.
 *
 * Week 4 has a single set (index 0); supplying any week-1–3 list is identical
 * to the previous 3-set contract.
 *
 * If `week` is omitted, falls back to the legacy 3-set behavior — call sites
 * that already pass week-aware data should pass `week` so the function knows
 * how many slots to expect.
 */
export function nextWorkingSetIndex(
  completedIndices: number[],
  week?: Week,
): WorkingSetIndex | null {
  const done = new Set(completedIndices);
  const slots: readonly WorkingSetIndex[] = week === 4 ? [0] : [0, 1, 2];
  for (const i of slots) {
    if (!done.has(i)) return i;
  }
  return null;
}

/** True iff the (week, setIndex) position carries the AMRAP flag. */
export function isAmrapSet(week: Week, setIndex: WorkingSetIndex): boolean {
  // Week 4 only has the TM test set at index 0; index 1/2 don't exist.
  if (week === 4) return false;
  return getWorkingSetByIndex(week, setIndex).amrap === true;
}

/** True iff the (week, setIndex) position is the TM test set. */
export function isTmTestSet(week: Week, setIndex: WorkingSetIndex): boolean {
  if (week !== 4) return false;
  return setIndex === 0;
}

/** Boring But Big: 5×10 at `pct` of training max (default 50%). */
export function bbbSets(pct = 0.5): WorkingSet[] {
  return Array.from({ length: 5 }, () => ({ pct, reps: 10, kind: 'bbb' as const }));
}
