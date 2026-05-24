import type { Lift } from '@/domain/types';
import { nextEnabledLifts } from '../nextEnabledLifts';

describe('nextEnabledLifts', () => {
  const ALL: Lift[] = ['squat', 'bench', 'deadlift', 'press'];

  it('removes a lift when it is currently enabled', () => {
    expect(nextEnabledLifts(ALL, 'bench')).toEqual(['squat', 'deadlift', 'press']);
  });

  it('adds a missing lift in LIFT_ORDER position (not insertion order)', () => {
    expect(nextEnabledLifts(['squat', 'press'], 'deadlift')).toEqual([
      'squat',
      'deadlift',
      'press',
    ]);
  });

  it('returns the SAME reference when toggling the only enabled lift', () => {
    const input: Lift[] = ['squat'];
    expect(nextEnabledLifts(input, 'squat')).toBe(input);
  });

  it('does not duplicate when adding a lift already present (defensive)', () => {
    // The toggle gate normally prevents this, but the result must still be
    // canonical LIFT_ORDER without duplicates.
    expect(nextEnabledLifts(['squat'], 'bench')).toEqual(['squat', 'bench']);
  });

  it('adds bench to the correct LIFT_ORDER slot regardless of input order', () => {
    expect(nextEnabledLifts(['press', 'deadlift'], 'bench')).toEqual([
      'bench',
      'deadlift',
      'press',
    ]);
  });
});
