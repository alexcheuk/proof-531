import fc from 'fast-check';
import { estimateOneRm } from '../epley';
import { tmIncrement } from '../increments';
import {
  bestE1RMForCycle,
  classifyAmrapMiss,
  cycleGoalEstimate,
  cyclesUntilTmGoal,
  goalTargetTm,
  missResetTm,
  projectCycleRows,
  projectTmForCycle,
  projectTopSetWeight,
  tmAdjustmentSuggestion,
} from '../progression';
import { prescription } from '../schemes';
import type { Lift, Unit } from '../types';
import { round, trainingMaxFrom } from '../units';

const LIFTS: Lift[] = ['squat', 'bench', 'deadlift', 'press'];
const UNITS: Unit[] = ['lbs', 'kg'];

describe('bestE1RMForCycle', () => {
  it('returns 0 on empty input', () => {
    expect(bestE1RMForCycle([])).toBe(0);
  });

  it('returns the max Epley e1RM across rows', () => {
    const rows = [
      { prescribedWeight: 225, actualReps: 5, kind: 'amrap' as const },
      { prescribedWeight: 245, actualReps: 3, kind: 'amrap' as const },
      { prescribedWeight: 265, actualReps: 1, kind: 'amrap' as const },
    ];
    expect(bestE1RMForCycle(rows)).toBeCloseTo(269.5, 5);
  });

  it('property: equals max of per-row estimateOneRm', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            prescribedWeight: fc.integer({ min: 0, max: 1000 }),
            actualReps: fc.integer({ min: 0, max: 30 }),
          }),
          { minLength: 0, maxLength: 8 },
        ),
        (rows) => {
          const withKind = rows.map((r) => ({ ...r, kind: 'amrap' as const }));
          const got = bestE1RMForCycle(withKind);
          const expected = rows.reduce(
            (m, r) => Math.max(m, estimateOneRm(r.prescribedWeight, r.actualReps)),
            0,
          );
          return Math.abs(got - expected) < 1e-9;
        },
      ),
    );
  });
});

describe('projectTmForCycle', () => {
  it('returns currentTm when targetCycle equals currentCycle', () => {
    expect(projectTmForCycle(230, 7, 7, 'squat', 'lbs')).toBe(230);
  });

  it('applies one tmIncrement per cycle delta', () => {
    expect(projectTmForCycle(230, 7, 10, 'squat', 'lbs')).toBe(230 + 30);
    expect(projectTmForCycle(180, 5, 9, 'bench', 'lbs')).toBe(180 + 20);
  });

  it('returns currentTm when targetCycle < currentCycle', () => {
    expect(projectTmForCycle(230, 7, 5, 'squat', 'lbs')).toBe(230);
  });

  it('property: monotonicity for k ≥ 1', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        fc.integer({ min: 50, max: 800 }),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 20 }),
        (lift, unit, tm, c, k) => {
          return (
            projectTmForCycle(tm, c, c + k, lift, unit) > projectTmForCycle(tm, c, c, lift, unit)
          );
        },
      ),
    );
  });
});

describe('projectTopSetWeight', () => {
  it('day 1 uses week-1 top set (0.85), day 2 week-2 (0.90), day 3 week-3 (0.95)', () => {
    // Each grid day d maps to week d and shows that week's top working set,
    // matching the live Today/Home headline (`prescription(week)[2]`).
    // squat TM 200 at the current cycle (no projection bump):
    //   day 1 → 200 × 0.85 = 170; day 2 → 200 × 0.90 = 180; day 3 → 200 × 0.95 = 190.
    expect(projectTopSetWeight(7, 1, 200, 7, 'squat', 'lbs')).toBe(170);
    expect(projectTopSetWeight(7, 2, 200, 7, 'squat', 'lbs')).toBe(180);
    expect(projectTopSetWeight(7, 3, 200, 7, 'squat', 'lbs')).toBe(190);
  });

  it('day 3 uses week-3 0.95 percentage; snaps to unit step', () => {
    // squat, current TM 230, future cycle 8 → TM 240; 240 × 0.95 = 228 → 230.
    expect(projectTopSetWeight(8, 3, 230, 7, 'squat', 'lbs')).toBe(230);
  });

  it('property: projection equals the live top-set percentage for days 1–3', () => {
    // Guards against the day→week regression: the grid headline must equal
    // the same percentage the Today/Home screens prescribe for that week's
    // AMRAP set (`prescription(day)[2]`), at the current cycle (no TM bump).
    fc.assert(
      fc.property(
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        fc.integer({ min: 50, max: 600 }),
        fc.constantFrom(1 as const, 2 as const, 3 as const),
        (lift, unit, tm, day) => {
          const topPct = prescription(day)[2]?.pct ?? 0;
          return projectTopSetWeight(5, day, tm, 5, lift, unit) === round(tm * topPct, unit);
        },
      ),
    );
  });

  it('day 4 (TM test) uses 100% TM (snapped)', () => {
    // squat TM 230 at current cycle → 230 × 1.0 = 230 (already snapped).
    expect(projectTopSetWeight(7, 4, 230, 7, 'squat', 'lbs')).toBe(230);
    // Future cycle 8 → projected TM 240; tm-test set is 100% of that.
    expect(projectTopSetWeight(8, 4, 230, 7, 'squat', 'lbs')).toBe(240);
    // Bench TM 185 in kg unit (5kg step)  -  still 100% TM, snapped.
    expect(projectTopSetWeight(5, 4, 100, 5, 'bench', 'kg')).toBe(round(100, 'kg'));
  });

  it('property: plate-snapped to the unit step', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        fc.integer({ min: 50, max: 600 }),
        fc.integer({ min: 1, max: 30 }),
        fc.integer({ min: 0, max: 10 }),
        fc.constantFrom(1 as const, 2 as const, 3 as const, 4 as const),
        (lift, unit, tm, c, k, day) => {
          const w = projectTopSetWeight(c + k, day, tm, c, lift, unit);
          return round(w, unit) === w;
        },
      ),
    );
  });
});

describe('goalTargetTm', () => {
  it('passes through for kind=tm', () => {
    expect(goalTargetTm('tm', 305, 'lbs')).toBe(305);
  });

  it('converts kind=1rm via 0.9 factor (delegates to trainingMaxFrom)', () => {
    expect(goalTargetTm('1rm', 350, 'lbs')).toBe(trainingMaxFrom(350, 'lbs'));
    expect(goalTargetTm('1rm', 200, 'kg')).toBe(trainingMaxFrom(200, 'kg'));
  });

  it('property: 1RM target is always plate-snapped', () => {
    fc.assert(
      fc.property(fc.constantFrom(...UNITS), fc.integer({ min: 50, max: 1000 }), (unit, oneRm) => {
        const tm = goalTargetTm('1rm', oneRm, unit);
        return round(tm, unit) === tm;
      }),
    );
  });
});

describe('cyclesUntilTmGoal', () => {
  it('returns null when targetTm is null', () => {
    expect(cyclesUntilTmGoal(null, 230, 7, 'squat', 'lbs')).toBeNull();
  });

  it('returns 0 when currentTm already meets the goal', () => {
    expect(cyclesUntilTmGoal(230, 230, 7, 'squat', 'lbs')).toBe(0);
    expect(cyclesUntilTmGoal(225, 230, 7, 'squat', 'lbs')).toBe(0);
  });

  it('returns the minimum k such that projected TM at currentCycle+k meets goal', () => {
    // squat +10/cycle: 230 → 240 → 250 → 260 → 270 → 280. Goal 270 = k 4.
    expect(cyclesUntilTmGoal(270, 230, 7, 'squat', 'lbs')).toBe(4);
    // bench +5/cycle: 180 → 185 → 190 → 195 → 200. Goal 200 = k 4.
    expect(cyclesUntilTmGoal(200, 180, 5, 'bench', 'lbs')).toBe(4);
  });

  it('returns null when goal exceeds maxLookahead', () => {
    expect(cyclesUntilTmGoal(1_000_000, 230, 7, 'squat', 'lbs', 60)).toBeNull();
  });

  it('property: goal-hit ⇒ cycles non-null and minimal', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        fc.integer({ min: 100, max: 400 }),
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (lift, unit, tm, c, kReach) => {
          const targetTm = projectTmForCycle(tm, c, c + kReach, lift, unit);
          const got = cyclesUntilTmGoal(targetTm, tm, c, lift, unit, 60);
          if (got === null) return false;
          if (got > kReach) return false;
          for (let k = 0; k < got; k++) {
            if (projectTmForCycle(tm, c, c + k, lift, unit) >= targetTm) return k === 0;
          }
          return projectTmForCycle(tm, c, c + got, lift, unit) >= targetTm;
        },
      ),
    );
  });
});

describe('projectCycleRows', () => {
  it('returns inclusive range start..end', () => {
    const rows = projectCycleRows(1, 6, 230, 3, 'squat', 'lbs');
    expect(rows).toHaveLength(6);
    expect(rows[0]?.cycle).toBe(1);
    expect(rows[5]?.cycle).toBe(6);
  });

  it('past + current rows use currentTm; future rows project forward', () => {
    const rows = projectCycleRows(1, 5, 230, 3, 'squat', 'lbs');
    expect(rows[0]?.tm).toBe(230); // cycle 1, past
    expect(rows[2]?.tm).toBe(230); // cycle 3, current
    expect(rows[3]?.tm).toBe(240); // cycle 4 (+10 squat)
    expect(rows[4]?.tm).toBe(250); // cycle 5
  });

  it('property: every projected weight is plate-snapped', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        fc.integer({ min: 50, max: 600 }),
        fc.integer({ min: 1, max: 30 }),
        fc.integer({ min: 1, max: 12 }),
        (lift, unit, tm, c, span) => {
          const rows = projectCycleRows(c, c + span, tm, c, lift, unit);
          return rows.every((row) => row.days.every((d) => round(d.weight, unit) === d.weight));
        },
      ),
    );
  });
});

describe('integration sanity', () => {
  it('tmIncrement consistency: future TM equals currentTm + k × increment', () => {
    for (const lift of LIFTS) {
      for (const unit of UNITS) {
        const inc = tmIncrement(unit, lift);
        expect(projectTmForCycle(200, 5, 12, lift, unit)).toBeCloseTo(200 + 7 * inc, 5);
      }
    }
  });
});

describe('tmAdjustmentSuggestion', () => {
  it('reps ≥ 5 → increment with delta = tmIncrement(unit, lift)', () => {
    // Upper-body lbs: +5
    expect(tmAdjustmentSuggestion(5, 'bench', 'lbs')).toEqual({ kind: 'increment', delta: 5 });
    expect(tmAdjustmentSuggestion(10, 'press', 'lbs')).toEqual({ kind: 'increment', delta: 5 });
    // Lower-body lbs: +10
    expect(tmAdjustmentSuggestion(5, 'squat', 'lbs')).toEqual({ kind: 'increment', delta: 10 });
    expect(tmAdjustmentSuggestion(7, 'deadlift', 'lbs')).toEqual({ kind: 'increment', delta: 10 });
    // Upper-body kg: +2.5
    expect(tmAdjustmentSuggestion(5, 'bench', 'kg')).toEqual({ kind: 'increment', delta: 2.5 });
    // Lower-body kg: +5
    expect(tmAdjustmentSuggestion(5, 'squat', 'kg')).toEqual({ kind: 'increment', delta: 5 });
  });

  it('reps 3–4 → hold (no delta)', () => {
    expect(tmAdjustmentSuggestion(3, 'bench', 'lbs')).toEqual({ kind: 'hold' });
    expect(tmAdjustmentSuggestion(4, 'squat', 'kg')).toEqual({ kind: 'hold' });
  });

  it('reps 0–2 → reset at 0.9 (−10%)', () => {
    expect(tmAdjustmentSuggestion(0, 'bench', 'lbs')).toEqual({ kind: 'reset', resetPct: 0.9 });
    expect(tmAdjustmentSuggestion(1, 'squat', 'kg')).toEqual({ kind: 'reset', resetPct: 0.9 });
    expect(tmAdjustmentSuggestion(2, 'deadlift', 'lbs')).toEqual({ kind: 'reset', resetPct: 0.9 });
  });

  it('negative reps default to reset (defensive)', () => {
    expect(tmAdjustmentSuggestion(-1, 'bench', 'lbs')).toEqual({ kind: 'reset', resetPct: 0.9 });
    expect(tmAdjustmentSuggestion(-10, 'squat', 'lbs')).toEqual({ kind: 'reset', resetPct: 0.9 });
  });

  it('property: band closure  -  total function over reps [-5..50]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -5, max: 50 }),
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        (reps, lift, unit) => {
          const r = tmAdjustmentSuggestion(reps, lift, unit);
          if (r.kind === 'increment') return r.delta > 0;
          if (r.kind === 'hold') return true;
          if (r.kind === 'reset') return r.resetPct > 0 && r.resetPct < 1;
          return false;
        },
      ),
    );
  });

  it('property: band boundaries are monotone', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 30 }),
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        (reps, lift, unit) => {
          const r = tmAdjustmentSuggestion(reps, lift, unit);
          if (reps >= 5) return r.kind === 'increment';
          if (reps >= 3) return r.kind === 'hold';
          return r.kind === 'reset';
        },
      ),
    );
  });

  it('property: increment.delta === tmIncrement(unit, lift) on the increment band', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 30 }),
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        (reps, lift, unit) => {
          const r = tmAdjustmentSuggestion(reps, lift, unit);
          if (r.kind !== 'increment') return false;
          return r.delta === tmIncrement(unit, lift);
        },
      ),
    );
  });

  it('property: reset.resetPct is constant 0.9 across reset band', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -5, max: 2 }),
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        (reps, lift, unit) => {
          const r = tmAdjustmentSuggestion(reps, lift, unit);
          if (r.kind !== 'reset') return false;
          return r.resetPct === 0.9;
        },
      ),
    );
  });
});

describe('classifyAmrapMiss', () => {
  it("returns 'miss' when actualReps < prescribedReps", () => {
    expect(classifyAmrapMiss(2, 5)).toBe('miss');
    expect(classifyAmrapMiss(0, 1)).toBe('miss');
  });

  it("returns 'hit' when actualReps >= prescribedReps", () => {
    expect(classifyAmrapMiss(5, 5)).toBe('hit'); // boundary: equal is a hit
    expect(classifyAmrapMiss(8, 5)).toBe('hit');
  });

  it('never throws on zero, negative, or large integer inputs', () => {
    expect(() => classifyAmrapMiss(0, 0)).not.toThrow();
    expect(() => classifyAmrapMiss(-3, 5)).not.toThrow();
    expect(() => classifyAmrapMiss(1_000_000, 1)).not.toThrow();
  });

  it('property: monotonic in actualReps for fixed prescribed (once a hit, stays a hit)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 30 }),
        fc.integer({ min: 0, max: 30 }),
        fc.integer({ min: 0, max: 30 }),
        (prescribed, a, extra) => {
          // a is the lower actual; a + extra is the higher actual.
          if (classifyAmrapMiss(a, prescribed) === 'hit') {
            return classifyAmrapMiss(a + extra, prescribed) === 'hit';
          }
          return true;
        },
      ),
    );
  });

  it('property: equivalence to the < comparison over wide integer inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (actual, prescribed) => {
          const expected = actual < prescribed ? 'miss' : 'hit';
          return classifyAmrapMiss(actual, prescribed) === expected;
        },
      ),
    );
  });
});

describe('missResetTm', () => {
  it('computes round(tm * 0.9, unit)', () => {
    // round(275 * 0.9, lbs) = round(247.5, lbs) = 250
    expect(missResetTm(275, 'lbs')).toBe(round(275 * 0.9, 'lbs'));
    expect(missResetTm(275, 'lbs')).toBe(250);
    // kg snaps to 2.5
    expect(missResetTm(100, 'kg')).toBe(round(90, 'kg'));
    expect(missResetTm(100, 'kg')).toBe(90);
  });

  it('clamps non-positive input to 0 (round contract)', () => {
    expect(missResetTm(0, 'lbs')).toBe(0);
    expect(missResetTm(0, 'kg')).toBe(0);
  });

  it('property: result equals the rounding contract round(tm * 0.9, unit)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...UNITS), fc.integer({ min: 0, max: 1000 }), (unit, tm) => {
        return missResetTm(tm, unit) === round(tm * 0.9, unit);
      }),
    );
  });

  it('property: result is plate-snapped (round(result, unit) === result)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...UNITS), fc.integer({ min: 0, max: 1000 }), (unit, tm) => {
        const r = missResetTm(tm, unit);
        return round(r, unit) === r;
      }),
    );
  });

  it('property: result is always non-negative', () => {
    fc.assert(
      fc.property(fc.constantFrom(...UNITS), fc.integer({ min: 0, max: 1000 }), (unit, tm) => {
        return missResetTm(tm, unit) >= 0;
      }),
    );
  });

  it('property: never raises the TM for any realistic loadable TM', () => {
    // Nearest-plate `round` can round tiny values up (e.g. round(1.8, kg) = 2.5),
    // so the `result <= tm` bound only holds above one plate step. The spec
    // flags this: assert the bound for realistic TMs, not the degenerate tail.
    fc.assert(
      fc.property(fc.constantFrom(...UNITS), fc.integer({ min: 20, max: 1000 }), (unit, tm) => {
        const r = missResetTm(tm, unit);
        return r >= 0 && r <= tm;
      }),
    );
  });
});

describe('cycleGoalEstimate', () => {
  it('returns zero days and null months when cyclesUntilGoal is null', () => {
    expect(cycleGoalEstimate(null, 3)).toEqual({ days: 0, months: null });
  });

  it('returns zero days and null months when goal is already reached (0 cycles)', () => {
    expect(cycleGoalEstimate(0, 3)).toEqual({ days: 0, months: null });
  });

  it('computes days as cycles × 4', () => {
    expect(cycleGoalEstimate(5, null).days).toBe(20);
    expect(cycleGoalEstimate(1, null).days).toBe(4);
  });

  it('returns null months when daysPerWeek is not set', () => {
    expect(cycleGoalEstimate(10, null).months).toBeNull();
  });

  it('returns null months when daysPerWeek is 0', () => {
    expect(cycleGoalEstimate(10, 0).months).toBeNull();
  });

  it('computes months as ceil(days / dpw / 4.345), minimum 1', () => {
    // 4 cycles × 4 days = 16 days; at 2/wk: 16 / 2 / 4.345 ≈ 1.84 → 2
    expect(cycleGoalEstimate(4, 2).months).toBe(2);
    // 1 cycle × 4 days = 4 days; at 3/wk: 4 / 3 / 4.345 ≈ 0.31 → min 1
    expect(cycleGoalEstimate(1, 3).months).toBe(1);
    // 12 cycles × 4 days = 48 days; at 3/wk: 48 / 3 / 4.345 ≈ 3.68 → 4
    expect(cycleGoalEstimate(12, 3).months).toBe(4);
  });

  it('property: days is always cycles × 4 for positive inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        (cycles) => cycleGoalEstimate(cycles, null).days === cycles * 4,
      ),
    );
  });
});
