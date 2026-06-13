import { pctToDisplay } from '../pct';

describe('pctToDisplay', () => {
  it.each([
    [0.85, 85],
    [0.9, 90],
    [1.0, 100],
    [0.65, 65],
    [0.4, 40],
    [0.333, 33],
    [0.667, 67],
  ] as [number, number][])('pctToDisplay(%f) === %d', (pct, expected) => {
    expect(pctToDisplay(pct)).toBe(expected);
  });
});
