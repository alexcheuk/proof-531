/**
 * Short, human relative-time formatter.
 *
 *   `today`           — fired today
 *   `yesterday`       — 1 day ago
 *   `N days ago`      — 2..6 days
 *   `N weeks ago`     — 7..29 days (so 4w wins over "1mo" at day 28)
 *   `N months ago`    — 30..364 days (30-day buckets)
 *   `N years ago`     — ≥ 365 days
 *
 * Future timestamps return `today` (clock skew should not produce
 * "-3 days ago"). Pure — pass `now` for testability.
 */
export function formatRelativeTime(ts: number, now: number = Date.now()): string {
  const diffMs = now - ts;
  if (diffMs < 0) return 'today';
  const sec = Math.floor(diffMs / 1000);
  const day = Math.floor(sec / 86400);
  if (day === 0) return 'today';
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day} days ago`;
  if (day < 30) {
    const w = Math.floor(day / 7);
    return `${w} ${w === 1 ? 'week' : 'weeks'} ago`;
  }
  if (day < 365) {
    const m = Math.floor(day / 30);
    return `${m} ${m === 1 ? 'month' : 'months'} ago`;
  }
  const y = Math.floor(day / 365);
  return `${y} ${y === 1 ? 'year' : 'years'} ago`;
}
