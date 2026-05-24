import { type PrRow, pickBestLift } from '../bestLift';

const ROW = (over: Partial<PrRow>): PrRow => ({
  lift: 'squat',
  bestE1RM: 250,
  achievedAt: 1,
  ...over,
});

describe('pickBestLift', () => {
  it('returns null when no PRs exist', () => {
    expect(pickBestLift([], 'lbs', 'lbs')).toBeNull();
  });

  it('picks the heaviest e1RM regardless of order', () => {
    const out = pickBestLift(
      [
        ROW({ lift: 'squat', bestE1RM: 300, achievedAt: 5 }),
        ROW({ lift: 'bench', bestE1RM: 250, achievedAt: 3 }),
        ROW({ lift: 'deadlift', bestE1RM: 400, achievedAt: 4 }),
      ],
      'lbs',
      'lbs',
    );
    expect(out?.lift).toBe('deadlift');
    expect(out?.e1RMDisplay).toBe(400);
    expect(out?.unitGlyph).toBe('lb');
  });

  it('breaks ties by earlier achievement', () => {
    const out = pickBestLift(
      [
        ROW({ lift: 'bench', bestE1RM: 250, achievedAt: 200 }),
        ROW({ lift: 'squat', bestE1RM: 250, achievedAt: 100 }),
      ],
      'lbs',
      'lbs',
    );
    expect(out?.lift).toBe('squat');
  });

  it('converts the best e1RM into the display unit', () => {
    const out = pickBestLift([ROW({ lift: 'squat', bestE1RM: 250 })], 'lbs', 'kg');
    expect(out?.unitGlyph).toBe('kg');
    // 250 lb → ~113 kg
    expect(out?.e1RMDisplay).toBeGreaterThan(100);
    expect(out?.e1RMDisplay).toBeLessThan(120);
  });
});
