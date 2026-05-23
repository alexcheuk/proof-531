/**
 * Pure plate-decomposition math for 531 Strength.
 *
 * Mirrors the PWA's `src/features/session/domain/plates.ts` behavior verbatim:
 * greedy per-side descending decomposition, with epsilon-tolerant comparison
 * to avoid float drift on 2.5-step plates, and tiny leftover dust clamped to 0.
 *
 * This module is part of `src/domain/` — pure. No React, no async, no DB.
 */

import type { PlateSet } from './types';

export const PLATES_LBS = [45, 35, 25, 10, 5, 2.5] as const;
export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const BAR_LBS = 45;
export const BAR_KG = 20;

export type PlateCalc = {
  /** Plates on ONE side (the bar is symmetric), heaviest first. */
  readonly perSide: readonly number[];
  /** Total weight (both sides) that couldn't be matched. 0 when exact. */
  readonly leftover: number;
};

/** Greedy per-side decomposition. Selects bar + plates by PlateSet. */
export function decompose(target: number, plateSet: PlateSet): PlateCalc {
  const bar = plateSet === 'kg-standard' ? BAR_KG : BAR_LBS;
  const plates = plateSet === 'kg-standard' ? PLATES_KG : PLATES_LBS;
  return calcPlates(target, bar, plates);
}

/**
 * Lower-level greedy decomposition with explicit bar + plates.
 *
 * Greedy is correct for the standard plate sets above: each plate is at least
 * twice the next-smallest, so no smaller combination beats the greedy pick.
 */
export function calcPlates(target: number, bar: number, plates: readonly number[]): PlateCalc {
  const remainingTotal = target - bar;
  if (remainingTotal <= 0) {
    return { perSide: [], leftover: remainingTotal };
  }
  let perSideRemaining = remainingTotal / 2;
  const perSide: number[] = [];
  // Sort descending; the caller is allowed to pass any order.
  const sorted = [...plates].sort((a, b) => b - a);
  for (const plate of sorted) {
    // Use a small epsilon-tolerant compare to avoid float drift on 2.5-step plates.
    while (perSideRemaining + 1e-9 >= plate) {
      perSide.push(plate);
      perSideRemaining -= plate;
    }
  }
  // leftover = total weight (both sides) we couldn't place
  const leftover = perSideRemaining * 2;
  // Clamp tiny float dust to 0.
  return { perSide, leftover: Math.abs(leftover) < 1e-6 ? 0 : leftover };
}
