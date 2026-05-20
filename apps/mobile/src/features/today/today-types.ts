/**
 * Shared types for the Today feature.
 *
 * Owned here so sibling today-* tasks (editorial, header, etc.) can reuse the
 * same shape without re-declaring it. Behavioral source:
 * `design-reference/screens-main.jsx` — `TodayCards` (line 210),
 * `SetCard` (line 296), `TodayHeader` (line 42), `TodayEditorial` (line 84).
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
  /** Which 5/3/1 cycle this session belongs to (1-indexed). */
  cycleNumber: number;
  liftId: string;
  liftLabel: string;
  /** Training max in `unit` — used by editorial variant to derive sets. */
  trainingMax: number;
  unit: 'lbs' | 'kg';
  weekOfCycle: 1 | 2 | 3 | 4;
  /**
   * Pre-computed sets (with done state) for variants that drive UI from a
   * concrete plan (e.g. `TodayCards`). May be empty when the caller wants the
   * editorial variant to derive sets from `trainingMax` + `weekOfCycle`.
   */
  sets: TodaySet[];
};

/**
 * Human-readable week scheme labels. Mirrors `WEEK_LABEL` in
 * `design-reference/screens-main.jsx`.
 */
export const WEEK_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: '5 / 5 / 5+',
  2: '3 / 3 / 3+',
  3: '5 / 3 / 1+',
  4: 'deload',
};
