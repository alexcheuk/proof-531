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
 * Optionally also fires `fireDoneHaptic` exactly once when `remaining`
 * crosses 0 — a stronger "GO" cue at the moment rest ends so the user
 * doesn't need to be staring at the screen to know it's time to lift.
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
  /**
   * One-shot override for the seed value on the *next* activation — used to
   * restore a rest timer mid-countdown when the screen remounts. Read once
   * when `active` flips to true, then ignored until the next activation.
   * Pass `null` (the default) to use `seconds` as the seed.
   */
  initialRemaining?: number | null;
  /** Threshold at which the warning haptic fires. Defaults to 3. */
  warningThresholdSeconds?: number;
  /** Side-effect bus for the warning haptic. */
  fireWarningHaptic: () => void;
  /**
   * Optional side-effect bus for the "rest done" haptic — fires exactly
   * once per countdown when `remaining` transitions to 0. Same re-arm
   * semantics as the warning: pushing time back above 0 re-arms.
   */
  fireDoneHaptic?: () => void;
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
  initialRemaining = null,
  warningThresholdSeconds = DEFAULT_WARNING_THRESHOLD,
  fireWarningHaptic,
  fireDoneHaptic,
}: UseRestTimerOptions): UseRestTimerResult {
  const [remaining, setRemaining] = useState(0);
  const warningFiredRef = useRef(false);
  // Done haptic only fires on the positive → ≤0 transition. Initial
  // `remaining=0` (before the seed effect runs) must not count as a
  // transition, so we track the previous tick and require it to have
  // been > 0.
  const doneFiredRef = useRef(false);
  const prevRemainingRef = useRef<number>(remaining);
  // Latch the override so a later prop change (e.g. parent clearing the
  // restored snapshot) does not retroactively reseed the running timer.
  const initialRemainingRef = useRef(initialRemaining);
  initialRemainingRef.current = initialRemaining;

  // Reset + tick. When `active` becomes true we seed `initialRemaining` (if
  // restoring a paused timer) else `seconds`, and arm the warning latch; the
  // interval decrements each second. When `active` flips back to false the
  // cleanup tears down the interval (next start will re-seed).
  useEffect(() => {
    if (!active) return;
    warningFiredRef.current = false;
    doneFiredRef.current = false;
    const seed = initialRemainingRef.current ?? seconds;
    // If the restored remaining is already past the warning threshold, the
    // user has already heard the haptic — keep the latch tripped.
    if (seed <= warningThresholdSeconds) {
      warningFiredRef.current = true;
    }
    if (seed <= 0) {
      doneFiredRef.current = true;
    }
    setRemaining(seed);
    const id = setInterval(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [active, seconds, warningThresholdSeconds]);

  // Side-effect bus on every `remaining` tick. Kept separate from the
  // interval callback so the haptic fires from React's commit phase rather
  // than from a setState updater (which can run twice under StrictMode and
  // double-fire the side effect).
  useEffect(() => {
    if (!active) {
      prevRemainingRef.current = remaining;
      return;
    }
    if (remaining === warningThresholdSeconds && !warningFiredRef.current) {
      warningFiredRef.current = true;
      fireWarningHaptic();
    }
    // Fire done only on the positive → ≤0 transition. Guards against the
    // initial commit where remaining is still 0 from the useState seed
    // before the activation effect has setRemaining(seed).
    if (remaining <= 0 && prevRemainingRef.current > 0 && !doneFiredRef.current && fireDoneHaptic) {
      doneFiredRef.current = true;
      fireDoneHaptic();
    }
    prevRemainingRef.current = remaining;
  }, [active, remaining, warningThresholdSeconds, fireWarningHaptic, fireDoneHaptic]);

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
      if (next > 0) {
        doneFiredRef.current = false;
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
      // Floor at 1 means `next` is always > 0 — done latch stays armed
      // until the timer naturally hits 0 again.
      return next;
    });
  }, [active, warningThresholdSeconds]);

  return { remaining, addTime, subtractTime };
}
