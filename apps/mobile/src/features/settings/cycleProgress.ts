/**
 * Pure derivation of the cycle progress card copy.
 *
 * Inputs: `week` (1-4), `liftsPerCycle` (= settings.enabledLifts.length,
 * clamped ≥1). Returns the day-of-cycle position + a friendly secondary
 * caption that adapts to where the user is in the cycle.
 *
 * No React, no DB — domain-free so the math is property-testable.
 */
export type CycleProgress = {
  /** 1-based day within the current cycle. */
  dayOfCycle: number;
  /** Total days in the cycle (liftsPerCycle × 4 weeks). */
  totalDays: number;
  /** Free-text caption: "3 days to deload" / "Deload week · last cycle day" / etc. */
  caption: string;
};

export function deriveCycleProgress(week: number, liftsPerCycle: number): CycleProgress {
  const lpc = Math.max(1, Math.floor(liftsPerCycle));
  const totalDays = lpc * 4;
  // Approximate progress by week boundary. We don't know how many sessions
  // of the current week have shipped without joining the sessions table, so
  // the card represents the *start* of the current week — accurate enough
  // for a passive marker.
  const safeWeek = Math.max(1, Math.min(4, Math.floor(week)));
  const dayOfCycle = (safeWeek - 1) * lpc + 1;

  let caption: string;
  if (safeWeek === 4) {
    caption = 'Deload week · light loads';
  } else {
    const weeksToDeload = 4 - safeWeek;
    caption = weeksToDeload === 1 ? '1 week until deload' : `${weeksToDeload} weeks until deload`;
  }
  return { dayOfCycle, totalDays, caption };
}
