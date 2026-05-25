import { formatWeight } from '../units';

describe('formatWeight', () => {
  it('renders sub-thousand values unchanged', () => {
    expect(formatWeight(0)).toBe('0');
    expect(formatWeight(45)).toBe('45');
    expect(formatWeight(315)).toBe('315');
    expect(formatWeight(999)).toBe('999');
  });

  it('inserts thousands separators at 1000 and above', () => {
    expect(formatWeight(1000)).toBe('1,000');
    expect(formatWeight(1200)).toBe('1,200');
    expect(formatWeight(12345)).toBe('12,345');
    expect(formatWeight(1234567)).toBe('1,234,567');
  });

  it('rounds fractional input to an integer', () => {
    expect(formatWeight(1234.4)).toBe('1,234');
    expect(formatWeight(1234.7)).toBe('1,235');
  });

  it('renders negative values with a leading minus', () => {
    expect(formatWeight(-150)).toBe('-150');
    expect(formatWeight(-1500)).toBe('-1,500');
  });

  it('falls back to 0 on non-finite input', () => {
    expect(formatWeight(Number.NaN)).toBe('0');
    expect(formatWeight(Number.POSITIVE_INFINITY)).toBe('0');
    expect(formatWeight(Number.NEGATIVE_INFINITY)).toBe('0');
  });
});
