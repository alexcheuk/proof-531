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

export const WARMUPS: readonly WorkingSet[] = [
  { pct: 0.4, reps: 5, kind: 'warmup' },
  { pct: 0.5, reps: 5, kind: 'warmup' },
  { pct: 0.6, reps: 3, kind: 'warmup' },
];

const WARMUPS_BY_WEEK: Record<Week, readonly WorkingSet[]> = {
  // D1 top set 85%: last warmup 60%, bridges within 25%.
  1: WARMUPS,
  // D2 top set 90%: last warmup 65%, bridges within 25%.
  2: [
    { pct: 0.45, reps: 5, kind: 'warmup' },
    { pct: 0.55, reps: 5, kind: 'warmup' },
    { pct: 0.65, reps: 3, kind: 'warmup' },
  ],
  // D3 top set 95%: four-step ramp, last warmup 80%, bridges within 15%.
  3: [
    { pct: 0.5, reps: 5, kind: 'warmup' },
    { pct: 0.6, reps: 3, kind: 'warmup' },
    { pct: 0.7, reps: 2, kind: 'warmup' },
    { pct: 0.8, reps: 1, kind: 'warmup' },
  ],
  // D4 TM test 100%: five-step ramp, last warmup 90%, bridges within 10%.
  4: [
    { pct: 0.5, reps: 5, kind: 'warmup' },
    { pct: 0.6, reps: 3, kind: 'warmup' },
    { pct: 0.7, reps: 2, kind: 'warmup' },
    { pct: 0.8, reps: 1, kind: 'warmup' },
    { pct: 0.9, reps: 1, kind: 'warmup' },
  ],
};

/** Per-day warmup ramp that bridges to each day's top set. Returns a fresh array. */
export function warmupsForDay(week: Week): WorkingSet[] {
  return WARMUPS_BY_WEEK[week].map((s) => ({ ...s }));
}

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
  // 100% TM with a 3–5 rep target. Replaces the classic Wendler deload.
  // See `docs/INTENT.md` for the rationale.
  4: [{ pct: 1.0, reps: 5, kind: 'tm-test' }],
};

// Week 4 returns a single set (the TM test); destructuring [0..2] on week 4 throws  -  use tmTestSet() instead.
export function prescription(week: Week): WorkingSet[] {
  return WEEK_SETS[week].map((s) => ({ ...s }));
}

export function tmTestSet(): WorkingSet {
  // WEEK_SETS[4] is length 1 by construction; spread defensively.
  const s = WEEK_SETS[4][0];
  if (!s) throw new Error('tmTestSet: week-4 prescription is empty');
  return { ...s };
}

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
