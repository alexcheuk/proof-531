import { estimateOneRm } from './epley';
import { tmIncrement } from './increments';
import { prescription } from './schemes';
import type { Lift, SetLogKind, Unit } from './types';
import { round, trainingMaxFrom } from './units';

export type GoalKind = 'tm' | '1rm';

/** Max Epley e1RM across all sets in a cycle. NOT a projection target; 0 for empty. */
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

// Day 4 was 0.60 × TM under the legacy Wendler deload; it's 100% TM since the 7th-Week Protocol migration.
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
  // Progress-grid day d (1–3) IS week d, and its headline number is that
  // week's top working set, the AMRAP set at index 2: 85% (wk1) / 90% (wk2)
  // / 95% (wk3) of TM. This must match the live Today/Home top set
  // (`prescription(week)[2]`); the previous code indexed `prescription(3)`
  // by `day - 1`, which made day 1 read 75% and day 2 read 85% (both wrong).
  const topSet = prescription(day)[2];
  if (!topSet) return 0;
  return round(tm * topSet.pct, unit);
}

export function goalTargetTm(kind: GoalKind, value: number, unit: Unit): number {
  if (kind === 'tm') return value;
  return trainingMaxFrom(value, unit);
}

// Returns null when targetTm is null (no goal) or exceeds the maxLookahead horizon (default 120 cycles ≈ 10 years).
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

export function cycleGoalEstimate(
  cyclesUntilGoal: number | null,
  daysPerWeek: number | null,
): { days: number; months: number | null } {
  if (cyclesUntilGoal === null || cyclesUntilGoal === 0) {
    return { days: 0, months: null };
  }
  const days = cyclesUntilGoal * 4;
  const dpw = daysPerWeek && daysPerWeek > 0 ? daysPerWeek : null;
  const months = dpw !== null ? Math.max(1, Math.round(days / dpw / 4.345)) : null;
  return { days, months };
}

export type TmAdjustmentKind = 'increment' | 'hold' | 'reset';

export type TmAdjustmentSuggestion =
  | { kind: 'increment'; delta: number }
  | { kind: 'hold' }
  | { kind: 'reset'; resetPct: number };

// Wendler 7th-Week Protocol bands: ≥5 reps → increment, 3–4 → hold, 0–2 → reset (−10%).
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
