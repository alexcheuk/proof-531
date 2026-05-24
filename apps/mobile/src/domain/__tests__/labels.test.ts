import {
  LIFTS,
  dateLabel,
  historyDateLabel,
  isLift,
  liftDisplayName,
  weekIntent,
  weekLabel,
} from '../labels';

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

describe('weekIntent', () => {
  it('returns a per-week intent phrase', () => {
    expect(weekIntent(1)).toBe('Easy 5s · build the groove');
    expect(weekIntent(2)).toBe('Heavy 3s · trust the system');
    expect(weekIntent(3)).toBe('Top single · grind the +');
    expect(weekIntent(4)).toBe('Deload · stay sharp, recover');
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

describe('historyDateLabel', () => {
  const now = new Date(2026, 4, 22, 12, 0, 0).getTime(); // Fri May 22 noon
  it('returns TODAY for the same local day', () => {
    const d = new Date(2026, 4, 22, 9, 30); // earlier same day
    expect(historyDateLabel(d, now)).toBe('TODAY');
  });
  it('returns YESTERDAY for the previous local day', () => {
    const d = new Date(2026, 4, 21, 23, 30); // day before, late
    expect(historyDateLabel(d, now)).toBe('YESTERDAY');
  });
  it('falls back to dateLabel format for older days', () => {
    const d = new Date(2026, 4, 1); // 3 weeks earlier
    expect(historyDateLabel(d, now)).toBe('FRI · MAY 1');
  });
  it('treats future dates as TODAY (defensive — clock skew should not yield negatives)', () => {
    const d = new Date(2026, 4, 23, 10); // tomorrow
    // Future delta is negative; dayDelta rounds → 0 → TODAY (safe fallback).
    expect(historyDateLabel(d, now)).toBe('TODAY');
  });
});
