/**
 * Progress-screen domain math.
 *
 * Pure domain layer — no React, no async, no Drizzle. Used by the data
 * layer's `useLiftProgression` reshape hook.
 *
 * The Progress feature shows a single lift's cycle × day grid plus a
 * projection forward to the user's TM (or 1RM) goal. Past rows come from
 * persisted set-log data; future rows are projected by linearly advancing
 * the training max (TM) per cycle and snapping the prescribed-percentage
 * weights to the unit's plate step.
 *
 * AMRAP failure / TM reset is deliberately out of scope — the projection
 * assumes on-pace progress forever.
 */

import { estimateOneRm } from './epley';
import { tmIncrement } from './increments';
import { prescription } from './schemes';
import type { Lift, SetLogKind, Unit } from './types';
import { round } from './units';

export type GoalKind = 'tm' | '1rm';

/**
 * Best (max) Epley e1RM across the rows of a single completed cycle. Used
 * for the "Best e1RM" stat in the Progress stats triplet — NOT a projection
 * target. Returns 0 for empty input.
 */
export function bestE1RMForCycle(
  rowsInCycle: Array<{ prescribedWeight: number; actualReps: number; kind: SetLogKind }>,
): number {
  let best = 0;
  for (const r of rowsInCycle) {
    const e1 = estimateOneRm(r.prescribedWeight, r.actualReps);
    if (e1 > best) best = e1;
  }
  return best;
}

/**
 * Rolling AMRAP rep-margin: average of `(actualReps − prescribedReps)` over
 * the most recent `windowSize` completed cycles (default 3). Returns 0 on
 * empty input. Currently informational only — the projection is TM-based
 * and does not factor AMRAP performance.
 */
export function rollingAmrapMargin(
  completedCycles: Array<{ amrapPrescribedReps: number; amrapActualReps: number }>,
  windowSize = 3,
): number {
  if (completedCycles.length === 0) return 0;
  const slice = completedCycles.slice(-windowSize);
  let total = 0;
  for (const c of slice) {
    total += c.amrapActualReps - c.amrapPrescribedReps;
  }
  return total / slice.length;
}

/**
 * Project the TM for a future cycle by applying `tmIncrement` once per cycle
 * delta. Pure linear projection. Past/present collapse to `currentTm`.
 */
export function projectTmForCycle(
  currentTm: number,
  currentCycle: number,
  targetCycle: number,
  lift: Lift,
  unit: Unit,
): number {
  if (targetCycle <= currentCycle) return currentTm;
  const delta = targetCycle - currentCycle;
  return currentTm + delta * tmIncrement(unit, lift);
}

/**
 * Projected top-set weight for a `(cycle, day)` cell.
 *
 * Day 1/2/3 → week-3 prescription (5/3/1+ scheme; D1=0.75, D2=0.85, D3=0.95
 * of TM). Day 4 (TM test) → 100% × TM (the TM test itself). Plate-snapped to
 * the unit's step.
 *
 * Day-4 was 0.60 × TM under the legacy Wendler deload; the value changed in
 * the TM-Test-Week migration to the 7th-Week Protocol. The Progress
 * grid's future column-4 cells now project the TM the test will use, not a
 * deload top-set weight.
 */
export function projectTopSetWeight(
  futureCycle: number,
  day: 1 | 2 | 3 | 4,
  currentTm: number,
  currentCycle: number,
  lift: Lift,
  unit: Unit,
): number {
  const tm = projectTmForCycle(currentTm, currentCycle, futureCycle, lift, unit);
  if (day === 4) return round(tm, unit);
  const week3 = prescription(3);
  const set = week3[day - 1];
  if (!set) return 0;
  return round(tm * set.pct, unit);
}

/**
 * Convert a 1RM goal to its equivalent training max. Per Wendler: TM ≈ 90%
 * of 1RM. Result is plate-snapped to the unit's step so the goal lands on a
 * loadable TM.
 */
export function tmFromOneRm(oneRm: number, unit: Unit): number {
  return round(oneRm * 0.9, unit);
}

/**
 * Resolve a goal (kind + value, in storage units) into its target TM (also
 * storage units). For `kind: 'tm'` this is the identity; for `kind: '1rm'`
 * it routes through {@link tmFromOneRm}.
 */
export function goalTargetTm(kind: GoalKind, value: number, unit: Unit): number {
  if (kind === 'tm') return value;
  return tmFromOneRm(value, unit);
}

/**
 * Number of cycles (≥ 0) before projected TM reaches or exceeds
 * `targetTm`. Returns `0` when the current TM already meets/exceeds the
 * goal, and `null` when:
 *
 *   - `targetTm` is `null` (no goal set);
 *   - no cycle within `[currentCycle+1, currentCycle+maxLookahead]` crosses
 *     it (runaway guard).
 *
 * Default `maxLookahead = 120` — ~10 years of 5/3/1, well past any useful
 * planning horizon.
 */
export function cyclesUntilTmGoal(
  targetTm: number | null,
  currentTm: number,
  currentCycle: number,
  lift: Lift,
  unit: Unit,
  maxLookahead = 120,
): number | null {
  if (targetTm === null) return null;
  if (currentTm >= targetTm) return 0;
  for (let k = 1; k <= maxLookahead; k++) {
    const tm = projectTmForCycle(currentTm, currentCycle, currentCycle + k, lift, unit);
    if (tm >= targetTm) return k;
  }
  return null;
}

/**
 * Discriminated union returned by {@link tmAdjustmentSuggestion}.
 *
 *   - `increment` — TM was conservative; bump it next cycle. `delta` carries
 *     the magnitude in the lift's own unit (same convention as
 *     {@link tmIncrement}: +5 upper / +10 lower in lbs; +2.5 / +5 in kg).
 *   - `hold`      — TM is honest; no change this cycle.
 *   - `reset`     — TM is too high; recommend resetting to `resetPct × TM`
 *     (currently always 0.9, i.e. −10%).
 */
export type TmAdjustmentKind = 'increment' | 'hold' | 'reset';

export type TmAdjustmentSuggestion =
  | { kind: 'increment'; delta: number }
  | { kind: 'hold' }
  | { kind: 'reset'; resetPct: number };

/**
 * Map reps achieved on the Week-4 TM test set to a suggested next-cycle TM
 * adjustment. Bands are from Wendler's Forever 5/3/1 7th-Week Protocol:
 *
 *   reps ≥ 5  → increment  (+tmIncrement(unit, lift))
 *   reps 3–4  → hold       (TM is honest; no change)
 *   reps 0–2  → reset      (−10%, resetPct = 0.9)
 *
 * Negative reps fall through to the reset band defensively (a missed test).
 *
 * Pure: no React, no async, no DB. Total function over all integer rep
 * counts. The `delta` field on `increment` is expressed in the lift's own
 * unit — same convention as {@link tmIncrement}.
 */
export function tmAdjustmentSuggestion(
  repsAchieved: number,
  lift: Lift,
  unit: Unit,
): TmAdjustmentSuggestion {
  if (repsAchieved >= 5) {
    return { kind: 'increment', delta: tmIncrement(unit, lift) };
  }
  if (repsAchieved >= 3) {
    return { kind: 'hold' };
  }
  return { kind: 'reset', resetPct: 0.9 };
}

/**
 * Build cycle rows from `startCycle` through `endCycle` (inclusive). Each
 * row carries the 4 day-cell projected weights and the cycle's TM.
 *
 * Used by `useLiftProgression` to shape the full grid (past + current +
 * future): past cycles get this scaffold and then have their actual data
 * overlaid; current cycle's `tm` is just `currentTm`; future cycles use
 * `projectTmForCycle`.
 */
export function projectCycleRows(
  startCycle: number,
  endCycle: number,
  currentTm: number,
  currentCycle: number,
  lift: Lift,
  unit: Unit,
): Array<{
  cycle: number;
  tm: number;
  days: Array<{ day: 1 | 2 | 3 | 4; weight: number }>;
}> {
  const rows: Array<{
    cycle: number;
    tm: number;
    days: Array<{ day: 1 | 2 | 3 | 4; weight: number }>;
  }> = [];
  for (let cycle = startCycle; cycle <= endCycle; cycle++) {
    const tm = projectTmForCycle(currentTm, currentCycle, cycle, lift, unit);
    const days: Array<{ day: 1 | 2 | 3 | 4; weight: number }> = [
      { day: 1, weight: projectTopSetWeight(cycle, 1, currentTm, currentCycle, lift, unit) },
      { day: 2, weight: projectTopSetWeight(cycle, 2, currentTm, currentCycle, lift, unit) },
      { day: 3, weight: projectTopSetWeight(cycle, 3, currentTm, currentCycle, lift, unit) },
      { day: 4, weight: projectTopSetWeight(cycle, 4, currentTm, currentCycle, lift, unit) },
    ];
    rows.push({ cycle, tm, days });
  }
  return rows;
}
