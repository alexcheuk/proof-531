import { fc, it as itProp } from '@fast-check/jest';
import {
  bbbPlanRows,
  bbbSets,
  getWorkingSetByIndex,
  isAmrapSet,
  nextSessionPlan,
  nextWorkingSetIndex,
  prescription,
} from '../schemes';
import type { Lift, Week } from '../types';

describe('prescription', () => {
  it('week 1: 65/75/85 × 5/5/5+', () => {
    const sets = prescription(1);
    expect(sets).toHaveLength(3);
    expect(sets.map((s) => s.pct)).toEqual([0.65, 0.75, 0.85]);
    expect(sets.map((s) => s.reps)).toEqual([5, 5, 5]);
    expect(sets[2]?.amrap).toBe(true);
  });

  it('week 2: 70/80/90 × 3/3/3+', () => {
    const sets = prescription(2);
    expect(sets.map((s) => s.pct)).toEqual([0.7, 0.8, 0.9]);
    expect(sets.map((s) => s.reps)).toEqual([3, 3, 3]);
    expect(sets[2]?.amrap).toBe(true);
  });

  it('week 3: 75/85/95 × 5/3/1+', () => {
    const sets = prescription(3);
    expect(sets.map((s) => s.pct)).toEqual([0.75, 0.85, 0.95]);
    expect(sets.map((s) => s.reps)).toEqual([5, 3, 1]);
    expect(sets[2]?.amrap).toBe(true);
  });

  it('week 4 deload: 40/50/60 × 5/5/5, NO amrap', () => {
    const sets = prescription(4);
    expect(sets.map((s) => s.pct)).toEqual([0.4, 0.5, 0.6]);
    expect(sets.map((s) => s.reps)).toEqual([5, 5, 5]);
    expect(sets.every((s) => !s.amrap)).toBe(true);
  });

  it('returns fresh array — mutation does not leak', () => {
    const a = prescription(1);
    const first = a[0];
    if (first) first.pct = 0;
    expect(prescription(1)[0]?.pct).toBe(0.65);
  });
});

describe('isAmrapSet', () => {
  it('true for index 2 on weeks 1–3', () => {
    expect(isAmrapSet(1, 2)).toBe(true);
    expect(isAmrapSet(2, 2)).toBe(true);
    expect(isAmrapSet(3, 2)).toBe(true);
  });
  it('false everywhere on week 4', () => {
    expect(isAmrapSet(4, 0)).toBe(false);
    expect(isAmrapSet(4, 1)).toBe(false);
    expect(isAmrapSet(4, 2)).toBe(false);
  });
});

describe('nextWorkingSetIndex', () => {
  it('returns the lowest non-completed index', () => {
    expect(nextWorkingSetIndex([])).toBe(0);
    expect(nextWorkingSetIndex([0])).toBe(1);
    expect(nextWorkingSetIndex([0, 1])).toBe(2);
    expect(nextWorkingSetIndex([0, 1, 2])).toBeNull();
  });
});

describe('getWorkingSetByIndex', () => {
  it('throws on invalid index', () => {
    expect(() => getWorkingSetByIndex(1, 3 as 0)).toThrow(RangeError);
  });
});

describe('bbbSets', () => {
  it('returns 5x10 at default 50%', () => {
    const sets = bbbSets();
    expect(sets).toHaveLength(5);
    expect(sets.every((s) => s.reps === 10 && s.pct === 0.5)).toBe(true);
  });
  it('uses custom pct', () => {
    expect(bbbSets(0.6)[0]?.pct).toBe(0.6);
  });
});

describe('nextSessionPlan', () => {
  const allLifts: Lift[] = ['squat', 'bench', 'deadlift', 'press'];

  it('advances within the current week to the next enabled lift', () => {
    const plan = nextSessionPlan('squat', allLifts, 1);
    expect(plan.lift).toBe('bench');
    expect(plan.week).toBe(1);
  });

  it('wraps the lift order and advances the week at the last lift', () => {
    const plan = nextSessionPlan('press', allLifts, 1);
    expect(plan.lift).toBe('squat');
    expect(plan.week).toBe(2);
  });

  it('wraps the week from 4 back to 1', () => {
    const plan = nextSessionPlan('press', allLifts, 4);
    expect(plan.lift).toBe('squat');
    expect(plan.week).toBe(1);
  });

  it('reads the top-set prescription from the next week', () => {
    // Squat → Bench, still week 1 → top set is 85% × 5+ (AMRAP).
    const plan = nextSessionPlan('squat', allLifts, 1);
    expect(plan.topPct).toBe(0.85);
    expect(plan.topReps).toBe(5);
    expect(plan.amrap).toBe(true);
  });

  it('reads day from the next lift position (1-based within the cycle)', () => {
    expect(nextSessionPlan('squat', allLifts, 1).day).toBe(2);
    expect(nextSessionPlan('press', allLifts, 1).day).toBe(1);
  });

  it('handles a single enabled lift by wrapping to itself + week++', () => {
    const plan = nextSessionPlan('squat', ['squat'], 1);
    expect(plan.lift).toBe('squat');
    expect(plan.week).toBe(2);
  });

  it('falls back to the first lift when current lift is not enabled', () => {
    // Defensive: if `currentLift` was disabled mid-cycle, treat as position 0
    // so the next plan is the second enabled lift, week stable.
    const plan = nextSessionPlan('press', ['squat', 'bench'], 1);
    // 'press' not in list → liftPos = 0 → next lift is 'bench', week stays.
    expect(plan.lift).toBe('bench');
    expect(plan.week).toBe(1);
  });

  itProp.prop([
    fc.constantFrom<Lift>('squat', 'bench', 'deadlift', 'press'),
    fc.integer({ min: 1, max: 4 }).map((n) => n as Week),
  ])(
    'cycle invariant: applying nextSessionPlan enabledLifts.length × 4 times returns to (lift, week)',
    (startLift, startWeek) => {
      const enabled: Lift[] = allLifts;
      let lift: Lift = startLift;
      let week: Week = startWeek;
      const iterations = enabled.length * 4;
      for (let i = 0; i < iterations; i += 1) {
        const next = nextSessionPlan(lift, enabled, week);
        lift = next.lift;
        week = next.week;
      }
      expect({ lift, week }).toEqual({ lift: startLift, week: startWeek });
    },
  );
});

describe('bbbPlanRows', () => {
  it('returns exactly 5 rows', () => {
    const rows = bbbPlanRows(7, 300, 'lbs');
    expect(rows).toHaveLength(5);
  });

  it('all rows share the same prescribed weight (50% TM snapped)', () => {
    // 300 × 0.5 = 150 lbs, already on the 5-lb step.
    const rows = bbbPlanRows(7, 300, 'lbs');
    const weights = rows.map((r) => r.prescribedWeight);
    expect(new Set(weights).size).toBe(1);
    expect(weights[0]).toBe(150);
  });

  it('indices are 100..104 in order', () => {
    const rows = bbbPlanRows(7, 300, 'lbs');
    expect(rows.map((r) => r.index)).toEqual([100, 101, 102, 103, 104]);
  });

  it('kind=bbb, actualReps=10, prescribedReps=10', () => {
    const rows = bbbPlanRows(7, 300, 'lbs');
    expect(rows.every((r) => r.kind === 'bbb')).toBe(true);
    expect(rows.every((r) => r.actualReps === 10)).toBe(true);
    expect(rows.every((r) => r.prescribedReps === 10)).toBe(true);
  });

  it('uses custom pct + kg-snapping when provided', () => {
    // 100 kg × 0.6 = 60 kg, snapped to 2.5 step = 60.
    const rows = bbbPlanRows(11, 100, 'kg', 0.6);
    expect(rows[0]?.prescribedWeight).toBe(60);
    expect(rows.every((r) => r.sessionId === 11)).toBe(true);
  });

  it('snaps weights to the storage unit step (2.5 kg / 5 lb)', () => {
    // 137 kg × 0.5 = 68.5 → nearest 2.5 = 67.5 (lower) or 70 (upper)?
    // Math.round(68.5 / 2.5) = Math.round(27.4) = 27 → 67.5.
    const rows = bbbPlanRows(1, 137, 'kg');
    expect(rows[0]?.prescribedWeight).toBe(67.5);
  });
});
