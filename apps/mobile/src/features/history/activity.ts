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
