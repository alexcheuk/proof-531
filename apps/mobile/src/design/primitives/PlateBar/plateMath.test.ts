import { groupPlates, sizeFor } from './plateMath';

describe('groupPlates', () => {
  it('returns an empty array for empty input', () => {
    expect(groupPlates([])).toEqual([]);
  });

  it('coalesces consecutive equal weights', () => {
    expect(groupPlates([45, 45, 25, 10, 10, 5])).toEqual([
      { weight: 45, count: 2 },
      { weight: 25, count: 1 },
      { weight: 10, count: 2 },
      { weight: 5, count: 1 },
    ]);
  });

  it('does NOT re-group when the same weight re-appears non-adjacently', () => {
    expect(groupPlates([45, 25, 45])).toEqual([
      { weight: 45, count: 1 },
      { weight: 25, count: 1 },
      { weight: 45, count: 1 },
    ]);
  });
});

describe('sizeFor', () => {
  it('maps lb min (2.5) and max (45) to the ramp endpoints', () => {
    expect(sizeFor(2.5, 'lb')).toBeCloseTo(0.36, 5);
    expect(sizeFor(45, 'lb')).toBeCloseTo(1, 5);
  });

  it('maps kg min (1.25) and max (25) to the ramp endpoints', () => {
    expect(sizeFor(1.25, 'kg')).toBeCloseTo(0.36, 5);
    expect(sizeFor(25, 'kg')).toBeCloseTo(1, 5);
  });

  it('clamps plates above max to 1.0', () => {
    expect(sizeFor(100, 'lb')).toBeCloseTo(1, 5);
  });

  it('clamps plates below min to the floor', () => {
    expect(sizeFor(0, 'lb')).toBeCloseTo(0.36, 5);
  });

  it('treats unknown unit glyphs as lb', () => {
    expect(sizeFor(45, 'pounds')).toBeCloseTo(1, 5);
  });
});
