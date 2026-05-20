import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small hook driving the rest-phase clock.
 *
 * Pure-ish: accepts a `now()` provider for deterministic tests. The interval
 * ticks every 250 ms but `elapsed` only changes when whole-second boundaries
 * cross, so consumers can render `M:SS` without per-frame churn.
 */
export type RestTimer = {
  elapsed: number;
  start: () => void;
  reset: () => void;
  running: boolean;
};

export type UseRestTimerOptions = {
  now?: () => number;
};

export function useRestTimer(opts?: UseRestTimerOptions): RestTimer {
  const now = opts?.now ?? Date.now;
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (startedAt.current != null) {
        setElapsed(Math.floor((now() - startedAt.current) / 1000));
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, now]);

  const start = useCallback(() => {
    startedAt.current = now();
    setElapsed(0);
    setRunning(true);
  }, [now]);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    startedAt.current = null;
  }, []);

  return { elapsed, start, reset, running };
}
