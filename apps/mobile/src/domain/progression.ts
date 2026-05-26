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
import { setsForWeek } from './schemes';
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
 * of TM). Day 4 (deload) → 0.60 × TM. Plate-snapped to the unit's step.
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
  if (day === 4) return round(tm * 0.6, unit);
  const week3 = setsForWeek(3);
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
