export const REST_STEP_MS = 30_000;

export function isExpired(endsAtMs: number, nowMs: number): boolean {
  return nowMs >= endsAtMs;
}

export function extendDeadline(endsAtMs: number, stepMs: number = REST_STEP_MS): number {
  return endsAtMs + stepMs;
}
