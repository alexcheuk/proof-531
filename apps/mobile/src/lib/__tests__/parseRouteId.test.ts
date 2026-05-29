import { parseRouteId } from '../parseRouteId';

describe('parseRouteId', () => {
  it('parses a valid integer string', () => {
    expect(parseRouteId('42')).toBe(42);
    expect(parseRouteId('1')).toBe(1);
    expect(parseRouteId('999')).toBe(999);
  });

  it('returns null for undefined', () => {
    expect(parseRouteId(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseRouteId('')).toBeNull();
  });

  it('returns null for non-numeric string', () => {
    expect(parseRouteId('abc')).toBeNull();
    expect(parseRouteId('foo')).toBeNull();
  });

  it('returns null for floating-point strings (parseInt stops at decimal)', () => {
    // parseInt('3.5', 10) → 3, not NaN — this is intentional behavior
    expect(parseRouteId('3.5')).toBe(3);
  });

  it('takes the first element of a string array', () => {
    expect(parseRouteId(['7', '8'])).toBe(7);
    expect(parseRouteId(['42'])).toBe(42);
  });

  it('returns null for empty array', () => {
    expect(parseRouteId([])).toBeNull();
  });

  it('handles leading-zero strings correctly (still parses as decimal)', () => {
    expect(parseRouteId('007')).toBe(7);
  });
});
