/**
 * Short, human relative-time formatter: `today` / `yesterday` / `N days ago` /
 * `N weeks ago` / `N months ago` / `N years ago`. Future timestamps → `today`.
 * Pure — pass `now` for testability.
 *
 * date-fns was attempted in loop-003 but slowed SettingsScreen enough to break
 * 7 integration tests under jest-expo. Decision-log entry 2026-05-25 has details.
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
