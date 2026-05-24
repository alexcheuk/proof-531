import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Standalone rest-timer driver.
 *
 * Counts DOWN from `seconds` to 0 (and continues negative for the count-up
 * label) while `active` is true. Fires `fireWarningHaptic` exactly once per
 * countdown when `remaining` reaches `warningThresholdSeconds`. The warning
 * latch re-arms whenever `addTime` pushes `remaining` back above the
 * threshold so users adding time mid-rest get the warning again on their
 * second pass through T-3s.
 *
 * Why this lives outside useLiveScreenState: keeping the timer as its own
 * hook makes it independently testable (no DbProvider / session row), keeps
 * the live-screen state machine focused on phase transitions, and lets
 * non-session surfaces (warm-up timers, future supplement timers) reuse the
 * same primitive.
 */
export type UseRestTimerOptions = {
  /** When false, the timer pauses and `remaining` holds at 0. */
  active: boolean;
  /** Initial countdown duration; the hook resets to this each time `active` flips to true. */
  seconds: number;
  /** Threshold at which the warning haptic fires. Defaults to 3. */
  warningThresholdSeconds?: number;
  /** Side-effect bus for the warning haptic. */
  fireWarningHaptic: () => void;
};

export type UseRestTimerResult = {
  /** Seconds remaining. Allowed to go negative (overtime). */
  remaining: number;
  /** Add 30s to the running countdown. No-op when not `active`. */
  addTime: () => void;
  /** Subtract 30s (floored at 1). No-op when not `active`. */
  subtractTime: () => void;
};

const DEFAULT_WARNING_THRESHOLD = 3;
const STEP_SECONDS = 30;

export function useRestTimer({
  active,
  seconds,
  warningThresholdSeconds = DEFAULT_WARNING_THRESHOLD,
  fireWarningHaptic,
}: UseRestTimerOptions): UseRestTimerResult {
  const [remaining, setRemaining] = useState(0);
  const warningFiredRef = useRef(false);

  // Reset + tick. When `active` becomes true we seed `seconds` and arm the
  // warning latch; the interval decrements each second. When `active` flips
  // back to false the cleanup tears down the interval (next start will
  // re-seed).
  useEffect(() => {
    if (!active) return;
    warningFiredRef.current = false;
    setRemaining(seconds);
    const id = setInterval(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [active, seconds]);

  // Side-effect bus on every `remaining` tick. Kept separate from the
  // interval callback so the haptic fires from React's commit phase rather
  // than from a setState updater (which can run twice under StrictMode and
  // double-fire the side effect).
  useEffect(() => {
    if (!active) return;
    if (remaining === warningThresholdSeconds && !warningFiredRef.current) {
      warningFiredRef.current = true;
      fireWarningHaptic();
    }
  }, [active, remaining, warningThresholdSeconds, fireWarningHaptic]);

  const addTime = useCallback(() => {
    if (!active) return;
    setRemaining((prev) => {
      const next = prev + STEP_SECONDS;
      // Re-arm the warning latch so the haptic fires again the next time
      // the user drifts back down through the threshold. Without this the
      // first T-3s pass disables the haptic for the rest of the session,
      // which is the opposite of the contract stated in the docstring.
      if (next > warningThresholdSeconds) {
        warningFiredRef.current = false;
      }
      return next;
    });
  }, [active, warningThresholdSeconds]);

  const subtractTime = useCallback(() => {
    if (!active) return;
    // Floor at 1s — leaving 0/negative would re-fire the warning haptic at
    // the next T-threshold once the user adds time again.
    setRemaining((prev) => {
      const next = Math.max(1, prev - STEP_SECONDS);
      if (next > warningThresholdSeconds) {
        warningFiredRef.current = false;
      }
      return next;
    });
  }, [active, warningThresholdSeconds]);

  return { remaining, addTime, subtractTime };
}
