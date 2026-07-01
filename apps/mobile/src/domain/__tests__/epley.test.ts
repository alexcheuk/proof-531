import fc from 'fast-check';
import { estimateOneRm, minRepsForPR } from '../epley';

describe('estimateOneRm', () => {
  // Unit tests.
  it('returns 0 for non-positive weight', () => {
    expect(estimateOneRm(0, 5)).toBe(0);
    expect(estimateOneRm(-100, 5)).toBe(0);
  });

  it('returns 0 for non-positive reps (zero reps is not a lift)', () => {
    expect(estimateOneRm(225, 0)).toBe(0);
    expect(estimateOneRm(225, -3)).toBe(0);
  });

  it('reps=1 returns weight (identity short-circuit)', () => {
    expect(estimateOneRm(225, 1)).toBe(225);
    expect(estimateOneRm(135, 1)).toBe(135);
  });

  it('reps=5 weight=225 → 225 × (1 + 5/30) = 262.5', () => {
    expect(estimateOneRm(225, 5)).toBeCloseTo(262.5, 5);
  });

  // Property: reps=1 ⇒ result === weight, for any positive weight.
  it('property: reps=1 ⇒ result === weight', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        (w) => {
          return estimateOneRm(w, 1) === w;
        },
      ),
    );
  });

  // Property: result monotonically increases with reps (for positive weight, reps >= 1).
  it('property: monotonically increases with reps', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        fc.integer({ min: 1, max: 29 }),
        (w, r) => {
          // estimateOneRm(w, r+1) >= estimateOneRm(w, r). Note the reps=1 short-circuit
          // means estimate(w,1)=w but estimate(w,2) = w*(1+2/30) ~ w*1.066 > w. So even
          // crossing the short-circuit boundary, monotonicity holds.
          return estimateOneRm(w, r + 1) >= estimateOneRm(w, r);
        },
      ),
    );
  });
});

describe('minRepsForPR', () => {
  it('returns null when weight is zero or negative', () => {
    expect(minRepsForPR(0, 220)).toBeNull();
    expect(minRepsForPR(-10, 220)).toBeNull();
  });

  it('returns null when existingBestE1RM is zero or negative', () => {
    expect(minRepsForPR(200, 0)).toBeNull();
    expect(minRepsForPR(200, -5)).toBeNull();
  });

  it('returns 1 when weight strictly exceeds the existing best (reps=1 identity sets a PR)', () => {
    expect(minRepsForPR(225, 220)).toBe(1);
    expect(minRepsForPR(300, 299)).toBe(1);
  });

  it('returns at least 2 when weight equals existing best (reps=1 ties, not beats)', () => {
    expect(minRepsForPR(220, 220)).toBeGreaterThanOrEqual(2);
  });

  it('returns 4 for weight=200 existing=220 (30*(220/200-1)=3, floor+1=4)', () => {
    expect(minRepsForPR(200, 220)).toBe(4);
    // Verify: estimateOneRm(200, 4) = 200 * (1 + 4/30) > 220
    expect(estimateOneRm(200, 4)).toBeGreaterThan(220);
    // 3 reps lands at or below 220 within floating-point tolerance
    // (200 * 1.1 may resolve to 220.000...003 in IEEE 754)
    expect(estimateOneRm(200, 3)).toBeLessThanOrEqual(220 + 0.001);
  });

  it('property: estimateOneRm at minReps always beats the existing best', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(500), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(500), noNaN: true }),
        (weight, best) => {
          const min = minRepsForPR(weight, best);
          if (min === null) return true;
          return estimateOneRm(weight, min) > best;
        },
      ),
    );
  });

  it('property: one fewer rep than minReps does NOT substantially beat the existing best', () => {
    // Use a small epsilon for floating-point boundary cases where the Epley
    // formula produces a value marginally above `best` (e.g. 220.000...003 for
    // weight=200, reps=3, best=220). The epsilon is much smaller than the
    // smallest plate increment (1.25kg) so it has no practical consequence.
    const EPS = 0.01;
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(500), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(500), noNaN: true }),
        (weight, best) => {
          const min = minRepsForPR(weight, best);
          if (min === null || min <= 1) return true;
          return estimateOneRm(weight, min - 1) <= best + EPS;
        },
      ),
    );
  });
});
