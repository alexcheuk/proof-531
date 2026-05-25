import { formatClock, formatMmSs } from '../time';

describe('formatMmSs', () => {
  it('formats whole minutes', () => {
    expect(formatMmSs(60)).toBe('1:00');
    expect(formatMmSs(120)).toBe('2:00');
  });
  it('pads seconds', () => {
    expect(formatMmSs(5)).toBe('0:05');
    expect(formatMmSs(65)).toBe('1:05');
    expect(formatMmSs(90)).toBe('1:30');
  });
  it('clamps non-positive input to 0:00', () => {
    expect(formatMmSs(0)).toBe('0:00');
    expect(formatMmSs(-3)).toBe('0:00');
    expect(formatMmSs(Number.NEGATIVE_INFINITY)).toBe('0:00');
  });
  it('floors fractional seconds', () => {
    expect(formatMmSs(59.9)).toBe('0:59');
  });
});

describe('formatClock', () => {
  it('uses leading-zero minutes under an hour', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(5)).toBe('00:05');
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(3599)).toBe('59:59');
  });
  it('switches to H:MM:SS at one hour', () => {
    expect(formatClock(3600)).toBe('1:00:00');
    expect(formatClock(3725)).toBe('1:02:05');
  });
  it('clamps to 0', () => {
    expect(formatClock(-100)).toBe('00:00');
  });
});
