import fc from 'fast-check';
import { estimateOneRm } from '../epley';
import { tmIncrement } from '../increments';
import {
  bestE1RMForCycle,
  cyclesUntilTmGoal,
  goalTargetTm,
  projectCycleRows,
  projectTmForCycle,
  projectTopSetWeight,
  rollingAmrapMargin,
  tmFromOneRm,
} from '../progression';
import type { Lift, Unit } from '../types';
import { round } from '../units';

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

describe('rollingAmrapMargin', () => {
  it('returns 0 on empty input', () => {
    expect(rollingAmrapMargin([])).toBe(0);
  });

  it('averages (actual - prescribed) over the last N cycles', () => {
    const cycles = [
      { amrapPrescribedReps: 5, amrapActualReps: 9 },
      { amrapPrescribedReps: 5, amrapActualReps: 8 },
      { amrapPrescribedReps: 1, amrapActualReps: 5 },
      { amrapPrescribedReps: 1, amrapActualReps: 3 },
      { amrapPrescribedReps: 1, amrapActualReps: 4 },
    ];
    expect(rollingAmrapMargin(cycles, 3)).toBeCloseTo(3, 5);
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
  it('day 3 uses week-3 0.95 percentage; snaps to unit step', () => {
    // squat, current TM 230, future cycle 8 → TM 240; 240 × 0.95 = 228 → 230.
    expect(projectTopSetWeight(8, 3, 230, 7, 'squat', 'lbs')).toBe(230);
  });

  it('day 4 (deload) uses 0.60 TM', () => {
    // squat TM 230 at current cycle → 230 × 0.60 = 138 → 140.
    expect(projectTopSetWeight(7, 4, 230, 7, 'squat', 'lbs')).toBe(140);
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

describe('tmFromOneRm + goalTargetTm', () => {
  it('TM ≈ 0.9 × 1RM, snapped to unit step', () => {
    expect(tmFromOneRm(350, 'lbs')).toBe(round(315, 'lbs'));
    expect(tmFromOneRm(200, 'kg')).toBe(round(180, 'kg'));
  });

  it('goalTargetTm passes through for kind=tm', () => {
    expect(goalTargetTm('tm', 305, 'lbs')).toBe(305);
  });

  it('goalTargetTm converts kind=1rm via 0.9 factor', () => {
    expect(goalTargetTm('1rm', 350, 'lbs')).toBe(round(315, 'lbs'));
  });

  it('property: TM derived from 1RM is always plate-snapped', () => {
    fc.assert(
      fc.property(fc.constantFrom(...UNITS), fc.integer({ min: 50, max: 1000 }), (unit, oneRm) => {
        const tm = tmFromOneRm(oneRm, unit);
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
