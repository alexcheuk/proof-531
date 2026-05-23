/**
 * Pure helpers for the session-complete screen (Rev 4).
 *
 *   - `formatDateLabel`     — short weekday + month-day strings for the v3 stamp.
 *   - `formatElapsed`       — `mm:ss` (<60min) or `H:MM` (≥60min) elapsed time.
 *   - `volumeOfWorkingSets` — sum(weight × actualReps) across the working logs.
 *
 * No React, no Drizzle. Inputs are plain values; outputs are plain strings/numbers.
 */

import type { SetLog } from './types';

export type DateLabelParts = {
  /** Uppercased short weekday — `WED`. */
  weekday: string;
  /** Uppercased short month + day — `MAY 22`. */
  dateLine: string;
  /** Four-digit year — `2026`. */
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

/**
 * Decompose a Date into the three text fragments the `DateStamp` SVG draws:
 * weekday (`WED`), month + day (`MAY 22`), and a 4-digit year string.
 *
 * Avoids `Intl.DateTimeFormat` so output is locale-stable across environments.
 * The `as` assertions are safe: getDay() returns 0..6 and getMonth() returns
 * 0..11 — both narrower than the array indices.
 */
export function formatDateLabel(date: Date): DateLabelParts {
  return {
    weekday: WEEKDAY[date.getDay()] as (typeof WEEKDAY)[number],
    dateLine: `${MONTH[date.getMonth()] as (typeof MONTH)[number]} ${date.getDate()}`,
    year: String(date.getFullYear()),
  };
}

/**
 * `mm:ss` when the elapsed time is < 60 minutes; `H:MM` otherwise. Both
 * formats use a single colon; the trailing component is zero-padded to two
 * digits. The hours/minutes branch deliberately drops seconds.
 *
 * Negative or zero spans collapse to `0:00`. Sub-second slop is floored.
 */
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

/**
 * Sum of `prescribedWeight × actualReps` across the three working SetLog rows.
 * Accepts a heterogeneous list (warmups, bbb, etc.) and filters down to
 * `kind === 'working' | 'amrap'` itself so the caller doesn't have to.
 *
 * Defensive: ignores indices outside {0,1,2} so a future schema relaxation
 * can't silently double-count. Returns 0 when no working sets exist.
 */
export function volumeOfWorkingSets(logs: readonly SetLog[]): number {
  let total = 0;
  for (const log of logs) {
    if (log.kind !== 'working' && log.kind !== 'amrap') continue;
    if (log.index !== 0 && log.index !== 1 && log.index !== 2) continue;
    total += log.prescribedWeight * log.actualReps;
  }
  return total;
}
