import { nextTm, tmIncrement } from '../increments';

describe('tmIncrement', () => {
  it('lbs: squat/deadlift → +10', () => {
    expect(tmIncrement('lbs', 'squat')).toBe(10);
    expect(tmIncrement('lbs', 'deadlift')).toBe(10);
  });
  it('lbs: bench/press → +5', () => {
    expect(tmIncrement('lbs', 'bench')).toBe(5);
    expect(tmIncrement('lbs', 'press')).toBe(5);
  });
  it('kg: squat/deadlift → +5', () => {
    expect(tmIncrement('kg', 'squat')).toBe(5);
    expect(tmIncrement('kg', 'deadlift')).toBe(5);
  });
  it('kg: bench/press → +2.5', () => {
    expect(tmIncrement('kg', 'bench')).toBe(2.5);
    expect(tmIncrement('kg', 'press')).toBe(2.5);
  });
});

describe('nextTm', () => {
  it('adds the right delta for each lift/unit', () => {
    expect(nextTm(245, 'squat', 'lbs')).toBe(255);
    expect(nextTm(140, 'press', 'lbs')).toBe(145);
    expect(nextTm(100, 'deadlift', 'kg')).toBe(105);
    expect(nextTm(80, 'bench', 'kg')).toBe(82.5);
  });
});
