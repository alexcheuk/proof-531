import type { Session } from '@/data/accessors/session';

export type HistoryStats = {
  filed: number;
  prs: number;
};

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
    // Suppress when the span collapses to 1 day  -  every cycle is at least
    // one day, so the clause only adds signal when it's larger.
    if (span !== null && span >= 2) {
      parts.push(`${span} days`);
    }
  }
  return parts.join(' · ');
}

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
