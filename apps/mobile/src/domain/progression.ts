/**
 * Progress-screen domain math.
 *
 * Pure domain layer — no React, no async, no Drizzle. Mirrors the way the
 * existing `epley` / `schemes` / `increments` / `units` modules expose
 * primitive-only functions consumed by the data layer's `useLiftProgression`
 * reshape hook.
 *
 * The Progress feature shows a single lift's cycle × day grid plus a
 * projection forward to the user's e1RM goal. Past rows are computed from
 * persisted set-log data (best Epley e1RM per cycle); future rows are
 * projected by linearly advancing the training max (TM) per cycle and
 * snapping the prescribed-percentage weights to the unit's plate step.
 *
 * AMRAP failure / TM reset handling is deliberately out of scope per the
 * spec — the projection assumes the lifter stays on-pace forever. See the
 * spec at `_workspace/01_design_spec.md` "Out of scope" §1.
 */

import { estimateOneRm } from './epley';
import { tmIncrement } from './increments';
import { setsForWeek } from './schemes';
import type { Lift, SetLogKind, Unit } from './types';
import { round } from './units';

/**
 * Best (max) Epley e1RM across the rows of a single completed cycle for
 * one lift. Used to compute the **past** e1RM displayed in the Progress
 * grid's right column.
 *
 * Iterates every row and runs `estimateOneRm` per row; returns the max,
 * or `0` when no row contributes (empty input, zero-weight rows, zero-rep
 * rows). The caller decides whether to include only AMRAP rows or all
 * working rows — this function does not filter by `kind`.
 *
 * Note: PAST e1RM iterates every working/AMRAP row in the cycle (D1/D2/D3)
 * and takes the max, while FUTURE projected e1RM is computed from week-3
 * (day 3) specifically — see {@link projectE1RMForFuture}. Both reduce to
 * "the heaviest e1RM event of the cycle", but past has actual reps to read
 * from every set while future projects only from the known-heaviest event.
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
 * the most recent `windowSize` completed cycles (default 3). Used as the
 * extra-rep estimate when projecting future AMRAP performance.
 *
 * Returns `0` on empty input. Caller decides how to handle the "no
 * history" fallback (the spec routes new users through margin=0, i.e.
 * "assume only the prescribed reps").
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
 * delta. Pure linear projection — no failure handling, no plateaus.
 *
 * Past (`targetCycle < currentCycle`) and present (`targetCycle ===
 * currentCycle`) collapse to `currentTm` — callers asking for past TM
 * should look it up from the append-only `training_maxes` table instead.
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
 * Projected top-set weight for a future `(cycle, day)` cell in the grid.
 *
 * Routes:
 *   - day 1 / 2 / 3 → week-3 top-set percentage (D1=0.75 D2=0.85 D3=0.95).
 *     Even though the lifter cycles through weeks 1–4 in reality, the
 *     Progress grid's "future cycle" rows are an abstracted summary — each
 *     row represents a *whole* cycle and the cells show the heaviest top
 *     set for the matching position in week 3 (the highest-e1RM week).
 *     This keeps the grid readable as a single "where will my lifts be?"
 *     ledger rather than collapsing into a 12-row week×day mess.
 *   - day 4 (deload) → week-4 top-set percentage 0.60.
 *
 * Always plate-snaps the result.
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
  if (day === 4) {
    // Week 4 (deload) top set is the third set @ 0.60.
    return round(tm * 0.6, unit);
  }
  const week3 = setsForWeek(3);
  // day=1..3 → index 0..2 in the week-3 prescription.
  const setIndex = day - 1;
  const set = week3[setIndex];
  if (!set) {
    // Shouldn't happen — day is constrained to 1|2|3|4 above.
    return 0;
  }
  return round(tm * set.pct, unit);
}

/**
 * Projected e1RM for a future cycle.
 *
 * Uses week-3 day-3 (top single @ 0.95 TM × 1+ rep AMRAP) as the
 * representative "heaviest event of the cycle" — that's the highest-e1RM
 * row in any cycle, so it's the right anchor for "where will my projected
 * 1RM be by then?". Reps assumed = `1 + round(rollingMargin)`, clamped to
 * a minimum of 1 (the prescribed rep).
 *
 * Caller computes `rollingMargin` from the last N completed cycles via
 * {@link rollingAmrapMargin}; passing `0` (e.g. on a fresh install) makes
 * the projection a strict on-pace forecast.
 */
export function projectE1RMForFuture(
  futureCycle: number,
  currentTm: number,
  currentCycle: number,
  rollingMargin: number,
  lift: Lift,
  unit: Unit,
): number {
  const weight = projectTopSetWeight(futureCycle, 3, currentTm, currentCycle, lift, unit);
  const reps = Math.max(1, Math.round(1 + rollingMargin));
  return estimateOneRm(weight, reps);
}

/**
 * Number of future cycles (≥ 1) before projected e1RM reaches or exceeds
 * `goal`. Returns `0` when `currentE1RM` already meets the goal, and
 * `null` when:
 *
 *   - `goal` is `null` (no goal set — nothing to count toward);
 *   - no cycle within `[currentCycle+1, currentCycle+maxLookahead]` crosses
 *     the goal (guards against a runaway loop on a goal beyond any
 *     realistic horizon).
 *
 * Default `maxLookahead = 60` cycles, ≈ 5 years of 5/3/1, well past any
 * useful planning horizon.
 */
export function cyclesUntilGoal(
  goal: number | null,
  currentE1RM: number,
  currentTm: number,
  currentCycle: number,
  rollingMargin: number,
  lift: Lift,
  unit: Unit,
  maxLookahead = 60,
): number | null {
  if (goal === null) return null;
  if (currentE1RM >= goal) return 0;
  for (let k = 1; k <= maxLookahead; k++) {
    const e1 = projectE1RMForFuture(
      currentCycle + k,
      currentTm,
      currentCycle,
      rollingMargin,
      lift,
      unit,
    );
    if (e1 >= goal) return k;
  }
  return null;
}

/**
 * Build the full list of future cycle rows from `currentCycle + 1` through
 * `currentCycle + count` (default 6). Each row has the 4 day cells'
 * projected weights and the projected e1RM. Used by the data hook to
 * shape the Progress grid's "future" tail.
 */
export function projectFutureCycles(
  count: number,
  currentTm: number,
  currentCycle: number,
  rollingMargin: number,
  lift: Lift,
  unit: Unit,
): Array<{
  cycle: number;
  days: Array<{ day: 1 | 2 | 3 | 4; weight: number }>;
  e1rm: number;
}> {
  const rows: Array<{
    cycle: number;
    days: Array<{ day: 1 | 2 | 3 | 4; weight: number }>;
    e1rm: number;
  }> = [];
  for (let i = 1; i <= count; i++) {
    const cycle = currentCycle + i;
    const days: Array<{ day: 1 | 2 | 3 | 4; weight: number }> = [
      { day: 1, weight: projectTopSetWeight(cycle, 1, currentTm, currentCycle, lift, unit) },
      { day: 2, weight: projectTopSetWeight(cycle, 2, currentTm, currentCycle, lift, unit) },
      { day: 3, weight: projectTopSetWeight(cycle, 3, currentTm, currentCycle, lift, unit) },
      { day: 4, weight: projectTopSetWeight(cycle, 4, currentTm, currentCycle, lift, unit) },
    ];
    const e1rm = projectE1RMForFuture(cycle, currentTm, currentCycle, rollingMargin, lift, unit);
    rows.push({ cycle, days, e1rm });
  }
  return rows;
}
