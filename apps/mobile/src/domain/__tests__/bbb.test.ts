import { BBB_PCT_OF_TM, BBB_REPS, BBB_SETS, bbbWeightFromTm } from '../bbb';

describe('domain/bbb', () => {
  it('exports the 5×10 @ 50% TM convention', () => {
    expect(BBB_SETS).toBe(5);
    expect(BBB_REPS).toBe(10);
    expect(BBB_PCT_OF_TM).toBe(0.5);
  });

  it('snaps lb weights to the nearest 5 lb increment', () => {
    // 247 * 0.5 = 123.5 → snap to 125 lb (round() rounds to nearest 5).
    expect(bbbWeightFromTm(247, 'lbs')).toBe(125);
    // 300 * 0.5 = 150 → already snapped.
    expect(bbbWeightFromTm(300, 'lbs')).toBe(150);
  });

  it('snaps kg weights to the nearest 2.5 kg increment', () => {
    // 137.5 * 0.5 = 68.75 → snap to 67.5 kg under nearest-2.5 rounding.
    expect(bbbWeightFromTm(137.5, 'kg') % 2.5).toBe(0);
  });
});
