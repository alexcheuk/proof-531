import { deriveCycleProgress } from '../cycleProgress';

describe('deriveCycleProgress', () => {
  it('week 1 with 4 lifts → day 1 of 16, "3 weeks until deload"', () => {
    expect(deriveCycleProgress(1, 4)).toEqual({
      dayOfCycle: 1,
      totalDays: 16,
      caption: '3 weeks until deload',
    });
  });

  it('week 3 with 4 lifts → day 9 of 16, "1 week until deload" (singular)', () => {
    expect(deriveCycleProgress(3, 4)).toEqual({
      dayOfCycle: 9,
      totalDays: 16,
      caption: '1 week until deload',
    });
  });

  it('week 4 → deload caption', () => {
    expect(deriveCycleProgress(4, 4).caption).toBe('Deload week · light loads');
  });

  it('scales totalDays with enabledLifts', () => {
    expect(deriveCycleProgress(1, 2).totalDays).toBe(8);
    expect(deriveCycleProgress(1, 1).totalDays).toBe(4);
  });

  it('floors liftsPerCycle to at least 1', () => {
    expect(deriveCycleProgress(1, 0).totalDays).toBe(4);
    expect(deriveCycleProgress(1, -3).totalDays).toBe(4);
  });

  it('clamps week to [1, 4]', () => {
    expect(deriveCycleProgress(0, 4).dayOfCycle).toBe(1);
    expect(deriveCycleProgress(7, 4).caption).toBe('Deload week · light loads');
  });
});
