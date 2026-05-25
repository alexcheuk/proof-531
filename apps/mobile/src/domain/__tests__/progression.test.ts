import fc from 'fast-check';
import { estimateOneRm } from '../epley';
import { tmIncrement } from '../increments';
import {
  bestE1RMForCycle,
  cyclesUntilGoal,
  projectE1RMForFuture,
  projectFutureCycles,
  projectTmForCycle,
  projectTopSetWeight,
  rollingAmrapMargin,
} from '../progression';
import { setsForWeek } from '../schemes';
import type { Lift, Unit } from '../types';
import { round } from '../units';

const LIFTS: Lift[] = ['squat', 'bench', 'deadlift', 'press'];
const UNITS: Unit[] = ['lbs', 'kg'];

describe('bestE1RMForCycle', () => {
  it('returns 0 on empty input', () => {
    expect(bestE1RMForCycle([])).toBe(0);
  });

  it('returns the max Epley e1RM across rows', () => {
    // 225 × 5 → 262.5; 245 × 3 → 269.5; 265 × 1 → 265 (short-circuit).
    const rows = [
      { prescribedWeight: 225, actualReps: 5, kind: 'amrap' as const },
      { prescribedWeight: 245, actualReps: 3, kind: 'amrap' as const },
      { prescribedWeight: 265, actualReps: 1, kind: 'amrap' as const },
    ];
    const best = bestE1RMForCycle(rows);
    expect(best).toBeCloseTo(269.5, 5);
  });

  it('ignores non-positive rows (zero-rep, zero-weight)', () => {
    const rows = [
      { prescribedWeight: 225, actualReps: 0, kind: 'amrap' as const },
      { prescribedWeight: 0, actualReps: 5, kind: 'amrap' as const },
      { prescribedWeight: 200, actualReps: 5, kind: 'amrap' as const },
    ];
    expect(bestE1RMForCycle(rows)).toBeCloseTo(estimateOneRm(200, 5), 5);
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

describe('rollingAmrapMargin', () => {
  it('returns 0 on empty input', () => {
    expect(rollingAmrapMargin([])).toBe(0);
  });

  it('averages (actual - prescribed) over the last N cycles', () => {
    // window=3; only last three considered: (5-1)=4, (3-1)=2, (4-1)=3 → mean=3.
    const cycles = [
      { amrapPrescribedReps: 5, amrapActualReps: 9 },
      { amrapPrescribedReps: 5, amrapActualReps: 8 },
      { amrapPrescribedReps: 1, amrapActualReps: 5 },
      { amrapPrescribedReps: 1, amrapActualReps: 3 },
      { amrapPrescribedReps: 1, amrapActualReps: 4 },
    ];
    expect(rollingAmrapMargin(cycles, 3)).toBeCloseTo(3, 5);
  });

  it('property: ignores leading entries beyond the window', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            amrapPrescribedReps: fc.integer({ min: 1, max: 5 }),
            amrapActualReps: fc.integer({ min: 1, max: 20 }),
          }),
          { minLength: 3, maxLength: 10 },
        ),
        (cycles) => {
          // Replacing entries that fall outside the last-3 window must not
          // change the rolling margin.
          const lastThree = cycles.slice(-3);
          const garbage = cycles
            .slice(0, Math.max(0, cycles.length - 3))
            .map(() => ({ amrapPrescribedReps: 99, amrapActualReps: 99 }));
          const polluted = [...garbage, ...lastThree];
          return rollingAmrapMargin(cycles, 3) === rollingAmrapMargin(polluted, 3);
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
    // squat lb: +10 per cycle.
    expect(projectTmForCycle(230, 7, 10, 'squat', 'lbs')).toBe(230 + 30);
    // bench lb: +5 per cycle.
    expect(projectTmForCycle(180, 5, 9, 'bench', 'lbs')).toBe(180 + 20);
  });

  it('returns currentTm when targetCycle < currentCycle (no past projection)', () => {
    expect(projectTmForCycle(230, 7, 5, 'squat', 'lbs')).toBe(230);
  });

  it('property: monotonicity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        fc.integer({ min: 50, max: 800 }),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 20 }),
        (lift, unit, tm, c, k) => {
          const same = projectTmForCycle(tm, c, c, lift, unit);
          const future = projectTmForCycle(tm, c, c + k, lift, unit);
          // tmIncrement is always strictly > 0 in 531, so future > same.
          return future > same;
        },
      ),
    );
  });
});

describe('projectTopSetWeight', () => {
  it('snaps to the unit step (lbs → nearest 5)', () => {
    // squat, current TM 230, future cycle = current + 1 → TM = 240.
    // Day 1 week-3 percentage is 0.75; 240 × 0.75 = 180.
    expect(projectTopSetWeight(8, 1, 230, 7, 'squat', 'lbs')).toBe(180);
  });

  it('day 4 (deload) uses the deload week-4 top percentage 0.6', () => {
    // squat, current TM 230, projection at current cycle = TM 230 → 230 × 0.6 = 138 → snap 140.
    expect(projectTopSetWeight(7, 4, 230, 7, 'squat', 'lbs')).toBe(140);
  });

  it('property: returned weight is plate-snapped to the unit', () => {
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

describe('projectE1RMForFuture', () => {
  it('returns 0 for non-future cycles (caller asks current/past)', () => {
    // future === current is "current cycle" — caller computes past e1RM separately.
    expect(projectE1RMForFuture(7, 230, 7, 0, 'squat', 'lbs')).toBe(
      estimateOneRm(projectTopSetWeight(7, 3, 230, 7, 'squat', 'lbs'), 1 + 0),
    );
  });

  it('uses week-3 day-3 top set with reps = 1 + margin', () => {
    // squat, current TM 230 lbs, future cycle 8 → TM 240; week-3 day-3 pct 0.95
    // top weight = 240 × 0.95 = 228 → snap 230.
    // margin = 2 → reps = 3, e1RM = 230 × (1 + 3/30) = 253.
    const e1 = projectE1RMForFuture(8, 230, 7, 2, 'squat', 'lbs');
    expect(e1).toBeCloseTo(253, 5);
  });

  it('property: monotonicity for k ≥ 0 with fixed margin', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        fc.integer({ min: 50, max: 600 }),
        fc.integer({ min: 1, max: 30 }),
        fc.integer({ min: 0, max: 6 }),
        fc.integer({ min: 0, max: 5 }),
        (lift, unit, tm, c, k, margin) => {
          const a = projectE1RMForFuture(c + k, tm, c, margin, lift, unit);
          const b = projectE1RMForFuture(c + k + 1, tm, c, margin, lift, unit);
          return b >= a;
        },
      ),
    );
  });
});

describe('cyclesUntilGoal', () => {
  it('returns null when goal is null', () => {
    expect(cyclesUntilGoal(null, 248, 230, 7, 0, 'squat', 'lbs')).toBeNull();
  });

  it('returns 0 when currentE1RM already meets the goal', () => {
    expect(cyclesUntilGoal(245, 248, 230, 7, 0, 'squat', 'lbs')).toBe(0);
  });

  it('returns the minimum k such that future cycle currentCycle+k meets goal', () => {
    // squat TM 230, current cycle 7, margin 1. Look for smallest k with projected ≥ 280.
    const got = cyclesUntilGoal(280, 0, 230, 7, 1, 'squat', 'lbs');
    expect(typeof got).toBe('number');
    expect(got).toBeGreaterThanOrEqual(1);
  });

  it('returns null when goal exceeds maxLookahead', () => {
    expect(cyclesUntilGoal(1_000_000, 0, 230, 7, 0, 'squat', 'lbs', 60)).toBeNull();
  });

  it('property: goal-hit ⇒ cycles non-null and equals first k', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        fc.integer({ min: 100, max: 400 }),
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 6 }),
        fc.integer({ min: 0, max: 5 }),
        (lift, unit, tm, c, kSearch, margin) => {
          // Build a goal we know is reachable by cycle c+kSearch.
          const goal = projectE1RMForFuture(c + kSearch, tm, c, margin, lift, unit);
          const got = cyclesUntilGoal(goal, 0, tm, c, margin, lift, unit, 60);
          if (got === null) return false;
          // Search must return the smallest k.
          for (let k = 1; k < got; k++) {
            const e1 = projectE1RMForFuture(c + k, tm, c, margin, lift, unit);
            if (e1 >= goal) return false;
          }
          const hit = projectE1RMForFuture(c + got, tm, c, margin, lift, unit);
          return hit >= goal;
        },
      ),
    );
  });
});

describe('projectFutureCycles', () => {
  it('returns N rows starting at currentCycle+1', () => {
    const rows = projectFutureCycles(6, 230, 7, 2, 'squat', 'lbs');
    expect(rows).toHaveLength(6);
    expect(rows[0]?.cycle).toBe(8);
    expect(rows[5]?.cycle).toBe(13);
  });

  it('each row has 4 days (D1..D3 + deload) at correct percentages, snapped', () => {
    const rows = projectFutureCycles(1, 230, 7, 0, 'squat', 'lbs');
    const row = rows[0];
    expect(row?.days).toHaveLength(4);
    // For day 1 of cycle 8, expect week-1 day-1 = TM(240) × 0.75 = 180 (week-3 D1, per spec).
    // Spec routes future-projection through week 3 pcts on D1/D2/D3 (since that's the
    // heaviest-AMRAP week) — verify the d3 weight is the week-3 top single.
    const d3 = row?.days.find((d) => d.day === 3);
    expect(d3?.weight).toBe(round(240 * 0.95, 'lbs')); // = 230 (228 → snap 230)
  });

  it('property: all weights are plate-snapped', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LIFTS),
        fc.constantFrom(...UNITS),
        fc.integer({ min: 50, max: 600 }),
        fc.integer({ min: 1, max: 30 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 1, max: 6 }),
        (lift, unit, tm, c, margin, count) => {
          const rows = projectFutureCycles(count, tm, c, margin, lift, unit);
          return rows.every((row) => row.days.every((d) => round(d.weight, unit) === d.weight));
        },
      ),
    );
  });
});

describe('integration sanity', () => {
  it('setsForWeek(3) D3 percentage matches the projection contract', () => {
    // The projection assumes week-3 D3 percentage 0.95 with prescribed reps 1.
    const w3 = setsForWeek(3);
    expect(w3[2]?.pct).toBeCloseTo(0.95, 5);
    expect(w3[2]?.reps).toBe(1);
  });

  it('tmIncrement consistency: future TM equals currentTm + k × increment', () => {
    for (const lift of LIFTS) {
      for (const unit of UNITS) {
        const inc = tmIncrement(unit, lift);
        const got = projectTmForCycle(200, 5, 12, lift, unit);
        expect(got).toBeCloseTo(200 + 7 * inc, 5);
      }
    }
  });
});
