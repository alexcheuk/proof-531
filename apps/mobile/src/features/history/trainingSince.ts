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

export function formatTrainingSince(date: Date): string {
  const monthIdx = date.getMonth();
  const safeIdx = monthIdx >= 0 && monthIdx < 12 ? monthIdx : 0;
  return `${MONTH_NAMES[safeIdx]} ${date.getFullYear()}`;
}
