function safeSeconds(seconds: number): number {
  return Math.max(0, Math.floor(seconds));
}

// Inputs ≤ 0 render as `0:00`. Format: `M:SS` (no zero-pad on minutes).
export function formatMmSs(seconds: number): string {
  const safe = safeSeconds(seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Leading-zero minutes (`00:42` not `0:42`) prevent layout jumps at the hour boundary.
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
