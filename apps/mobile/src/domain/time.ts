/**
 * Pure time helpers shared across the app.
 *
 * Centralized here so feature code never re-implements `mm:ss` formatting
 * (we had four near-identical copies before — RestTimer, RestTargetSection,
 * BbbBand, BbbPromptScreen — and they had subtly different signed-zero +
 * negative-input behavior).
 */

/** Sanitize seconds — clamp to ≥0, integer. */
function safeSeconds(seconds: number): number {
  return Math.max(0, Math.floor(seconds));
}

/**
 * Format seconds as `M:SS`. Used for short cadence labels (rest target,
 * BBB inter-set pacing). Inputs ≤ 0 round to `0:00`.
 *
 * Examples: `90` → `1:30`, `60` → `1:00`, `5` → `0:05`, `-3` → `0:00`.
 */
export function formatMmSs(seconds: number): string {
  const safe = safeSeconds(seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Format seconds as `MM:SS`, or `H:MM:SS` once an hour has elapsed.
 * Used for elapsed session clocks where leading-zero minutes read more
 * stably (`00:42` rather than `0:42` jumping to `1:00`).
 */
export function formatClock(seconds: number): string {
  const safe = safeSeconds(seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (hours > 0) return `${hours}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}
