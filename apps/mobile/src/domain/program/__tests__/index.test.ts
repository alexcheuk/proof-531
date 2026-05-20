import { fc, test as fcTest } from '@fast-check/jest';
import { type PrescribedSet, type Week, prescribedSets } from '..';

describe('prescribedSets — week scheme', () => {
  describe('week 1 (5/5/5+)', () => {
    it('returns three sets with reps [5, 5, 5] at [65%, 75%, 85%] and last set AMRAP', () => {
      const sets = prescribedSets(200, 1);
      expect(sets).toHaveLength(3);
      expect(sets.map((s) => s.percent)).toEqual([0.65, 0.75, 0.85]);
      expect(sets.map((s) => s.reps)).toEqual([5, 5, 5]);
      expect(sets.map((s) => s.amrap)).toEqual([false, false, true]);
    });
    it('rounds 200 tm week-1 weights to [130, 150, 170]', () => {
      expect(prescribedSets(200, 1).map((s) => s.weight)).toEqual([130, 150, 170]);
    });
    it('rounds 235 tm week-1 weights to nearest 5 lb', () => {
      expect(prescribedSets(235, 1).map((s) => s.weight)).toEqual([155, 175, 200]);
    });
  });
  describe('week 2 (3/3/3+)', () => {
    it('returns reps [3,3,3] at [70%,80%,90%]', () => {
      const sets = prescribedSets(200, 2);
      expect(sets.map((s) => s.percent)).toEqual([0.7, 0.8, 0.9]);
      expect(sets.map((s) => s.reps)).toEqual([3, 3, 3]);
      expect(sets.map((s) => s.amrap)).toEqual([false, false, true]);
    });
  });
  describe('week 3 (5/3/1+)', () => {
    it('returns reps [5,3,1] at [75%,85%,95%]', () => {
      const sets = prescribedSets(200, 3);
      expect(sets.map((s) => s.percent)).toEqual([0.75, 0.85, 0.95]);
      expect(sets.map((s) => s.reps)).toEqual([5, 3, 1]);
      expect(sets.map((s) => s.amrap)).toEqual([false, false, true]);
    });
  });
  describe('week 4 (deload)', () => {
    it('returns reps [5,5,5] at [40%,50%,60%], NO AMRAP', () => {
      const sets = prescribedSets(200, 4);
      expect(sets.map((s) => s.percent)).toEqual([0.4, 0.5, 0.6]);
      expect(sets.map((s) => s.reps)).toEqual([5, 5, 5]);
      expect(sets.map((s) => s.amrap)).toEqual([false, false, false]);
    });
  });
  describe('roundTo option', () => {
    it('honors roundTo: 2.5', () => {
      expect(prescribedSets(102.5, 1, { roundTo: 2.5 }).map((s) => s.weight)).toEqual([
        67.5, 77.5, 87.5,
      ]);
    });
    it('honors roundTo: 1', () => {
      expect(prescribedSets(100, 1, { roundTo: 1 }).map((s) => s.weight)).toEqual([65, 75, 85]);
    });
  });
  describe('invalid input', () => {
    it('throws on week 0, 5, negative, non-integer', () => {
      expect(() => prescribedSets(200, 0 as Week)).toThrow();
      expect(() => prescribedSets(200, 5 as Week)).toThrow();
      expect(() => prescribedSets(200, -1 as Week)).toThrow();
      expect(() => prescribedSets(200, 1.5 as Week)).toThrow();
    });
    it('throws on non-positive trainingMax', () => {
      expect(() => prescribedSets(0, 1)).toThrow();
      expect(() => prescribedSets(-50, 1)).toThrow();
    });
    it('throws on non-positive roundTo', () => {
      expect(() => prescribedSets(200, 1, { roundTo: 0 })).toThrow();
      expect(() => prescribedSets(200, 1, { roundTo: -5 })).toThrow();
    });
  });
});

describe('prescribedSets — properties', () => {
  const tmArb = fc.integer({ min: 45, max: 1000 });
  const amrapWeekArb = fc.constantFrom<Week>(1, 2, 3);
  const allWeekArb = fc.constantFrom<Week>(1, 2, 3, 4);

  fcTest.prop([tmArb, amrapWeekArb])('AMRAP set is last on weeks 1-3', (tm, week) => {
    const sets = prescribedSets(tm, week);
    const last = sets[sets.length - 1] as PrescribedSet;
    expect(last.amrap).toBe(true);
    expect(sets.slice(0, -1).every((s) => !s.amrap)).toBe(true);
  });

  fcTest.prop([tmArb, amrapWeekArb])('AMRAP set reps is a positive integer floor', (tm, week) => {
    const last = prescribedSets(tm, week).slice(-1)[0] as PrescribedSet;
    expect(last.amrap).toBe(true);
    expect(last.reps).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(last.reps)).toBe(true);
  });

  fcTest.prop([tmArb])('week 4 has no AMRAP', (tm) => {
    expect(prescribedSets(tm, 4).every((s) => !s.amrap)).toBe(true);
  });

  fcTest.prop([tmArb, allWeekArb])('returns 3 sets', (tm, week) => {
    expect(prescribedSets(tm, week)).toHaveLength(3);
  });

  fcTest.prop([tmArb, allWeekArb])('percents strictly increasing', (tm, week) => {
    const [s0, s1, s2] = prescribedSets(tm, week) as [PrescribedSet, PrescribedSet, PrescribedSet];
    expect(s1.percent).toBeGreaterThan(s0.percent);
    expect(s2.percent).toBeGreaterThan(s1.percent);
  });

  fcTest.prop([tmArb, allWeekArb, fc.constantFrom(1, 2.5, 5, 10)])(
    'weights are multiples of roundTo',
    (tm, week, roundTo) => {
      for (const s of prescribedSets(tm, week, { roundTo })) {
        const ratio = s.weight / roundTo;
        expect(Math.abs(ratio - Math.round(ratio))).toBeLessThan(1e-9);
      }
    },
  );

  fcTest.prop([tmArb, allWeekArb])('weights non-decreasing', (tm, week) => {
    const [s0, s1, s2] = prescribedSets(tm, week) as [PrescribedSet, PrescribedSet, PrescribedSet];
    expect(s1.weight).toBeGreaterThanOrEqual(s0.weight);
    expect(s2.weight).toBeGreaterThanOrEqual(s1.weight);
  });
});
