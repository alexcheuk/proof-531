// Epley: weight × (1 + reps / 30). Identity at reps=1 (raw formula overshoots by ×31/30).
// reps ≤ 0 returns 0 — weight × 1.0 would show prescribed weight as "estimated 1RM" at the 0-rep stepper.
export function estimateOneRm(weight: number, reps: number): number {
  if (weight <= 0) return 0;
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}
