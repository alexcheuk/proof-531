import fc from 'fast-check';
import {
  bbbSets,
  getWorkingSetByIndex,
  isAmrapSet,
  nextWorkingSetIndex,
  prescription,
  tmTestSet,
  warmupsForDay,
} from '../schemes';

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

  it('week 4 TM test: single set at 100% TM, 5 reps (top of band), NO amrap', () => {
    const sets = prescription(4);
    expect(sets).toHaveLength(1);
    expect(sets[0]?.pct).toBe(1.0);
    expect(sets[0]?.reps).toBe(5);
    expect(sets[0]?.kind).toBe('tm-test');
    expect(sets[0]?.amrap).toBeFalsy();
  });

  it('returns fresh array  - mutation does not leak', () => {
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
  it('false on week 4 (TM test is not an AMRAP)', () => {
    expect(isAmrapSet(4, 0)).toBe(false);
  });
});

describe('tmTestSet', () => {
  it('returns the week-4 TM test set spec: 100% TM × 5 reps, kind tm-test', () => {
    const s = tmTestSet();
    expect(s.pct).toBe(1.0);
    expect(s.reps).toBe(5);
    expect(s.kind).toBe('tm-test');
    expect(s.amrap).toBeFalsy();
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
  it('returns the tm-test set for (week 4, index 0)', () => {
    const s = getWorkingSetByIndex(4, 0);
    expect(s.kind).toBe('tm-test');
    expect(s.pct).toBe(1.0);
    expect(s.reps).toBe(5);
  });
  it('throws on (week 4, index 1)  - week 4 only has the test set', () => {
    expect(() => getWorkingSetByIndex(4, 1)).toThrow(RangeError);
    expect(() => getWorkingSetByIndex(4, 2)).toThrow(RangeError);
  });
});

describe('warmupsForDay', () => {
  it('D1: 3 warmups at 40/50/60%', () => {
    const w = warmupsForDay(1);
    expect(w).toHaveLength(3);
    expect(w.map((s) => s.pct)).toEqual([0.4, 0.5, 0.6]);
  });

  it('D2: 3 warmups at 45/55/65%', () => {
    const w = warmupsForDay(2);
    expect(w).toHaveLength(3);
    expect(w.map((s) => s.pct)).toEqual([0.45, 0.55, 0.65]);
  });

  it('D3: 4 warmups at 50/60/70/80%', () => {
    const w = warmupsForDay(3);
    expect(w).toHaveLength(4);
    expect(w.map((s) => s.pct)).toEqual([0.5, 0.6, 0.7, 0.8]);
  });

  it('D4 TM test: 5 warmups at 50/60/70/80/90%', () => {
    const w = warmupsForDay(4);
    expect(w).toHaveLength(5);
    expect(w.map((s) => s.pct)).toEqual([0.5, 0.6, 0.7, 0.8, 0.9]);
  });

  it('all warmup sets have kind "warmup"', () => {
    for (const week of [1, 2, 3, 4] as const) {
      expect(warmupsForDay(week).every((s) => s.kind === 'warmup')).toBe(true);
    }
  });

  it('returns fresh array: mutation does not leak', () => {
    const a = warmupsForDay(1);
    const first = a[0];
    if (first) first.pct = 0;
    expect(warmupsForDay(1)[0]?.pct).toBe(0.4);
  });

  it('property: pcts are strictly ascending', () => {
    fc.assert(
      fc.property(fc.constantFrom(1, 2, 3, 4 as 1 | 2 | 3 | 4), (week) => {
        const pcts = warmupsForDay(week as 1 | 2 | 3 | 4).map((s) => s.pct);
        for (let i = 1; i < pcts.length; i++) {
          if (pcts[i] === undefined || pcts[i - 1] === undefined) return false;
          if ((pcts[i] as number) <= (pcts[i - 1] as number)) return false;
        }
        return true;
      }),
    );
  });

  it('property: all pcts in (0, 1) exclusive', () => {
    fc.assert(
      fc.property(fc.constantFrom(1, 2, 3, 4 as 1 | 2 | 3 | 4), (week) =>
        warmupsForDay(week as 1 | 2 | 3 | 4).every((s) => s.pct > 0 && s.pct < 1),
      ),
    );
  });

  it('property: last warmup pct < top set pct (bridges to, never past)', () => {
    const topSetPcts: Record<1 | 2 | 3 | 4, number> = { 1: 0.85, 2: 0.9, 3: 0.95, 4: 1.0 };
    fc.assert(
      fc.property(fc.constantFrom(1, 2, 3, 4 as 1 | 2 | 3 | 4), (week) => {
        const w = warmupsForDay(week as 1 | 2 | 3 | 4);
        const last = w[w.length - 1];
        return last !== undefined && last.pct < topSetPcts[week as 1 | 2 | 3 | 4];
      }),
    );
  });

  it('property: all reps are positive integers', () => {
    fc.assert(
      fc.property(fc.constantFrom(1, 2, 3, 4 as 1 | 2 | 3 | 4), (week) =>
        warmupsForDay(week as 1 | 2 | 3 | 4).every((s) => Number.isInteger(s.reps) && s.reps > 0),
      ),
    );
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
