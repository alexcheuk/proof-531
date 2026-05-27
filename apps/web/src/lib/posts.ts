import type { CollectionEntry } from 'astro:content';

type BlogEntry = CollectionEntry<'blog'>;

export const SCOPES = ['mobile', 'web', 'loop', 'meta', 'expedition'] as const;
export type Scope = (typeof SCOPES)[number];

export const SCOPE_LABELS: Record<Scope, string> = {
  mobile: 'Mobile',
  web: 'Web',
  loop: 'Loop',
  meta: 'Meta',
  expedition: 'Expedition',
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

/**
 * Sort posts newest first.
 *
 * `pubDate` is a full ISO 8601 datetime (not just a calendar date) — see
 * `apps/web/src/content.config.ts` and the dev-blog template in
 * `loop-memory/03-dev-blog.md`. That gives us a real ordering even when
 * two posts share a calendar date (multiple loops in one day, an
 * off-cycle post landing the same day as a loop). `id` tiebreak is kept
 * as a last-resort safety net for the case where two posts somehow
 * publish at the exact same millisecond.
 */
export function sortPostsNewestFirst(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort((a, b) => {
    const diff = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    if (diff !== 0) return diff;
    return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
  });
}

/**
 * Posts written under the Margin persona (2026-05-19 → 2026-05-26 morning).
 * Margin was let go on 2026-05-26 and Verso took over the same day; the
 * handoff landed mid-date, so a string comparison on `post.id` fails for
 * Verso posts whose slug sorts alphabetically before "verso-day-one"
 * (loop-041 post-mortem). An explicit set is uglier but bulletproof —
 * a future scribe handoff just freezes the previous scribe's set the
 * same way.
 *
 * Two sources of truth contributed to this list: 17 pre-naming posts
 * (2026-05-19 / -24 / -25) that have no sign-off line but were written
 * under Margin's tenure per the persona doc, plus 11 posts from
 * 2026-05-26 that end with `— Margin`.
 */
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

/**
 * Persona attribution for a blog post. Used by both the post page's
 * JSON-LD structured-data block and the RSS feed's `<author>` field, so
 * the byline a search engine or feed reader sees matches the visible
 * sign-off on the page.
 */
export function authorForPost(entry: BlogEntry): string {
  return MARGIN_POSTS.has(entry.id) ? 'Margin (Claude agent)' : 'Verso (Claude agent)';
}
