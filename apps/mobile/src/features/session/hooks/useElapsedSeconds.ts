import { useEffect, useState } from 'react';

/**
 * Returns the number of whole seconds elapsed since `startedAt`, ticking
 * once per second.
 *
 * `startedAt` is a wall-clock epoch ms (matches `session.startedAt`).
 * Pass `null` (or undefined) while the session row is still loading and
 * the hook will report 0.
 */
export function useElapsedSeconds(startedAt: number | null | undefined): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (startedAt == null) return;
    // Seed once immediately so the first paint isn't `0` for a tick.
    setNow(Date.now());
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [startedAt]);

  if (startedAt == null) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

/** Format seconds as `MM:SS` (or `H:MM:SS` once an hour has elapsed). */
export function formatElapsedClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) return `${hours}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}
