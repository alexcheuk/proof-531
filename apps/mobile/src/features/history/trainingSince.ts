/**
 * Pure helpers for the "Training since {Mon YYYY}" caption on the
 * History achievement strip.
 */
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * `Mar 2026`-style label from a Date. Pure — does not read the local
 * clock. (Caller has already resolved the user's first-session date.)
 */
export function formatTrainingSince(date: Date): string {
  const monthIdx = date.getMonth();
  const safeIdx = monthIdx >= 0 && monthIdx < 12 ? monthIdx : 0;
  return `${MONTH_NAMES[safeIdx]} ${date.getFullYear()}`;
}
