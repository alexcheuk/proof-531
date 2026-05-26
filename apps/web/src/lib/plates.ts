/**
 * Plate math, ported verbatim from apps/mobile/src/domain/plates.ts and
 * apps/mobile/src/design/primitives/PlateBar/plateMath.ts so the marketing
 * site renders plate visualizations with the SAME decomposition + size ramp
 * the real app uses.
 *
 * Keep this in lockstep with the mobile source. When the mobile primitive
 * changes (plate inventory, size ramp, grouping rules), update this file.
 */

export const PLATES_LBS = [45, 35, 25, 10, 5, 2.5] as const;
export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const BAR_LBS = 45;
export const BAR_KG = 20;

export type Unit = 'lb' | 'kg';

export type PlateCalc = {
  /** Plates on ONE side (the bar is symmetric), heaviest first. */
  perSide: readonly number[];
  /** Total weight (both sides) that couldn't be matched. 0 when exact. */
  leftover: number;
};

/** Greedy per-side decomposition. */
export function decompose(target: number, unit: Unit = 'lb'): PlateCalc {
  const bar = unit === 'kg' ? BAR_KG : BAR_LBS;
  const plates = unit === 'kg' ? PLATES_KG : PLATES_LBS;
  const remainingTotal = target - bar;
  if (remainingTotal <= 0) {
    return { perSide: [], leftover: remainingTotal };
  }
  let perSideRemaining = remainingTotal / 2;
  const perSide: number[] = [];
  const sorted = [...plates].sort((a, b) => b - a);
  for (const plate of sorted) {
    while (perSideRemaining + 1e-9 >= plate) {
      perSide.push(plate);
      perSideRemaining -= plate;
    }
  }
  const leftover = perSideRemaining * 2;
  return { perSide, leftover: Math.abs(leftover) < 1e-6 ? 0 : leftover };
}

/** Plate-size ramp. Width of kg set anchors at 1.25 → 25; lb at 2.5 → 45. */
export function sizeFor(plate: number, unit: Unit = 'lb'): number {
  const isKg = unit === 'kg';
  const max = isKg ? 25 : 45;
  const min = isKg ? 1.25 : 2.5;
  const t = Math.max(0, Math.min(1, (plate - min) / (max - min)));
  return 0.36 + t * 0.64;
}

export type PlateGroup = { weight: number; count: number };

/** Run-length encode the per-side stack for the "2× 45 + 10" caption. */
export function groupPlates(perSide: readonly number[]): PlateGroup[] {
  const grouped: PlateGroup[] = [];
  for (const p of perSide) {
    const last = grouped[grouped.length - 1];
    if (last && last.weight === p) last.count += 1;
    else grouped.push({ weight: p, count: 1 });
  }
  return grouped;
}

/** Pretty-print a number, dropping trailing .0 (so 2.5 stays, 45 stays). */
export function plateLabel(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n);
}
