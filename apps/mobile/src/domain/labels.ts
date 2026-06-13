import type { Lift, Week } from './types';

export const LIFTS: readonly Lift[] = ['squat', 'bench', 'deadlift', 'press'];

export function isLift(v: string | undefined): v is Lift {
  return typeof v === 'string' && (LIFTS as readonly string[]).includes(v);
}

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

export function daySchemeLabel(day: Week): string {
  switch (day) {
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

export function dayIntent(day: Week): string {
  switch (day) {
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

// Avoids Intl.DateTimeFormat  -  output must be locale-stable across environments.
export function dateLabel(date: Date): string {
  const weekday = WEEKDAY_ABBR[date.getDay()];
  const month = MONTH_ABBR[date.getMonth()];
  const day = date.getDate();
  return `${weekday} · ${month} ${day}`;
}

/** Title-case proper noun ("Back squat") for settings rows and table headers. Lower-case variant: liftLongName. */
export function liftProperName(lift: Lift): string {
  switch (lift) {
    case 'squat':
      return 'Back squat';
    case 'bench':
      return 'Bench press';
    case 'deadlift':
      return 'Deadlift';
    case 'press':
      return 'Overhead press';
  }
}

/** Lower-case colloquial name ("back squat") for prose. Title-case variant: liftProperName. */
export function liftLongName(lift: Lift): string {
  switch (lift) {
    case 'squat':
      return 'back squat';
    case 'bench':
      return 'bench press';
    case 'deadlift':
      return 'deadlift';
    case 'press':
      return 'overhead press';
  }
}

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
  // to TODAY rather than falling through to dateLabel  -  keeps the row from
  // reading as a meaningfully-past date.
  if (dayDelta <= 0) return 'TODAY';
  if (dayDelta === 1) return 'YESTERDAY';
  return dateLabel(date);
}
