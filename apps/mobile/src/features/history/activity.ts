import type { Session } from '@/data/accessors/session';

const DAY_MS = 24 * 60 * 60 * 1000;

// Uses Date.setDate (not ms - n*DAY_MS)  -  DST days are 23 or 25 hours wide; naive ms-subtraction breaks streak math.
function previousLocalMidnight(ms: number, daysAgo = 1): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.getTime();
}

export function sessionsThisWeek(
  sessions: ReadonlyArray<Session>,
  now: number = Date.now(),
): number {
  // ISO week starts Monday. JS getDay(): 0=Sun..6=Sat. Map to a 0..6 offset
  // where Monday = 0 so we can roll back to the week's first midnight.
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  const isoDow = (cursor.getDay() + 6) % 7; // Mon=0..Sun=6
  const weekStartMs = cursor.getTime() - isoDow * DAY_MS;
  // Inclusive upper bound = end of Sunday for the same ISO week.
  const weekEndMs = weekStartMs + 7 * DAY_MS - 1;
  let count = 0;
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    if (s.startedAt >= weekStartMs && s.startedAt <= weekEndMs) count += 1;
  }
  return count;
}

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
    // Only count completed sessions  -  in-progress/cancelled rows aren't a
    // training rep.
    if (s.status !== 'completed') continue;
    const ts = new Date(s.startedAt);
    ts.setHours(0, 0, 0, 0);
    filledDays.add(ts.getTime());
  }

  // Build the window oldest → newest so the consumer renders L→R.
  const out: boolean[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayMs = i === 0 ? todayMs : previousLocalMidnight(todayMs, i);
    out.push(filledDays.has(dayMs));
  }
  return out;
}

// Grace: if today is empty but yesterday is filled, start from yesterday  -  streak doesn't reset until two empty days.
export function currentStreak(activity: ReadonlyArray<boolean>): number {
  if (activity.length === 0) return 0;
  const lastIdx = activity.length - 1;
  let i = activity[lastIdx] ? lastIdx : lastIdx - 1;
  let streak = 0;
  for (; i >= 0; i--) {
    if (!activity[i]) break;
    streak += 1;
  }
  return streak;
}

// Full-history streak (not capped at 14 like currentStreak) for comparison with longestStreakDays.
export function currentStreakDays(
  sessions: ReadonlyArray<Session>,
  now: number = Date.now(),
): number {
  const dayBuckets = new Set<number>();
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    const ts = new Date(s.startedAt);
    ts.setHours(0, 0, 0, 0);
    dayBuckets.add(ts.getTime());
  }
  if (dayBuckets.size === 0) return 0;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  // If today is already a training day, count it. Otherwise start the walk
  // from yesterday  -  today's emptiness is grace, not failure.
  let cursor = dayBuckets.has(todayMs) ? todayMs : previousLocalMidnight(todayMs);
  let streak = 0;
  while (dayBuckets.has(cursor)) {
    streak += 1;
    cursor = previousLocalMidnight(cursor);
  }
  return streak;
}

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

export function firstSessionDate(sessions: ReadonlyArray<Session>): Date | null {
  let earliest: number | null = null;
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    if (earliest === null || s.startedAt < earliest) earliest = s.startedAt;
  }
  if (earliest === null) return null;
  return new Date(earliest);
}

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
    if (previousLocalMidnight(day) === prev) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  return longest;
}
