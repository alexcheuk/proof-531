import { type LiftCategory, advanceCycle, nextTrainingMax } from '..';

describe('nextTrainingMax', () => {
  it('upper category bumps +5', () => {
    expect(nextTrainingMax(135, 'upper')).toBe(140);
  });
  it('lower category bumps +10', () => {
    expect(nextTrainingMax(225, 'lower')).toBe(235);
  });
  it('returns current unchanged when TM is 0', () => {
    expect(nextTrainingMax(0, 'upper')).toBe(0);
    expect(nextTrainingMax(0, 'lower')).toBe(0);
  });
  it('returns current unchanged when TM is negative', () => {
    expect(nextTrainingMax(-50, 'upper')).toBe(-50);
  });
  it('handles fractional TM (kg gyms)', () => {
    expect(nextTrainingMax(102.5, 'upper')).toBe(107.5);
    expect(nextTrainingMax(102.5, 'lower')).toBe(112.5);
  });
  it('throws on invalid category', () => {
    expect(() => nextTrainingMax(100, 'middle' as LiftCategory)).toThrow();
  });
  it('throws on NaN current', () => {
    expect(() => nextTrainingMax(Number.NaN, 'upper')).toThrow();
  });
});

describe('advanceCycle', () => {
  it('increments cycle, resets week to 1', () => {
    expect(advanceCycle({ cycle: 1, week: 4 })).toEqual({ cycle: 2, week: 1 });
    expect(advanceCycle({ cycle: 7, week: 2 })).toEqual({ cycle: 8, week: 1 });
  });
  it('throws on non-positive cycle', () => {
    expect(() => advanceCycle({ cycle: 0, week: 1 })).toThrow();
    expect(() => advanceCycle({ cycle: -1, week: 1 })).toThrow();
  });
  it('throws on non-integer cycle', () => {
    expect(() => advanceCycle({ cycle: 1.5, week: 1 })).toThrow();
  });
});
