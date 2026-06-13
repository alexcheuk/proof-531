/** Converts a fractional percentage (0..1) to a display integer (0..100). */
export function pctToDisplay(pct: number): number {
  return Math.round(pct * 100);
}
