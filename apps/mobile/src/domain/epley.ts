/**
 * Epley 1RM estimate: weight × (1 + reps / 30).
 *
 * Identity short-circuit at reps === 1: a 1-rep lift IS the 1RM. Returning the
 * raw formula at reps=1 would yield weight × 31/30 ≈ weight × 1.0333.
 */
export function estimateOneRm(weight: number, reps: number): number {
  if (weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}
