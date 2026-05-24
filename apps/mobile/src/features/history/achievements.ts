/**
 * Pure aggregation helpers for the History tab achievement strip.
 *
 * Kept domain-free (no React, no DB) so the math is property-testable and
 * decoupled from the screen.
 */
import type { Session } from '@/data/accessors/session';

export type HistoryStats = {
  /** Total sessions completed across all time. */
  filed: number;
  /** Number of distinct sessions that produced at least one PR. */
  prs: number;
};

/**
 * Lifetime totals for the masthead strip.
 *
 * `filed` counts only `status === 'completed'` rows — in-progress and
 * cancelled sessions don't earn a stamp. `prs` is sized off the supplied
 * PR-id set (which comes from `useSessionPrIds`).
 */
export function computeHistoryStats(
  sessions: ReadonlyArray<Session>,
  prSessionIds: ReadonlySet<number>,
): HistoryStats {
  let filed = 0;
  let prs = 0;
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    filed += 1;
    if (prSessionIds.has(s.id)) prs += 1;
  }
  return { filed, prs };
}

/**
 * Per-cycle hint used above each cycle's session list.
 *
 * Returns a single dot-separated caption. Three clauses, in order:
 *   1. `3 of 4 done` (in-progress)  OR  `4 sessions` (finished)
 *   2. `· 1 PR` / `· 2 PRs`         (only when prCount > 0)
 *   3. `· 12 days`                  (only on a finished cycle with ≥2
 *      sessions — the span between first and last `startedAt`, rounded
 *      to whole days)
 *
 * The PR clause is omitted when there are none — no "0 PR" footgun.
 * The span clause is omitted on in-progress cycles (the user is still
 * in it, so the count is misleading) and on single-session cycles.
 */
export function computeCycleHint(
  sessions: ReadonlyArray<Session>,
  prSessionIds: ReadonlySet<number>,
): string {
  const completed = sessions.filter((s) => s.status === 'completed').length;
  const total = sessions.length;
  const finished = completed === total;
  const prCount = sessions.reduce((n, s) => (prSessionIds.has(s.id) ? n + 1 : n), 0);

  const parts: string[] = [];
  parts.push(
    finished ? `${total} ${total === 1 ? 'session' : 'sessions'}` : `${completed} of ${total} done`,
  );
  if (prCount > 0) {
    parts.push(`${prCount} ${prCount === 1 ? 'PR' : 'PRs'}`);
  }
  if (finished && total >= 2) {
    const span = cycleSpanDays(sessions);
    // Suppress when the span collapses to 1 day — every cycle is at least
    // one day, so the clause only adds signal when it's larger.
    if (span !== null && span >= 2) {
      parts.push(`${span} days`);
    }
  }
  return parts.join(' · ');
}

/**
 * Inclusive day count between the earliest and latest `startedAt` in the
 * supplied session list. Returns `null` when the input has fewer than
 * two sessions. Uses local-midnight bucketing so "today and yesterday"
 * reads as `2 days`, not `1`.
 */
function cycleSpanDays(sessions: ReadonlyArray<Session>): number | null {
  if (sessions.length < 2) return null;
  let earliest = sessions[0]?.startedAt ?? null;
  let latest = sessions[0]?.startedAt ?? null;
  for (const s of sessions) {
    if (earliest === null || s.startedAt < earliest) earliest = s.startedAt;
    if (latest === null || s.startedAt > latest) latest = s.startedAt;
  }
  if (earliest === null || latest === null) return null;
  const a = startOfLocalDay(earliest);
  const b = startOfLocalDay(latest);
  const days = Math.round((b - a) / (24 * 60 * 60 * 1000));
  return days + 1;
}

function startOfLocalDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
