/**
 * Pure helpers for the History activity sparkline.
 *
 * No React, no DB — domain-free math so the rhythm is property-testable.
 */
import type { Session } from '@/data/accessors/session';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Compute a recent-activity bitmap from session timestamps.
 *
 * Returns one boolean per day in the lookback window (length `days`),
 * **oldest first** so the array can be rendered left-to-right with `today`
 * on the right. A day is `true` when at least one session in `sessions`
 * was started during that 24-hour wall-clock window.
 *
 * Uses local-midnight bucketing so a session at 23:55 lands on the same
 * day as one at 06:00.
 */
export function recentActivity(
  sessions: ReadonlyArray<Session>,
  days = 14,
  now: number = Date.now(),
): boolean[] {
  // Start-of-today in local time.
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  // Bucket session timestamps by local-day epoch.
  const filledDays = new Set<number>();
  for (const s of sessions) {
    // Only count completed sessions — in-progress/cancelled rows aren't a
    // training rep.
    if (s.status !== 'completed') continue;
    const ts = new Date(s.startedAt);
    ts.setHours(0, 0, 0, 0);
    filledDays.add(ts.getTime());
  }

  // Build the window oldest → newest so the consumer renders L→R.
  const out: boolean[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayMs = todayMs - i * DAY_MS;
    out.push(filledDays.has(dayMs));
  }
  return out;
}

/** Count consecutive trailing `true` days from the end of an activity bitmap. */
export function currentStreak(activity: ReadonlyArray<boolean>): number {
  let streak = 0;
  for (let i = activity.length - 1; i >= 0; i--) {
    if (!activity[i]) break;
    streak += 1;
  }
  return streak;
}

/**
 * Total elapsed days from the user's first completed session through `now`.
 *
 * Inclusive of the first-session day (a session today reads as "Day 1").
 * Returns `0` when the user has no completed sessions yet, so callers can
 * gate rendering on a minimum count.
 */
export function daysSinceFirstSession(
  sessions: ReadonlyArray<Session>,
  now: number = Date.now(),
): number {
  let earliest: number | null = null;
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    if (earliest === null || s.startedAt < earliest) earliest = s.startedAt;
  }
  if (earliest === null) return 0;
  const start = new Date(earliest);
  start.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - start.getTime()) / DAY_MS);
  return Math.max(1, diff + 1);
}

/**
 * Local-date of the user's first completed session, or `null` when none.
 * Used to render the "Training since <month> <year>" caption in the
 * achievement strip.
 */
export function firstSessionDate(sessions: ReadonlyArray<Session>): Date | null {
  let earliest: number | null = null;
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    if (earliest === null || s.startedAt < earliest) earliest = s.startedAt;
  }
  if (earliest === null) return null;
  return new Date(earliest);
}

/**
 * Longest run of consecutive training days across the user's full history.
 *
 * Scans every `completed` session's local-day bucket and walks the sorted
 * day list, counting the longest contiguous run. Returns `0` when the user
 * has no completed sessions yet.
 *
 * Distinct from `currentStreak`, which only inspects a trailing window.
 * This is the all-time personal best — surfaced in the achievement strip
 * so the user has a number to chase.
 */
export function longestStreakDays(sessions: ReadonlyArray<Session>): number {
  const dayBuckets = new Set<number>();
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    const ts = new Date(s.startedAt);
    ts.setHours(0, 0, 0, 0);
    dayBuckets.add(ts.getTime());
  }
  if (dayBuckets.size === 0) return 0;

  const sortedDays = [...dayBuckets].sort((a, b) => a - b);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    // biome-ignore lint/style/noNonNullAssertion: i is bounded by sortedDays.length
    const prev = sortedDays[i - 1]!;
    // biome-ignore lint/style/noNonNullAssertion: i is bounded by sortedDays.length
    const day = sortedDays[i]!;
    if (day - prev === DAY_MS) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  return longest;
}
