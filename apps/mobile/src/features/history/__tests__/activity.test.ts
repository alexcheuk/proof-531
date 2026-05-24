import type { Session } from '@/data/accessors/session';
import { currentStreak, longestStreakDays, recentActivity } from '../activity';

function makeSession(startedAt: number, status: Session['status'] = 'completed'): Session {
  return {
    id: startedAt,
    lift: 'squat',
    cycle: 1,
    week: 1,
    startedAt,
    endedAt: startedAt + 1,
    status,
    trainingMaxSnapshot: 100,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
  };
}

const DAY = 24 * 60 * 60 * 1000;
// Fix "now" to a stable mid-day so timezone offsets don't tip us into the
// adjacent day.
const NOW = new Date('2026-05-15T12:00:00').getTime();
const TODAY_MIDNIGHT = (() => {
  const d = new Date(NOW);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();

describe('recentActivity', () => {
  it('returns all-false when no sessions exist', () => {
    expect(recentActivity([], 7, NOW)).toEqual([false, false, false, false, false, false, false]);
  });

  it('marks today when there is a session today', () => {
    const sessions = [makeSession(TODAY_MIDNIGHT + 3 * 60 * 60 * 1000)];
    const out = recentActivity(sessions, 5, NOW);
    // Window is oldest → newest, so today is the last entry.
    expect(out[out.length - 1]).toBe(true);
    expect(out.slice(0, -1).every((b) => b === false)).toBe(true);
  });

  it('respects local-day bucketing — a session 30 minutes apart on the same day collapses', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT + 8 * 60 * 60 * 1000),
      makeSession(TODAY_MIDNIGHT + 8.5 * 60 * 60 * 1000),
    ];
    const out = recentActivity(sessions, 3, NOW);
    expect(out).toEqual([false, false, true]);
  });

  it('ignores cancelled and in-progress sessions', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT, 'cancelled'),
      makeSession(TODAY_MIDNIGHT, 'in_progress'),
    ];
    expect(recentActivity(sessions, 3, NOW)).toEqual([false, false, false]);
  });

  it('counts sessions across multiple distinct days', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT - 3 * DAY), // 3 days ago
      makeSession(TODAY_MIDNIGHT - 1 * DAY), // yesterday
      makeSession(TODAY_MIDNIGHT), // today
    ];
    const out = recentActivity(sessions, 5, NOW);
    // Window: [d-4, d-3, d-2, d-1, today]
    expect(out).toEqual([false, true, false, true, true]);
  });
});

describe('currentStreak', () => {
  it('returns 0 when today is empty', () => {
    expect(currentStreak([true, true, false])).toBe(0);
  });

  it('counts consecutive trailing days', () => {
    expect(currentStreak([false, true, true, true])).toBe(3);
  });

  it('returns the full length when every day is filled', () => {
    expect(currentStreak([true, true, true])).toBe(3);
  });

  it('returns 0 on an empty bitmap', () => {
    expect(currentStreak([])).toBe(0);
  });
});

describe('longestStreakDays', () => {
  it('returns 0 when no completed sessions exist', () => {
    expect(longestStreakDays([])).toBe(0);
    expect(longestStreakDays([makeSession(TODAY_MIDNIGHT, 'cancelled')])).toBe(0);
  });

  it('returns 1 for a single completed session', () => {
    expect(longestStreakDays([makeSession(TODAY_MIDNIGHT)])).toBe(1);
  });

  it('counts consecutive days as one run', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT - 2 * DAY),
      makeSession(TODAY_MIDNIGHT - 1 * DAY),
      makeSession(TODAY_MIDNIGHT),
    ];
    expect(longestStreakDays(sessions)).toBe(3);
  });

  it('returns the longest of multiple disjoint runs', () => {
    const sessions = [
      // Run of 4
      makeSession(TODAY_MIDNIGHT - 30 * DAY),
      makeSession(TODAY_MIDNIGHT - 29 * DAY),
      makeSession(TODAY_MIDNIGHT - 28 * DAY),
      makeSession(TODAY_MIDNIGHT - 27 * DAY),
      // Gap
      // Run of 2
      makeSession(TODAY_MIDNIGHT - 10 * DAY),
      makeSession(TODAY_MIDNIGHT - 9 * DAY),
      // Singleton
      makeSession(TODAY_MIDNIGHT),
    ];
    expect(longestStreakDays(sessions)).toBe(4);
  });

  it('collapses multiple sessions on the same day into one day', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT + 1 * 60 * 60 * 1000),
      makeSession(TODAY_MIDNIGHT + 6 * 60 * 60 * 1000),
      makeSession(TODAY_MIDNIGHT + 12 * 60 * 60 * 1000),
    ];
    expect(longestStreakDays(sessions)).toBe(1);
  });

  it('ignores cancelled and in-progress rows when computing runs', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT - 3 * DAY),
      makeSession(TODAY_MIDNIGHT - 2 * DAY, 'cancelled'),
      makeSession(TODAY_MIDNIGHT - 1 * DAY),
      makeSession(TODAY_MIDNIGHT),
    ];
    // Cancelled day breaks the run; longest is days -1 and 0 → 2.
    expect(longestStreakDays(sessions)).toBe(2);
  });
});
