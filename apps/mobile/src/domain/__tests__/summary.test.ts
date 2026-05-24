import {
  formatDateLabel,
  formatElapsed,
  formatElapsedCompact,
  volumeOfWorkingSets,
} from '../summary';
import type { SetLog } from '../types';

describe('formatDateLabel', () => {
  it('decomposes a date into weekday + dateLine + year', () => {
    const d = new Date(2026, 4, 22); // May 22, 2026 = Friday
    expect(formatDateLabel(d)).toEqual({
      weekday: 'FRI',
      dateLine: 'MAY 22',
      year: '2026',
    });
  });
});

describe('formatElapsed', () => {
  const t0 = 1_700_000_000_000;
  it('mm:ss when < 60 min', () => {
    expect(formatElapsed(t0, t0 + 65 * 1000)).toBe('1:05');
    expect(formatElapsed(t0, t0 + 5 * 1000)).toBe('0:05');
  });
  it('H:MM when >= 60 min', () => {
    expect(formatElapsed(t0, t0 + (61 * 60 + 30) * 1000)).toBe('1:01');
    expect(formatElapsed(t0, t0 + 2 * 3600 * 1000)).toBe('2:00');
  });
  it('negative or zero → 0:00', () => {
    expect(formatElapsed(t0, t0)).toBe('0:00');
    expect(formatElapsed(t0 + 1000, t0)).toBe('0:00');
  });
});

describe('formatElapsedCompact', () => {
  const t0 = 1_700_000_000_000;
  it('renders "Nm" under 60 minutes', () => {
    expect(formatElapsedCompact(t0, t0 + 47 * 60 * 1000)).toBe('47m');
    expect(formatElapsedCompact(t0, t0 + 5 * 60 * 1000)).toBe('5m');
  });
  it('rounds positive sub-minute spans up to 1m so the row never reads 0m', () => {
    expect(formatElapsedCompact(t0, t0 + 30 * 1000)).toBe('1m');
  });
  it('returns 0m for a zero or negative span', () => {
    expect(formatElapsedCompact(t0, t0)).toBe('0m');
    expect(formatElapsedCompact(t0 + 1000, t0)).toBe('0m');
  });
  it('renders "Nh Mm" past 60 minutes, dropping the minutes when 0', () => {
    expect(formatElapsedCompact(t0, t0 + (61 * 60 + 30) * 1000)).toBe('1h 1m');
    expect(formatElapsedCompact(t0, t0 + 90 * 60 * 1000)).toBe('1h 30m');
    expect(formatElapsedCompact(t0, t0 + 2 * 3600 * 1000)).toBe('2h');
  });
});

describe('volumeOfWorkingSets', () => {
  const baseLog = { sessionId: 1, prescribedReps: 5, completedAt: 0 };
  it('sums working + amrap sets only', () => {
    const logs: SetLog[] = [
      { ...baseLog, index: 0, kind: 'working', prescribedWeight: 100, actualReps: 5 },
      { ...baseLog, index: 1, kind: 'working', prescribedWeight: 110, actualReps: 5 },
      { ...baseLog, index: 2, kind: 'amrap', prescribedWeight: 120, actualReps: 6 },
      { ...baseLog, index: 0, kind: 'warmup', prescribedWeight: 50, actualReps: 5 },
      { ...baseLog, index: 0, kind: 'bbb', prescribedWeight: 80, actualReps: 10 },
    ];
    // 100*5 + 110*5 + 120*6 = 500 + 550 + 720 = 1770
    expect(volumeOfWorkingSets(logs)).toBe(1770);
  });
  it('returns 0 on empty', () => {
    expect(volumeOfWorkingSets([])).toBe(0);
  });
});
