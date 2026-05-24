/**
 * String labels for 5/3/1 sessions — lift names, week scheme glyphs, and
 * locale-stable date headers. Ported from the PWA `features/session/domain/
 * labels.ts` (read-only reference at `~/Development/531-pwa/src/`).
 *
 * Pure: no React, no async, no DB. Safe to call from any layer.
 */

import type { Lift, Week } from './types';

/**
 * Canonical lift ordering — used by route param parsing, settings UI, and any
 * place that needs to iterate lifts in a stable order.
 */
export const LIFTS: readonly Lift[] = ['squat', 'bench', 'deadlift', 'press'];

/** Type guard for a string param being a valid Lift. */
export function isLift(v: string | undefined): v is Lift {
  return typeof v === 'string' && (LIFTS as readonly string[]).includes(v);
}

/**
 * Human-readable lift label. Used in headlines (`Squat day.`) and ARIA
 * descriptions. Title-case — `.caps` / `text-transform: uppercase` is applied
 * at render time, not in the source string.
 */
export function liftDisplayName(lift: Lift): string {
  switch (lift) {
    case 'squat':
      return 'Squat';
    case 'bench':
      return 'Bench';
    case 'deadlift':
      return 'Deadlift';
    case 'press':
      return 'Press';
  }
}

/**
 * Week scheme glyph for the title eyebrow.
 *   1 → 5/5/5+   2 → 3/3/3+   3 → 5/3/1+   4 → DELOAD
 */
export function weekLabel(week: Week): string {
  switch (week) {
    case 1:
      return '5/5/5+';
    case 2:
      return '3/3/3+';
    case 3:
      return '5/3/1+';
    case 4:
      return 'DELOAD';
  }
}

const WEEKDAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const MONTH_ABBR = [
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
 * `MON · JAN 6` style date label (uppercase weekday + uppercase month + day).
 *
 * Pure: takes a Date, returns a string. Avoids `Intl.DateTimeFormat` so the
 * output is locale-stable across environments.
 */
export function dateLabel(date: Date): string {
  const weekday = WEEKDAY_ABBR[date.getDay()];
  const month = MONTH_ABBR[date.getMonth()];
  const day = date.getDate();
  return `${weekday} · ${month} ${day}`;
}

/**
 * Human-readable relative time label, used by the Resume banner on Home.
 *
 * Returns one of:
 *   - `"just now"`     for deltas < 60 seconds (or any non-positive delta — a
 *                      `then` value in the future is clamped to "just now").
 *   - `"{n} min ago"`  for deltas < 60 minutes.
 *   - `"{n}h ago"`     for deltas < 24 hours.
 *   - `"Yesterday"`    for deltas in [24h, 48h).
 *   - `"{n} days ago"` for deltas >= 48 hours.
 *
 * Pure: no Intl, no Date arithmetic beyond integer ms math — the output is
 * locale-stable and trivially testable via fast-check.
 */
export function relativeTimeLabel(thenMs: number, nowMs: number): string {
  const delta = nowMs - thenMs;
  if (delta < 60_000) return 'just now';
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < hour) {
    const mins = Math.floor(delta / minute);
    return `${mins} min ago`;
  }
  if (delta < day) {
    const hours = Math.floor(delta / hour);
    return `${hours}h ago`;
  }
  if (delta < 2 * day) {
    return 'Yesterday';
  }
  const days = Math.floor(delta / day);
  return `${days} days ago`;
}
