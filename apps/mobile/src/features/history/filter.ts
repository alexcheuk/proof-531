/**
 * Pure filter helpers for the History tab chip row.
 */
import type { Session } from '@/data/accessors/session';
import type { Lift } from '@/domain/types';

export type HistoryFilter = { kind: 'all' } | { kind: 'prs' } | { kind: 'lift'; lift: Lift };

/**
 * Apply a HistoryFilter to a session list. Pass `prSessionIds` so the
 * `prs` filter can keep only sessions whose set logs include a PR.
 */
export function applyHistoryFilter(
  sessions: ReadonlyArray<Session>,
  filter: HistoryFilter,
  prSessionIds: ReadonlySet<number>,
): Session[] {
  switch (filter.kind) {
    case 'all':
      return [...sessions];
    case 'prs':
      return sessions.filter((s) => prSessionIds.has(s.id));
    case 'lift':
      return sessions.filter((s) => s.lift === filter.lift);
  }
}

/** Stable filter key for React `key=`. */
export function historyFilterKey(filter: HistoryFilter): string {
  if (filter.kind === 'lift') return `lift:${filter.lift}`;
  return filter.kind;
}
