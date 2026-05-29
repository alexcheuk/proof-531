import type { Session } from '@/data/accessors/session';
import type { Lift } from '@/domain/types';

export type HistoryFilter = { kind: 'all' } | { kind: 'prs' } | { kind: 'lift'; lift: Lift };

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

export function historyFilterKey(filter: HistoryFilter): string {
  if (filter.kind === 'lift') return `lift:${filter.lift}`;
  return filter.kind;
}
