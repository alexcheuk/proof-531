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
