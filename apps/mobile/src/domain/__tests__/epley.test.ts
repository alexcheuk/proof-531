import fc from 'fast-check';
import { estimateOneRm } from '../epley';

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
