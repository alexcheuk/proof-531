import { fc, it as itProp } from '@fast-check/jest';
import { LIFTS, dateLabel, isLift, liftDisplayName, relativeTimeLabel, weekLabel } from '../labels';

describe('LIFTS', () => {
  it('contains 4 lifts in canonical order', () => {
    expect(LIFTS).toEqual(['squat', 'bench', 'deadlift', 'press']);
  });
});

describe('isLift', () => {
  it('returns true for valid lift strings', () => {
    expect(isLift('squat')).toBe(true);
    expect(isLift('bench')).toBe(true);
  });
  it('returns false otherwise', () => {
    expect(isLift('curl')).toBe(false);
    expect(isLift(undefined)).toBe(false);
  });
});

describe('liftDisplayName', () => {
  it('maps each lift to its title-case display', () => {
    expect(liftDisplayName('squat')).toBe('Squat');
    expect(liftDisplayName('bench')).toBe('Bench');
    expect(liftDisplayName('deadlift')).toBe('Deadlift');
    expect(liftDisplayName('press')).toBe('Press');
  });
});

describe('weekLabel', () => {
  it('returns scheme glyphs for each week', () => {
    expect(weekLabel(1)).toBe('5/5/5+');
    expect(weekLabel(2)).toBe('3/3/3+');
    expect(weekLabel(3)).toBe('5/3/1+');
    expect(weekLabel(4)).toBe('DELOAD');
  });
});

describe('dateLabel', () => {
  it('returns "WED · MAY 22" style string', () => {
    // 2026-05-22 is a Friday (May 22, 2026).
    const d = new Date(2026, 4, 22); // month is 0-based
    // Use day-of-week computed from the date itself to be timezone-resilient.
    expect(dateLabel(d)).toBe('FRI · MAY 22');
  });
});

describe('relativeTimeLabel', () => {
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const NOW = 1_700_000_000_000;

  it('returns "just now" when delta is less than a minute', () => {
    expect(relativeTimeLabel(NOW - 0, NOW)).toBe('just now');
    expect(relativeTimeLabel(NOW - 59_000, NOW)).toBe('just now');
  });

  it('returns "{n} min ago" when delta is < 60 minutes', () => {
    expect(relativeTimeLabel(NOW - MINUTE, NOW)).toBe('1 min ago');
    expect(relativeTimeLabel(NOW - 14 * MINUTE, NOW)).toBe('14 min ago');
    expect(relativeTimeLabel(NOW - 59 * MINUTE, NOW)).toBe('59 min ago');
  });

  it('returns "{n}h ago" when delta is < 24 hours', () => {
    expect(relativeTimeLabel(NOW - HOUR, NOW)).toBe('1h ago');
    expect(relativeTimeLabel(NOW - 5 * HOUR, NOW)).toBe('5h ago');
    expect(relativeTimeLabel(NOW - 23 * HOUR, NOW)).toBe('23h ago');
  });

  it('returns "Yesterday" when delta is between 24h and 48h', () => {
    expect(relativeTimeLabel(NOW - DAY, NOW)).toBe('Yesterday');
    expect(relativeTimeLabel(NOW - (2 * DAY - 1), NOW)).toBe('Yesterday');
  });

  it('returns "{n} days ago" when delta is >= 48h', () => {
    expect(relativeTimeLabel(NOW - 2 * DAY, NOW)).toBe('2 days ago');
    expect(relativeTimeLabel(NOW - 6 * DAY, NOW)).toBe('6 days ago');
  });

  it('handles future-leaning (then > now) by clamping to "just now"', () => {
    // Defensive: clock skew or out-of-order calls shouldn't produce nonsense.
    expect(relativeTimeLabel(NOW + 5_000, NOW)).toBe('just now');
  });

  itProp.prop([fc.integer({ min: 0, max: 7 * 24 * 60 * 60 * 1000 })])(
    'always returns a non-empty string matching a known pattern',
    (delta) => {
      const out = relativeTimeLabel(NOW - delta, NOW);
      expect(out.length).toBeGreaterThan(0);
      expect(
        out === 'just now' ||
          out === 'Yesterday' ||
          /^\d+ min ago$/.test(out) ||
          /^\d+h ago$/.test(out) ||
          /^\d+ days ago$/.test(out),
      ).toBe(true);
    },
  );

  itProp.prop([fc.integer({ min: 0, max: 59_999 })])(
    'returns "just now" for any delta under 60 seconds',
    (delta) => {
      expect(relativeTimeLabel(NOW - delta, NOW)).toBe('just now');
    },
  );
});
