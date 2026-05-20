/**
 * Shared types for the Today feature.
 *
 * Owned here so sibling today-* tasks (editorial, header, etc.) can reuse the
 * same shape without re-declaring it. Behavioral source:
 * `design-reference/screens-main.jsx` — `TodayCards` (line 210) and
 * `SetCard` (line 296).
 */

export type PlateVariant = 'barbell' | 'chips' | 'numerical';

export type TodaySetType = 'warmup' | 'main' | 'bbb';

export type TodaySet = {
  index: number;
  type: TodaySetType;
  /** Resolved weight in `unit`. */
  weight: number;
  /** Prescribed reps. */
  reps: number;
  /** AMRAP (As Many Reps As Possible) — top set. */
  amrap: boolean;
  /** Percent of training max (0..1). */
  pct: number;
  done?: boolean;
};

export type TodaySession = {
  liftId: string;
  liftLabel: string;
  unit: 'lbs' | 'kg';
  weekOfCycle: 1 | 2 | 3 | 4;
  sets: TodaySet[];
};
