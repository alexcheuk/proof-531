/**
 * e1RM (Epley) + PR detection.
 *
 * Epley: e1RM = weight * (1 + reps / 30)
 *
 * Pure module: no React, no async, no IO.
 */

export function epley(weight: number, reps: number): number {
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error(`epley: weight must be finite and > 0, got ${weight}`);
  }
  if (!Number.isInteger(reps) || reps <= 0) {
    throw new Error(`epley: reps must be a positive integer, got ${reps}`);
  }
  // Epley convention: a single rep is its own 1RM (no extrapolation).
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * isPR(current, history) — true iff current strictly exceeds max(history).
 * Empty history is a vacuous PR for any non-negative current value.
 */
export function isPR(currentE1RM: number, history: readonly number[]): boolean {
  if (!Number.isFinite(currentE1RM) || currentE1RM < 0) {
    throw new Error(`isPR: currentE1RM must be finite and >= 0, got ${currentE1RM}`);
  }
  for (const h of history) {
    if (!Number.isFinite(h)) {
      throw new Error(`isPR: history must contain only finite numbers, got ${h}`);
    }
  }
  if (history.length === 0) return true;
  return currentE1RM > Math.max(...history);
}
