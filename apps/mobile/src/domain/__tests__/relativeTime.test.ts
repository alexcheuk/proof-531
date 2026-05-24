import { formatRelativeTime } from '../relativeTime';

const NOW = new Date('2026-05-15T12:00:00Z').getTime();
const DAY = 86400 * 1000;

describe('formatRelativeTime', () => {
  it('returns `today` for any timestamp within the last day', () => {
    expect(formatRelativeTime(NOW, NOW)).toBe('today');
    expect(formatRelativeTime(NOW - 3 * 3600 * 1000, NOW)).toBe('today');
  });

  it('returns `yesterday` for 1 day ago', () => {
    expect(formatRelativeTime(NOW - DAY, NOW)).toBe('yesterday');
  });

  it('returns N days ago for 2..6 days', () => {
    expect(formatRelativeTime(NOW - 2 * DAY, NOW)).toBe('2 days ago');
    expect(formatRelativeTime(NOW - 6 * DAY, NOW)).toBe('6 days ago');
  });

  it('returns N weeks ago for 7..29 days', () => {
    expect(formatRelativeTime(NOW - 7 * DAY, NOW)).toBe('1 week ago');
    expect(formatRelativeTime(NOW - 14 * DAY, NOW)).toBe('2 weeks ago');
    expect(formatRelativeTime(NOW - 28 * DAY, NOW)).toBe('4 weeks ago');
  });

  it('returns N months ago for 30..364 days', () => {
    expect(formatRelativeTime(NOW - 30 * DAY, NOW)).toBe('1 month ago');
    expect(formatRelativeTime(NOW - 90 * DAY, NOW)).toBe('3 months ago');
  });

  it('returns N years ago for ≥ 365 days', () => {
    expect(formatRelativeTime(NOW - 365 * DAY, NOW)).toBe('1 year ago');
    expect(formatRelativeTime(NOW - 800 * DAY, NOW)).toBe('2 years ago');
  });

  it('treats future timestamps as today (clock-skew safety)', () => {
    expect(formatRelativeTime(NOW + DAY, NOW)).toBe('today');
  });
});
