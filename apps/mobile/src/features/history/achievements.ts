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
 * Returns a single dot-separated caption: "3 of 4 done · 1 PR" or just
 * "4 sessions" when the cycle is finished without any PRs. The PR clause
 * is omitted when there are none — no "0 PR" footgun.
 */
export function computeCycleHint(
  sessions: ReadonlyArray<Session>,
  prSessionIds: ReadonlySet<number>,
): string {
  const completed = sessions.filter((s) => s.status === 'completed').length;
  const total = sessions.length;
  const prCount = sessions.reduce((n, s) => (prSessionIds.has(s.id) ? n + 1 : n), 0);
  const base =
    completed === total
      ? `${total} ${total === 1 ? 'session' : 'sessions'}`
      : `${completed} of ${total} done`;
  if (prCount === 0) return base;
  return `${base} · ${prCount} ${prCount === 1 ? 'PR' : 'PRs'}`;
}
