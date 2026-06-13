import type { SetLog } from './types';

export type DateLabelParts = {
  weekday: string;
  dateLine: string;
  year: string;
};

const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const MONTH = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

// Avoids Intl.DateTimeFormat  -  output must be locale-stable across environments.
export function formatDateLabel(date: Date): DateLabelParts {
  return {
    weekday: WEEKDAY[date.getDay()] as (typeof WEEKDAY)[number],
    dateLine: `${MONTH[date.getMonth()] as (typeof MONTH)[number]} ${date.getDate()}`,
    year: String(date.getFullYear()),
  };
}

export function formatElapsed(startedAt: number, endedAt: number): string {
  const totalSec = Math.max(0, Math.floor((endedAt - startedAt) / 1000));
  const totalMin = Math.floor(totalSec / 60);
  if (totalMin < 60) {
    const sec = totalSec % 60;
    return `${totalMin}:${String(sec).padStart(2, '0')}`;
  }
  const hr = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return `${hr}:${String(min).padStart(2, '0')}`;
}

export function formatElapsedCompact(startedAt: number, endedAt: number): string {
  const totalSec = Math.max(0, Math.floor((endedAt - startedAt) / 1000));
  const totalMin = Math.floor(totalSec / 60);
  if (totalMin === 0) return totalSec > 0 ? '1m' : '0m';
  if (totalMin < 60) return `${totalMin}m`;
  const hr = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return min === 0 ? `${hr}h` : `${hr}h ${min}m`;
}

export function volumeOfWorkingSets(logs: readonly SetLog[]): number {
  let total = 0;
  for (const log of logs) {
    if (log.kind !== 'working' && log.kind !== 'amrap') continue;
    if (log.index !== 0 && log.index !== 1 && log.index !== 2) continue;
    total += log.prescribedWeight * log.actualReps;
  }
  return total;
}
