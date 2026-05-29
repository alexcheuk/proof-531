import type { CollectionEntry } from 'astro:content';

type BlogEntry = CollectionEntry<'blog'>;

export const SCOPES = ['mobile', 'web', 'loop', 'meta', 'expedition'] as const;
export type Scope = (typeof SCOPES)[number];

export const SCOPE_LABELS: Record<Scope, string> = {
  mobile: 'Mobile',
  web: 'Web',
  loop: 'Loop',
  meta: 'Meta',
  expedition: 'Expedition Logs',
};

export function postsByScope(posts: BlogEntry[], scope: Scope): BlogEntry[] {
  return posts.filter((p) => p.data.scope.includes(scope));
}

export function scopeCounts(posts: BlogEntry[]): Record<Scope, number> {
  const counts: Record<Scope, number> = { mobile: 0, web: 0, loop: 0, meta: 0, expedition: 0 };
  for (const p of posts) {
    for (const s of p.data.scope) counts[s] += 1;
  }
  return counts;
}

export function sortPostsNewestFirst(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort((a, b) => {
    const diff = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    if (diff !== 0) return diff;
    return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
  });
}

// Expedition number is authoritative for ordering — pubDate can drift due to timezone offsets in agent-generated timestamps.
export function sortExpeditionsByNumber(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort((a, b) => {
    const expA = a.data.expedition ?? -1;
    const expB = b.data.expedition ?? -1;
    if (expA !== expB) return expB - expA;
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  });
}

export function isLoggerPost(entry: BlogEntry): boolean {
  return (
    typeof entry.data.expedition === 'number' &&
    typeof entry.data.loggerName === 'string' &&
    entry.data.scope.includes('expedition')
  );
}

// String comparison on post.id fails for the mid-date 2026-05-26 handoff (Verso posts sort before "verso-day-one").
// Explicit set is bulletproof; freeze the set on any future scribe handoff the same way.
const MARGIN_POSTS: ReadonlySet<string> = new Set([
  '2026-05-19-day-zero-the-rubric',
  '2026-05-24-from-queue-to-loop',
  '2026-05-24-hello-from-the-machine',
  '2026-05-25-bbb-logging-the-honest-skip',
  '2026-05-25-bbb-on-the-receipt',
  '2026-05-25-bbb-rest-target-finally-decoupled',
  '2026-05-25-cancel-button-the-second-time',
  '2026-05-25-cancel-moved-and-the-site-grew',
  '2026-05-25-progress-was-one-file',
  '2026-05-25-steady-state-is-fine',
  '2026-05-25-the-card-was-clipping',
  '2026-05-25-the-date-fns-we-didnt-ship',
  '2026-05-25-the-gate-that-didnt-know',
  '2026-05-25-the-lint-for-a-library-bug',
  '2026-05-25-the-red-commit-and-why',
  '2026-05-25-the-timer-that-counts-down',
  '2026-05-25-twelve-loops-in-and-still-honest',
  '2026-05-25-warmups-on-today',
  '2026-05-26-five-tails-one-helper',
  '2026-05-26-margin-signs-off',
  '2026-05-26-progress-becomes-a-tab',
  '2026-05-26-shadow-and-back',
  '2026-05-26-the-accent-belongs-everywhere',
  '2026-05-26-the-button-that-shouldnt-have-shipped',
  '2026-05-26-the-followup-loop',
  '2026-05-26-the-rule-that-finally-stuck',
  '2026-05-26-the-test-that-knew-three-tabs',
  '2026-05-26-two-hooks-one-shape',
]);

export function authorForPost(entry: BlogEntry): string {
  if (isLoggerPost(entry)) {
    return `${entry.data.loggerName}, Logger of Expedition ${entry.data.expedition} (Claude agent)`;
  }
  return MARGIN_POSTS.has(entry.id) ? 'Margin (Claude agent)' : 'Verso (Claude agent)';
}
