import { fc, test as fcTest } from '@fast-check/jest';
import { calcPlates } from '..';

const LBS_INV = [
  { size: 45, count: 8 },
  { size: 35, count: 2 },
  { size: 25, count: 2 },
  { size: 10, count: 2 },
  { size: 5, count: 2 },
  { size: 2.5, count: 2 },
];
const KG_INV = [
  { size: 25, count: 4 },
  { size: 20, count: 2 },
  { size: 15, count: 2 },
  { size: 10, count: 2 },
  { size: 5, count: 2 },
  { size: 2.5, count: 2 },
  { size: 1.25, count: 2 },
];

describe('calcPlates — fixed targets (lbs, 45 lb bar)', () => {
  it('135 lb', () =>
    expect(calcPlates({ target: 135, bar: 45, inventory: LBS_INV })).toEqual({
      plates: [45],
      remainder: 0,
    }));
  it('225 lb', () =>
    expect(calcPlates({ target: 225, bar: 45, inventory: LBS_INV })).toEqual({
      plates: [45, 45],
      remainder: 0,
    }));
  it('315 lb', () =>
    expect(calcPlates({ target: 315, bar: 45, inventory: LBS_INV })).toEqual({
      plates: [45, 45, 45],
      remainder: 0,
    }));
  it('185 lb = 45 + 25 (greedy)', () =>
    expect(calcPlates({ target: 185, bar: 45, inventory: LBS_INV })).toEqual({
      plates: [45, 25],
      remainder: 0,
    }));
});

describe('calcPlates — metric (20 kg bar)', () => {
  it('60 kg = one 20 per side', () =>
    expect(calcPlates({ target: 60, bar: 20, inventory: KG_INV })).toEqual({
      plates: [20],
      remainder: 0,
    }));
  it('100 kg = 25+15 per side', () =>
    expect(calcPlates({ target: 100, bar: 20, inventory: KG_INV })).toEqual({
      plates: [25, 15],
      remainder: 0,
    }));
});

describe('calcPlates — insufficient inventory', () => {
  it('returns remainder when out of large plates', () => {
    expect(
      calcPlates({
        target: 225,
        bar: 45,
        inventory: [
          { size: 45, count: 1 },
          { size: 25, count: 0 },
        ],
      }),
    ).toEqual({ plates: [45], remainder: 90 });
  });
  it('target equals bar', () =>
    expect(calcPlates({ target: 45, bar: 45, inventory: LBS_INV })).toEqual({
      plates: [],
      remainder: 0,
    }));
  it('target less than bar', () =>
    expect(calcPlates({ target: 30, bar: 45, inventory: LBS_INV })).toEqual({
      plates: [],
      remainder: -15,
    }));
  it('empty inventory leaves full per-side remainder', () =>
    expect(calcPlates({ target: 225, bar: 45, inventory: [] })).toEqual({
      plates: [],
      remainder: 180,
    }));
});

describe('calcPlates — invalid input', () => {
  it('throws on negative target', () =>
    expect(() => calcPlates({ target: -1, bar: 45, inventory: LBS_INV })).toThrow());
  it('throws on negative bar', () =>
    expect(() => calcPlates({ target: 100, bar: -1, inventory: LBS_INV })).toThrow());
  it('throws on negative inventory count', () =>
    expect(() =>
      calcPlates({
        target: 100,
        bar: 45,
        inventory: [{ size: 45, count: -1 }],
      }),
    ).toThrow());
  it('throws on non-positive plate size', () =>
    expect(() =>
      calcPlates({
        target: 100,
        bar: 45,
        inventory: [{ size: 0, count: 2 }],
      }),
    ).toThrow());
  it('throws on NaN target', () =>
    expect(() => calcPlates({ target: Number.NaN, bar: 45, inventory: LBS_INV })).toThrow());
  it('throws on Infinity bar', () =>
    expect(() =>
      calcPlates({ target: 100, bar: Number.POSITIVE_INFINITY, inventory: LBS_INV }),
    ).toThrow());
  it('throws on non-integer count', () =>
    expect(() =>
      calcPlates({
        target: 100,
        bar: 45,
        inventory: [{ size: 45, count: 1.5 }],
      }),
    ).toThrow());
});

describe('calcPlates — properties', () => {
  const plateSizeArb = fc.constantFrom(45, 35, 25, 20, 15, 10, 5, 2.5, 1.25);
  const invArb = fc.uniqueArray(
    fc.record({
      size: plateSizeArb,
      count: fc.integer({ min: 0, max: 10 }),
    }),
    {
      selector: (e: { size: number }) => e.size,
      minLength: 0,
      maxLength: 9,
    },
  );
  const targetArb = fc.integer({ min: 0, max: 1000 });
  const barArb = fc.constantFrom(0, 15, 20, 25, 35, 45);

  fcTest.prop([targetArb, barArb, invArb])(
    'invariant: sum(plates)*2+bar+remainder===target',
    (target, bar, inventory) => {
      const { plates, remainder } = calcPlates({ target, bar, inventory });
      const sum = plates.reduce((a, b) => a + b, 0);
      expect(Math.abs(sum * 2 + bar + remainder - target)).toBeLessThan(1e-2);
    },
  );

  fcTest.prop([targetArb, barArb, invArb])('non-increasing order', (target, bar, inventory) => {
    const { plates } = calcPlates({ target, bar, inventory });
    for (let i = 1; i < plates.length; i++) {
      expect(plates[i - 1]).toBeGreaterThanOrEqual(plates[i] as number);
    }
  });

  fcTest.prop([targetArb, barArb, invArb])(
    'no plate exceeds inventory count',
    (target, bar, inventory) => {
      const { plates } = calcPlates({ target, bar, inventory });
      const used = new Map<number, number>();
      for (const p of plates) used.set(p, (used.get(p) ?? 0) + 1);
      for (const [size, n] of used) {
        const inv = inventory.find((i) => i.size === size);
        expect(n).toBeLessThanOrEqual(inv?.count ?? 0);
      }
    },
  );

  fcTest.prop([targetArb, barArb, invArb])(
    'remainder >= 0 when target >= bar',
    (target, bar, inventory) => {
      const { remainder } = calcPlates({ target, bar, inventory });
      if (target >= bar) expect(remainder).toBeGreaterThanOrEqual(-1e-2);
    },
  );
});
