import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

// Wall-clock anchored (not tick-decrement)  -  Android suspends the JS thread when backgrounded,
// so a tick-based timer would freeze. Each tick recomputes from the absolute deadline instead.
export type UseRestTimerOptions = {
  active: boolean;
  seconds: number;
  initialRemaining?: number | null;
  warningThresholdSeconds?: number;
  fireWarningHaptic: () => void;
  fireDoneHaptic?: () => void;
};

export type UseRestTimerResult = {
  remaining: number;
  addTime: () => void;
  subtractTime: () => void;
  getDeadlineMs: () => number | null;
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
  // Done haptic fires only on the positive→≤0 transition. Initial remaining=0 (before seed effect) must not trigger.
  const doneFiredRef = useRef(false);
  const prevRemainingRef = useRef<number>(remaining);
  // Ref so a prop change (e.g. parent clearing the snapshot) doesn't retroactively reseed a running timer.
  const initialRemainingRef = useRef(initialRemaining);
  initialRemainingRef.current = initialRemaining;
  const deadlineRef = useRef<number | null>(null);

  // Precise alarm: a setTimeout that fires the done haptic at the exact deadline,
  // bypassing the setInterval jitter that can accumulate 1-2s over a 3-min rest.
  const preciseAlarmRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always-fresh haptic ref so the setTimeout callback calls the latest prop
  // without re-creating the arming function on every render.
  const fireDoneHapticRef = useRef(fireDoneHaptic);
  fireDoneHapticRef.current = fireDoneHaptic;

  // Stable arming function - all closures are over refs (stable objects).
  const armAlarmRef = useRef((endsAtMs: number) => {
    if (preciseAlarmRef.current != null) {
      clearTimeout(preciseAlarmRef.current);
      preciseAlarmRef.current = null;
    }
    const delay = Math.max(0, endsAtMs - Date.now());
    preciseAlarmRef.current = setTimeout(() => {
      preciseAlarmRef.current = null;
      if (doneFiredRef.current) return;
      doneFiredRef.current = true;
      fireDoneHapticRef.current?.();
    }, delay);
  });

  useEffect(() => {
    if (!active) {
      deadlineRef.current = null;
      if (preciseAlarmRef.current != null) {
        clearTimeout(preciseAlarmRef.current);
        preciseAlarmRef.current = null;
      }
      return;
    }
    warningFiredRef.current = false;
    doneFiredRef.current = false;
    const seed = initialRemainingRef.current ?? seconds;
    if (seed <= warningThresholdSeconds) {
      warningFiredRef.current = true;
    }
    if (seed <= 0) {
      doneFiredRef.current = true;
    }
    deadlineRef.current = Date.now() + seed * 1000;
    setRemaining(seed);
    if (!doneFiredRef.current) {
      armAlarmRef.current(deadlineRef.current);
    }
    const recompute = () => {
      if (deadlineRef.current == null) return;
      setRemaining(Math.round((deadlineRef.current - Date.now()) / 1000));
    };
    const id = setInterval(recompute, 1000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recompute();
    });
    return () => {
      clearInterval(id);
      sub.remove();
      if (preciseAlarmRef.current != null) {
        clearTimeout(preciseAlarmRef.current);
        preciseAlarmRef.current = null;
      }
    };
  }, [active, seconds, warningThresholdSeconds]);

  // Separate effect so haptics fire from the commit phase, not the interval callback (which runs twice in StrictMode).
  useEffect(() => {
    if (!active) {
      prevRemainingRef.current = remaining;
      return;
    }
    if (remaining === warningThresholdSeconds && !warningFiredRef.current) {
      warningFiredRef.current = true;
      fireWarningHaptic();
    }
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
    // Re-arm so the warning fires again on the next pass through the threshold (not just the first).
    if (next > warningThresholdSeconds) {
      warningFiredRef.current = false;
    }
    if (next > 0) {
      doneFiredRef.current = false;
      armAlarmRef.current(deadlineRef.current);
    }
    setRemaining(next);
  }, [active, warningThresholdSeconds]);

  const subtractTime = useCallback(() => {
    if (!active || deadlineRef.current == null) return;
    const current = Math.round((deadlineRef.current - Date.now()) / 1000);
    const next = Math.max(1, current - STEP_SECONDS);
    deadlineRef.current = Date.now() + next * 1000;
    if (next > warningThresholdSeconds) {
      warningFiredRef.current = false;
    }
    armAlarmRef.current(deadlineRef.current);
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
      if (next > 0) {
        doneFiredRef.current = false;
        armAlarmRef.current(endsAtMs);
      }
      setRemaining(next);
    },
    [warningThresholdSeconds],
  );

  return { remaining, addTime, subtractTime, getDeadlineMs, setDeadline };
}
