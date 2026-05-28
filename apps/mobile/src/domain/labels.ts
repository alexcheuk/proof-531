/**
 * String labels for 5/3/1 sessions — lift names, week scheme glyphs, and
 * locale-stable date headers.
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
 *   1 → 5/5/5+   2 → 3/3/3+   3 → 5/3/1+   4 → TM TEST
 *
 * Week 4 was the classic Wendler deload; replaced (forever-forward) with
 * the 7th Week Protocol TM test. See `_workspace/01_design_spec.md`.
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
      return 'TM TEST';
  }
}

/**
 * Short caps-mono intent line for Today/Live — one phrase per 5/3/1 week.
 * Surfaces the *why* of the week's rep scheme so the user understands the
 * arc of the cycle without reading a programming primer.
 */
export function weekIntent(week: Week): string {
  switch (week) {
    case 1:
      return 'Easy 5s · build the groove';
    case 2:
      return 'Heavy 3s · trust the system';
    case 3:
      return 'Top single · grind the +';
    case 4:
      return 'Verify the TM · 3 to 5 clean reps';
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
 * Smart date label for History rows. Returns:
 *   `TODAY`               — same local day as `now`
 *   `YESTERDAY`           — previous local day
 *   `MON · JAN 6` style   — older sessions (`dateLabel` format)
 *
 * Surfacing TODAY/YESTERDAY makes recent sessions instantly readable
 * without forcing the user to do the date math themselves.
 *
 * Pure: pass `now` for testability.
 */
export function historyDateLabel(date: Date, now: number = Date.now()): string {
  const startOfDay = (ms: number): number => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const today = startOfDay(now);
  const target = startOfDay(date.getTime());
  const dayDelta = Math.round((today - target) / (24 * 60 * 60 * 1000));
  // Future timestamps (clock skew, restored backup with stale clock) collapse
  // to TODAY rather than falling through to dateLabel — keeps the row from
  // reading as a meaningfully-past date.
  if (dayDelta <= 0) return 'TODAY';
  if (dayDelta === 1) return 'YESTERDAY';
  return dateLabel(date);
}
