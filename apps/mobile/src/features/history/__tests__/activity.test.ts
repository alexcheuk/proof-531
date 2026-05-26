import type { Session } from '@/data/accessors/session';
import {
  currentStreak,
  currentStreakDays,
  daysSinceFirstSession,
  firstSessionDate,
  longestStreakDays,
  recentActivity,
  sessionsThisWeek,
} from '../activity';

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
  it('keeps the streak alive when today is empty but yesterday is filled', () => {
    // Grace-day rule — matches currentStreakDays.
    expect(currentStreak([true, true, false])).toBe(2);
  });

  it('returns 0 when both today and yesterday are empty', () => {
    expect(currentStreak([true, true, false, false])).toBe(0);
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

describe('daysSinceFirstSession', () => {
  it('returns 0 when no completed sessions exist', () => {
    expect(daysSinceFirstSession([], NOW)).toBe(0);
    expect(daysSinceFirstSession([makeSession(TODAY_MIDNIGHT, 'cancelled')], NOW)).toBe(0);
  });

  it('returns 1 for a session that happened today', () => {
    expect(daysSinceFirstSession([makeSession(TODAY_MIDNIGHT)], NOW)).toBe(1);
  });

  it('counts inclusive day span from earliest completed session', () => {
    // Window of 60 days back from mid-May avoids the March/November DST
    // crossings — the helper uses local-midnight setHours bucketing, which
    // is rounded against MS arithmetic and would otherwise be off by ±1.
    const sessions = [
      makeSession(TODAY_MIDNIGHT - 60 * DAY),
      makeSession(TODAY_MIDNIGHT - 14 * DAY),
      makeSession(TODAY_MIDNIGHT),
    ];
    expect(daysSinceFirstSession(sessions, NOW)).toBe(61);
  });

  it('ignores cancelled rows when picking the earliest', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT - 100 * DAY, 'cancelled'),
      makeSession(TODAY_MIDNIGHT - 30 * DAY),
    ];
    expect(daysSinceFirstSession(sessions, NOW)).toBe(31);
  });
});

describe('currentStreakDays', () => {
  it('keeps the streak alive when today is a rest day but yesterday was trained', () => {
    // "Don't break the chain" — the user gets one grace day before the
    // streak resets. Trained yesterday with nothing today → still 1.
    const sessions = [makeSession(TODAY_MIDNIGHT - 1 * DAY)];
    expect(currentStreakDays(sessions, NOW)).toBe(1);
  });

  it('returns 0 when the last training day is two-or-more days ago', () => {
    const sessions = [makeSession(TODAY_MIDNIGHT - 2 * DAY)];
    expect(currentStreakDays(sessions, NOW)).toBe(0);
  });

  it('returns 1 when only today is a training day', () => {
    expect(currentStreakDays([makeSession(TODAY_MIDNIGHT)], NOW)).toBe(1);
  });

  it('walks back through consecutive prior days', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT - 4 * DAY),
      makeSession(TODAY_MIDNIGHT - 3 * DAY),
      makeSession(TODAY_MIDNIGHT - 2 * DAY),
      makeSession(TODAY_MIDNIGHT - 1 * DAY),
      makeSession(TODAY_MIDNIGHT),
    ];
    expect(currentStreakDays(sessions, NOW)).toBe(5);
  });

  it('stops the count when a day in the run is empty', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT - 4 * DAY),
      // gap on day -3
      makeSession(TODAY_MIDNIGHT - 2 * DAY),
      makeSession(TODAY_MIDNIGHT - 1 * DAY),
      makeSession(TODAY_MIDNIGHT),
    ];
    expect(currentStreakDays(sessions, NOW)).toBe(3);
  });

  it('counts beyond the 14-day window that the recent-activity helper caps at', () => {
    const sessions = Array.from({ length: 20 }, (_, i) => makeSession(TODAY_MIDNIGHT - i * DAY));
    expect(currentStreakDays(sessions, NOW)).toBe(20);
  });

  it('ignores cancelled and in-progress rows', () => {
    const sessions = [
      makeSession(TODAY_MIDNIGHT - 2 * DAY),
      makeSession(TODAY_MIDNIGHT, 'cancelled'),
    ];
    expect(currentStreakDays(sessions, NOW)).toBe(0);
  });

  it('walks back across a DST boundary using calendar arithmetic (regression)', () => {
    // Day after US spring-forward 2026-03-08 in Pacific time. Naive
    // `cursor -= DAY_MS` arithmetic from the local midnight bucket lands
    // 1 hour before the prior local midnight, missing the bucket and
    // killing the streak at 1. Calendar-day arithmetic survives.
    //
    // In TZs without DST this test exercises the same code path with
    // identical results — it's a no-op there, but a guard on DST locales.
    const now = new Date('2026-03-09T12:00:00');
    const sessions = [0, 1, 2].map((i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(10, 0, 0, 0);
      return makeSession(d.getTime());
    });
    expect(currentStreakDays(sessions, now.getTime())).toBe(3);
  });
});

describe('firstSessionDate', () => {
  it('returns null when no completed sessions exist', () => {
    expect(firstSessionDate([])).toBeNull();
    expect(firstSessionDate([makeSession(TODAY_MIDNIGHT, 'cancelled')])).toBeNull();
  });

  it('returns the earliest completed session start', () => {
    const earliest = TODAY_MIDNIGHT - 200 * DAY;
    const sessions = [
      makeSession(TODAY_MIDNIGHT - 50 * DAY),
      makeSession(earliest),
      makeSession(TODAY_MIDNIGHT),
    ];
    expect(firstSessionDate(sessions)?.getTime()).toBe(earliest);
  });
});

describe('sessionsThisWeek', () => {
  // Anchor "now" to a stable Wednesday so the ISO-week math is deterministic.
  // 2026-05-20 = Wednesday. ISO week runs Mon 2026-05-18 → Sun 2026-05-24.
  const WED = new Date('2026-05-20T12:00:00').getTime();
  const MON = new Date('2026-05-18T00:30:00').getTime();
  const SUN = new Date('2026-05-24T23:30:00').getTime();
  const PRIOR_SUN = new Date('2026-05-17T23:00:00').getTime();
  const NEXT_MON = new Date('2026-05-25T00:30:00').getTime();

  it('returns 0 when no completed sessions exist', () => {
    expect(sessionsThisWeek([], WED)).toBe(0);
  });

  it('counts only completed sessions inside the ISO week (Mon-Sun)', () => {
    const sessions = [
      makeSession(MON),
      makeSession(WED),
      makeSession(SUN),
      makeSession(PRIOR_SUN),
      makeSession(NEXT_MON),
      makeSession(WED, 'cancelled'),
    ];
    expect(sessionsThisWeek(sessions, WED)).toBe(3);
  });

  it('handles a session right at the Monday boundary', () => {
    const justAfterMidnight = new Date('2026-05-18T00:00:01').getTime();
    expect(sessionsThisWeek([makeSession(justAfterMidnight)], WED)).toBe(1);
  });

  it('treats today (Sunday) sessions as still in this week', () => {
    const sun = new Date('2026-05-24T08:00:00').getTime();
    expect(sessionsThisWeek([makeSession(sun)], sun)).toBe(1);
  });
});
