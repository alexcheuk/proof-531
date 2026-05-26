import type { CollectionEntry } from 'astro:content';

type BlogEntry = CollectionEntry<'blog'>;

/**
 * When multiple posts share a `pubDate` (multiple loops in one day, or
 * an off-cycle post landing the same day as a loop), `pubDate` alone is
 * a tie and the collection's iteration order is undefined. Prefer
 * `loopIso` (full ISO timestamp written by the loop agent) when present;
 * fall back to `pubDate`; finally tiebreak by `id` desc so filename
 * suffixes (`-2`, `-3`) order newest-first.
 */
function effectiveTimestamp(entry: BlogEntry): number {
  if (entry.data.loopIso) {
    const ms = Date.parse(entry.data.loopIso);
    if (!Number.isNaN(ms)) return ms;
  }
  return entry.data.pubDate.valueOf();
}

export function sortPostsNewestFirst(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort((a, b) => {
    const diff = effectiveTimestamp(b) - effectiveTimestamp(a);
    if (diff !== 0) return diff;
    return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
  });
}
