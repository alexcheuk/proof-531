/**
 * Pure rest-deadline math. The rest countdown's single source of truth is an
 * absolute wall-clock deadline (`endsAtMs`); the in-app timer and the Android
 * notification both derive their display from it. No React, no I/O.
 */

/** One tap of the in-app +/- controls and the notification "+30s" action. */
export const REST_STEP_MS = 30_000;

/** Signed milliseconds until the deadline; negative once overtime. */
export function remainingMs(endsAtMs: number, nowMs: number): number {
  return endsAtMs - nowMs;
}

/** Whole seconds remaining, rounded to the nearest second (negative in overtime). */
export function remainingSeconds(endsAtMs: number, nowMs: number): number {
  return Math.round((endsAtMs - nowMs) / 1000);
}

/** True once the deadline has passed (or is exactly now). */
export function isExpired(endsAtMs: number, nowMs: number): boolean {
  return nowMs >= endsAtMs;
}

/** Push the deadline out by `stepMs` (default one +30s step). */
export function extendDeadline(endsAtMs: number, stepMs: number = REST_STEP_MS): number {
  return endsAtMs + stepMs;
}
