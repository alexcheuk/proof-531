import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

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
 * Wall-clock anchored: the countdown is derived from an absolute deadline
 * (`Date.now() + remaining`), not by decrementing a counter each tick. On
 * Android the JS thread is suspended while the app is backgrounded, so a
 * tick-decrement timer freezes and resumes mid-count (the rest period
 * effectively pauses). Anchoring to a deadline means each tick recomputes
 * from real time, so the timer stays correct across backgrounding; an
 * AppState listener resyncs the instant the app returns to the foreground.
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
  /**
   * Current absolute deadline in ms (or null when inactive). Stable callback so
   * a sibling effect can read the live value at event time (e.g. when the app
   * backgrounds and the rest notification needs the deadline to count down to).
   */
  getDeadlineMs: () => number | null;
  /**
   * Re-anchor the countdown to an absolute deadline. Used to copy a deadline
   * back from the notification on foreground (e.g. after a backgrounded +30s).
   */
  setDeadline: (endsAtMs: number) => void;
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
  // Absolute wall-clock ms at which `remaining` reaches 0. The single source
  // of truth for the countdown; ticks and foreground resyncs both derive
  // `remaining` from it. Null while inactive.
  const deadlineRef = useRef<number | null>(null);

  // Reset + tick. When `active` becomes true we seed `initialRemaining` (if
  // restoring a paused timer) else `seconds`, and arm the warning latch; the
  // interval decrements each second. When `active` flips back to false the
  // cleanup tears down the interval (next start will re-seed).
  useEffect(() => {
    if (!active) {
      deadlineRef.current = null;
      return;
    }
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
    deadlineRef.current = Date.now() + seed * 1000;
    setRemaining(seed);
    const recompute = () => {
      if (deadlineRef.current == null) return;
      setRemaining(Math.round((deadlineRef.current - Date.now()) / 1000));
    };
    const id = setInterval(recompute, 1000);
    // Resync immediately on foreground: the interval was suspended while
    // backgrounded, so the first post-resume value would otherwise lag by up
    // to a second (and the done haptic would be late).
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recompute();
    });
    return () => {
      clearInterval(id);
      sub.remove();
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
    if (!active || deadlineRef.current == null) return;
    deadlineRef.current += STEP_SECONDS * 1000;
    const next = Math.round((deadlineRef.current - Date.now()) / 1000);
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
    setRemaining(next);
  }, [active, warningThresholdSeconds]);

  const subtractTime = useCallback(() => {
    if (!active || deadlineRef.current == null) return;
    // Floor at 1s — leaving 0/negative would re-fire the warning haptic at
    // the next T-threshold once the user adds time again.
    const current = Math.round((deadlineRef.current - Date.now()) / 1000);
    const next = Math.max(1, current - STEP_SECONDS);
    deadlineRef.current = Date.now() + next * 1000;
    if (next > warningThresholdSeconds) {
      warningFiredRef.current = false;
    }
    // Floor at 1 means `next` is always > 0 — done latch stays armed
    // until the timer naturally hits 0 again.
    setRemaining(next);
  }, [active, warningThresholdSeconds]);

  const getDeadlineMs = useCallback(() => deadlineRef.current, []);

  const setDeadline = useCallback(
    (endsAtMs: number) => {
      deadlineRef.current = endsAtMs;
      const next = Math.round((endsAtMs - Date.now()) / 1000);
      // Re-arm latches so a re-anchor that lands above the thresholds can still
      // fire the warning / done cues on the way down.
      if (next > warningThresholdSeconds) warningFiredRef.current = false;
      if (next > 0) doneFiredRef.current = false;
      setRemaining(next);
    },
    [warningThresholdSeconds],
  );

  return { remaining, addTime, subtractTime, getDeadlineMs, setDeadline };
}
