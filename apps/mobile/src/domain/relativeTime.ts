// date-fns was tried in loop-003 but caused SettingsScreen to fail 7 jest-expo tests (module load path issue).
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
