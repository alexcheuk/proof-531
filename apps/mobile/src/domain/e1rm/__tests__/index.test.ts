import { fc, test as fcTest } from '@fast-check/jest';
import { epley, isPR } from '..';

describe('epley', () => {
  it('epley(100, 1) === 100', () => expect(epley(100, 1)).toBe(100));
  it('epley(100, 10) === 133 (rounded)', () => expect(epley(100, 10)).toBe(133));
  it('rounds to nearest integer (105*1.0833... = 113.75 -> 114)', () => {
    // 105 * (1 + 5/30) = 105 * 1.16666... = 122.5 -> 123 (Banker? or .5 up?)
    expect(epley(105, 5)).toBe(123);
  });
  it('throws on non-positive weight', () => {
    expect(() => epley(0, 1)).toThrow();
    expect(() => epley(-10, 1)).toThrow();
  });
  it('throws on non-positive reps', () => {
    expect(() => epley(100, 0)).toThrow();
    expect(() => epley(100, -1)).toThrow();
  });
  it('throws on non-integer reps', () => {
    expect(() => epley(100, 1.5)).toThrow();
  });
});

describe('epley — properties', () => {
  const weightArb = fc.integer({ min: 1, max: 1000 });
  const repsArb = fc.integer({ min: 1, max: 20 });

  fcTest.prop([weightArb])('epley(w, 1) === w', (w) => {
    expect(epley(w, 1)).toBe(w);
  });

  fcTest.prop([weightArb, repsArb])('monotonically non-decreasing in reps', (w, r) => {
    const a = epley(w, r);
    const b = epley(w, r + 1);
    expect(b).toBeGreaterThanOrEqual(a);
  });

  // For r >= 2, epley(w, r) > w only once w*(r/30) clears the rounding boundary (>= 0.5).
  // Smallest weight guaranteeing this at r=2 is 8 (8*2/30 ≈ 0.533).
  fcTest.prop([fc.integer({ min: 8, max: 1000 }), fc.integer({ min: 2, max: 20 })])(
    'strictly increasing in reps (r >= 2)',
    (w, r) => {
      expect(epley(w, r)).toBeGreaterThan(epley(w, 1));
    },
  );
});

describe('isPR', () => {
  it('returns true when current > max(history)', () => {
    expect(isPR(200, [100, 150, 180])).toBe(true);
  });
  it('returns false when current === max(history)', () => {
    expect(isPR(180, [100, 150, 180])).toBe(false);
  });
  it('returns false when current < max(history)', () => {
    expect(isPR(170, [100, 150, 180])).toBe(false);
  });
  it('returns true for any positive number when history is empty', () => {
    expect(isPR(1, [])).toBe(true);
    expect(isPR(0.0001, [])).toBe(true);
  });
  it('throws on non-finite or negative current', () => {
    expect(() => isPR(Number.NaN, [100])).toThrow();
    expect(() => isPR(-1, [100])).toThrow();
  });
  it('throws on non-finite history entry', () => {
    expect(() => isPR(200, [100, Number.NaN])).toThrow();
  });
});

describe('isPR — properties', () => {
  const valArb = fc.integer({ min: 0, max: 10000 });
  fcTest.prop([valArb, fc.array(valArb, { maxLength: 50 })])(
    'iff current > max(history)',
    (current, history) => {
      const expected = history.length === 0 ? current >= 0 : current > Math.max(...history);
      expect(isPR(current, history)).toBe(expected);
    },
  );
});
