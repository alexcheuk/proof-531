/**
 * Pure helpers for the PlateBar visualization. No React — kept here so the
 * size ramp + grouping rules can be unit-tested independently.
 */

/** Plate-size ramp. Width of kg set anchors at 1.25 → 25; lb at 2.5 → 45. */
export function sizeFor(plate: number, unitGlyph: string): number {
  const isKg = unitGlyph === 'kg';
  const max = isKg ? 25 : 45;
  const min = isKg ? 1.25 : 2.5;
  const t = Math.max(0, Math.min(1, (plate - min) / (max - min)));
  return 0.36 + t * 0.64;
}

export type PlateGroup = { weight: number; count: number };

/**
 * Run-length encode the per-side stack into groups of consecutive equal
 * weights. Used by the caption row's "2× 45 + 25" rendering.
 */
export function groupPlates(perSide: readonly number[]): PlateGroup[] {
  const grouped: PlateGroup[] = [];
  for (const p of perSide) {
    const last = grouped[grouped.length - 1];
    if (last && last.weight === p) last.count += 1;
    else grouped.push({ weight: p, count: 1 });
  }
  return grouped;
}
