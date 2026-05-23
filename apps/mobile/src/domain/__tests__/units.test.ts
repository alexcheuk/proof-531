import fc from 'fast-check';
import type { Unit } from '../types';
import {
  convert,
  convertAndSnap,
  convertWeight,
  displayUnit,
  displayWeight,
  round,
  snapWeight,
  trainingMaxFrom,
} from '../units';

describe('round', () => {
  it('snaps lbs to nearest 5', () => {
    expect(round(127, 'lbs')).toBe(125);
    expect(round(128, 'lbs')).toBe(130);
    expect(round(0, 'lbs')).toBe(0);
    expect(round(-50, 'lbs')).toBe(0);
  });

  it('snaps kg to nearest 2.5', () => {
    expect(round(57.6, 'kg')).toBe(57.5);
    expect(round(58.8, 'kg')).toBe(60);
  });

  it('property: idempotent — round(round(x)) === round(x)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000, noNaN: true }),
        fc.constantFrom<Unit>('lbs', 'kg'),
        (w, u) => {
          const once = round(w, u);
          const twice = round(once, u);
          return once === twice;
        },
      ),
    );
  });
});

describe('convert', () => {
  it('returns same value when units match (no snap when snap=false)', () => {
    expect(convert(225, 'lbs', 'lbs', { snap: false })).toBe(225);
  });

  it('lbs→kg snapped: 225 lb → ~102.06 kg → snap to 102.5 kg', () => {
    expect(convert(225, 'lbs', 'kg')).toBe(102.5);
  });

  it('kg→lbs snapped: 100 kg → ~220.46 lb → snap to 220 lb', () => {
    expect(convert(100, 'kg', 'lbs')).toBe(220);
  });

  it('property: round-trip lbs→kg→lbs is within rounding tolerance', () => {
    // PWA tolerance: snap step is 5 lb. Round-tripping through kg's 2.5 step
    // can shift up to ~5 lb. Use 6 lb tolerance for safety on extremes.
    fc.assert(
      fc.property(
        fc
          .integer({ min: 0, max: 1000 })
          .map((n) => n * 5), // valid lbs multiples
        (x) => {
          const kg = convert(x, 'lbs', 'kg');
          const back = convert(kg, 'kg', 'lbs');
          return Math.abs(back - x) <= 6;
        },
      ),
    );
  });

  it('snap=false: bare conversion preserves precision', () => {
    expect(convert(100, 'lbs', 'kg', { snap: false })).toBeCloseTo(45.359237, 6);
  });
});

describe('displayUnit', () => {
  it('maps lbs → lb, kg → kg', () => {
    expect(displayUnit('lbs')).toBe('lb');
    expect(displayUnit('kg')).toBe('kg');
  });
});

describe('trainingMaxFrom', () => {
  it('returns 90% of 1RM snapped to unit step', () => {
    expect(trainingMaxFrom(225, 'lbs')).toBe(205); // 202.5 snaps to 205 (5 lb step)
    expect(trainingMaxFrom(100, 'kg')).toBe(90);
  });
});

describe('PWA back-compat aliases', () => {
  it('snapWeight === round', () => {
    expect(snapWeight).toBe(round);
  });

  it('convertAndSnap matches convert with snap=true', () => {
    expect(convertAndSnap(225, 'lbs', 'kg')).toBe(convert(225, 'lbs', 'kg', { snap: true }));
    expect(convertAndSnap(100, 'kg', 'lbs')).toBe(220);
  });

  it('convertWeight short-circuits to identity when units match (no snap)', () => {
    expect(convertWeight(212.5, 'lbs', 'lbs')).toBe(212.5); // precision preserved
    expect(convertWeight(45.359, 'kg', 'kg')).toBe(45.359);
  });

  it('convertWeight preserves precision across units', () => {
    expect(convertWeight(100, 'lbs', 'kg')).toBeCloseTo(45.359237, 6);
  });
});

describe('displayWeight', () => {
  it('returns the storage value snapped when storage === display', () => {
    expect(displayWeight(215, 'lbs', 'lbs')).toBe(215);
    expect(displayWeight(112.5, 'kg', 'kg')).toBe(112.5);
  });

  it('converts and snaps to the display step on cross-unit render', () => {
    // 215 lb × 0.45359237 = 97.522… kg → snap to nearest 2.5 = 97.5 kg
    expect(displayWeight(215, 'lbs', 'kg')).toBe(97.5);
    // 100 kg ≈ 220.462 lb → snap to nearest 5 = 220 lb
    expect(displayWeight(100, 'kg', 'lbs')).toBe(220);
  });
});
