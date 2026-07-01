// Epley: weight × (1 + reps / 30). Identity at reps=1 (raw formula overshoots by ×31/30).
// reps ≤ 0 returns 0  -  weight × 1.0 would show prescribed weight as "estimated 1RM" at the 0-rep stepper.
export function estimateOneRm(weight: number, reps: number): number {
  if (weight <= 0) return 0;
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

// Returns the minimum reps at `weight` needed to exceed `existingBestE1RM` via Epley.
// Returns null when there is no prior best to beat (no baseline).
// Accounts for the reps=1 identity: at reps=1, e1RM = weight, so 1 rep is only
// enough when weight > existingBestE1RM; otherwise the minimum is at least 2.
export function minRepsForPR(weight: number, existingBestE1RM: number): number | null {
  if (weight <= 0 || existingBestE1RM <= 0) return null;
  // 1 rep already beats the best (reps=1 identity: e1RM = weight)
  if (weight > existingBestE1RM) return 1;
  // For reps >= 2: weight * (1 + reps/30) > existingBestE1RM
  // => reps > 30 * (existingBestE1RM / weight - 1)
  return Math.max(2, Math.floor(30 * (existingBestE1RM / weight - 1)) + 1);
}
