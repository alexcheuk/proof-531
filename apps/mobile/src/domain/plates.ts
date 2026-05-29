import type { PlateSet, Unit } from './types';

export function defaultPlateSet(unit: Unit): PlateSet {
  return unit === 'kg' ? 'kg-standard' : 'standard';
}

export const PLATES_LBS = [45, 35, 25, 10, 5, 2.5] as const;
export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const BAR_LBS = 45;
export const BAR_KG = 20;

export function barWeight(unit: Unit): number {
  return unit === 'kg' ? BAR_KG : BAR_LBS;
}

export type PlateCalc = {
  readonly perSide: readonly number[];
  readonly leftover: number;
};

export function decompose(target: number, plateSet: PlateSet): PlateCalc {
  const bar = plateSet === 'kg-standard' ? BAR_KG : BAR_LBS;
  const plates = plateSet === 'kg-standard' ? PLATES_KG : PLATES_LBS;
  return calcPlates(target, bar, plates);
}

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
