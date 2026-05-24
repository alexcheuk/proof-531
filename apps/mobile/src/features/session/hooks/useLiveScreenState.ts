import { useDb } from '@/data/DbProvider';
import { cancelSession, completeSession } from '@/data/accessors/session';
import { appendSetLog } from '@/data/accessors/setLog';
import { useSession } from '@/data/queries/useSession';
import { estimateOneRm } from '@/domain/epley';
import { type WorkingSetIndex, getWorkingSetByIndex, isAmrapSet } from '@/domain/schemes';
import { round as snapWeight } from '@/domain/units';
import { useQueryClient } from '@tanstack/react-query';
/**
 * Live screen state machine + rest-timer driver.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/hooks/
 * useLiveScreenState.ts`. The PWA models the screen as `ready` vs `rest`
 * keyed on persisted SetLog rows. The mobile port simplifies to an explicit
 * phase tag so the screen can also model the AMRAP rep-entry sheet and the
 * cancel-confirm sheet as first-class states, and so the rest timer can
 * count DOWN (T-3s warning haptic; T-0 has no audio cue under Expo Go since
 * the SDK 55 split removed expo-av's native module from Expo Go).
 *
 * Phases:
 *   - `prep`            — not yet entered first set (currently unused; reserved
 *                          for future warmups).
 *   - `set`             — show the working set; CTA logs working (or opens AMRAP).
 *   - `amrap-log`       — bottom sheet open for AMRAP rep entry.
 *   - `rest`            — countdown between sets.
 *   - `complete`        — session finished, parent should route away.
 *   - `cancel-confirm`  — bottom sheet open for cancel confirmation.
 *
 * Rest duration is fixed at 90s for this iteration. The warning haptic at T-3s
 * fires deterministically off the countdown so it can be asserted by advancing
 * fake timers in tests.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type LivePhase =
  | 'prep'
  | 'set'
  | 'amrap-log'
  | 'working-set-log'
  | 'rest'
  | 'complete'
  | 'cancel-confirm';

/** Default rest duration in seconds. */
export const REST_SECONDS = 90;
/** Seconds-remaining at which the warning haptic fires. */
export const WARNING_THRESHOLD = 3;

export type UseLiveScreenStateOptions = {
  /** Defaults to REST_SECONDS — overridable so tests can assert on a shorter timeline. */
  restSeconds?: number;
  /**
   * Fires the warning haptic when the rest timer reaches T-3s.
   * Defaults to expo-haptics' `notificationAsync(Warning)` — injectable for tests.
   */
  fireWarningHaptic?: () => void;
};

/**
 * Snapshot of the most recently logged working/AMRAP set. Captured at the
 * moment of write so RestPhase can render the just-logged headline without
 * re-deriving from query state (which would race the rest transition).
 */
export type LastLoggedSet = {
  weight: number;
  reps: number;
  estimated1RM: number | undefined;
  isAmrap: boolean;
};

export type UseLiveScreenStateResult = {
  phase: LivePhase;
  setIndex: WorkingSetIndex;
  /** Seconds remaining in the rest timer; 0 when not resting. */
  restRemaining: number;
  /** Configured rest target in seconds — exposed so RestPhase can render context (e.g. "of 1:30"). */
  restTarget: number;
  /** Snapshot of the most recently logged set. Cleared between sessions; null until the first log of this session. */
  lastLogged: LastLoggedSet | null;
  /** True if the current working set is the AMRAP top set. */
  isAmrap: boolean;
  /** Prescribed weight for the current set, snapped to the session's storage unit. */
  prescribedWeight: number;
  prescribedReps: number;
  /** Top-set % (0..1). */
  pct: number;
  /** True if the session row is loaded. */
  loaded: boolean;
  /** Press handlers. */
  onLogWorkingSet: () => Promise<void>;
  onOpenAmrapSheet: () => void;
  onSaveAmrap: (reps: number) => Promise<void>;
  onCancelAmrapSheet: () => void;
  /** W1.3 split-CTA branch — open the actual-rep entry sheet. */
  onOpenWorkingSetLogSheet: () => void;
  /** W1.3 split-CTA branch — save the actual-rep value (writes kind: 'working'). */
  onLogWorkingSetWithActual: (reps: number) => Promise<void>;
  /** W1.3 split-CTA branch — dismiss the sheet without writing. */
  onCancelWorkingSetLogSheet: () => void;
  onAdvanceFromRest: () => void;
  onRequestCancel: () => void;
  onConfirmCancelFirstTap: () => void;
  onConfirmCancelSecondTap: () => Promise<void>;
  onDismissCancelSheet: () => void;
  /** True once the user has tapped the destructive button once. */
  cancelArmed: boolean;
};

/**
 * Default warning haptic — lazy-loaded so the module can be imported in
 * environments where `expo-haptics` is mocked (jest) without bombing.
 */
function defaultFireWarningHaptic() {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic require for graceful degradation
    const Haptics = require('expo-haptics') as any;
    Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Warning ?? 'warning');
  } catch (err) {
    // No-op — haptics are best-effort.
    console.warn('useLiveScreenState: warning haptic unavailable', err);
  }
}

export function useLiveScreenState(
  sessionId: number | null,
  options: UseLiveScreenStateOptions = {},
): UseLiveScreenStateResult {
  const db = useDb();
  const queryClient = useQueryClient();
  const restSeconds = options.restSeconds ?? REST_SECONDS;
  const fireWarningHaptic = options.fireWarningHaptic ?? defaultFireWarningHaptic;

  const sessionQuery = useSession(sessionId);
  const session = sessionQuery.data;

  const [phase, setPhase] = useState<LivePhase>('set');
  const [setIndex, setSetIndex] = useState<WorkingSetIndex>(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [cancelArmed, setCancelArmed] = useState(false);
  const [lastLogged, setLastLogged] = useState<LastLoggedSet | null>(null);
  // The phase to return to when the cancel sheet is dismissed. Captured at
  // open time so the cancel flow doesn't disturb the underlying state.
  const phaseBeforeCancelRef = useRef<LivePhase>('set');
  // Track whether the warning threshold has already fired in the current rest
  // cycle so we don't double-trigger on re-renders or imprecise tick alignment.
  const warningFiredRef = useRef(false);

  // Per-set view model — derived from the session week + current index.
  // Defaults are safe (week=1, snapshot=0) so the hook never throws while
  // the session row is still loading.
  const week = (session?.week ?? 1) as 1 | 2 | 3 | 4;
  const workingSet = getWorkingSetByIndex(week, setIndex);
  const storageUnit = session?.storageUnitSnapshot ?? 'lbs';
  const prescribedWeight = session
    ? snapWeight(session.trainingMaxSnapshot * workingSet.pct, storageUnit)
    : 0;
  const prescribedReps = workingSet.reps;
  const pct = workingSet.pct;
  const isAmrap = isAmrapSet(week, setIndex);

  // Rest-timer driver. Runs only when phase === 'rest'.
  useEffect(() => {
    if (phase !== 'rest') return;
    warningFiredRef.current = false;
    setRestRemaining(restSeconds);
    const id = setInterval(() => {
      setRestRemaining((prev) => {
        const next = Math.max(0, prev - 1);
        return next;
      });
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [phase, restSeconds]);

  // Side-effect bus on every restRemaining tick. Kept separate from the
  // interval callback so the haptic fires from inside React's commit phase
  // rather than from a setState updater (which can run twice under StrictMode
  // and would double-fire the side effect). The T-0 audio cue was removed
  // when expo-av was dropped — Expo Go on SDK 55 no longer ships the
  // ExponentAV native module.
  useEffect(() => {
    if (phase !== 'rest') return;
    if (restRemaining === WARNING_THRESHOLD && !warningFiredRef.current) {
      warningFiredRef.current = true;
      fireWarningHaptic();
    }
  }, [phase, restRemaining, fireWarningHaptic]);

  // Shared invalidation helper for setLog-writing handlers. The cancel split
  // (Wave 3) depends on a fresh count of working/AMRAP rows at the moment of
  // X-tap, so we cannot wait for the complete-effect invalidation in
  // LiveScreen — every write path bumps this key inline.
  const invalidateSetLogs = useCallback(() => {
    if (!session?.id) return Promise.resolve();
    return queryClient.invalidateQueries({
      queryKey: ['setLogsForSession', session.id],
    });
  }, [queryClient, session?.id]);

  const onLogWorkingSet = useCallback(async () => {
    if (!session?.id) return;
    try {
      await appendSetLog(db, {
        sessionId: session.id,
        index: setIndex,
        kind: 'working',
        prescribedWeight,
        prescribedReps,
        actualReps: prescribedReps,
      });
      void invalidateSetLogs();
      // Snapshot the just-logged set for RestPhase. Non-AMRAP working sets
      // don't carry an estimated 1RM (matches the PWA's `isAmrap` gate on
      // the RestPhase est-1RM column).
      setLastLogged({
        weight: prescribedWeight,
        reps: prescribedReps,
        estimated1RM: undefined,
        isAmrap: false,
      });
      // Last working set on a non-AMRAP week (deload, week 4) → complete.
      // On AMRAP weeks the terminal set is logged via onSaveAmrap.
      if (setIndex === 2) {
        await completeSession(db, session.id);
        setPhase('complete');
        return;
      }
      setPhase('rest');
    } catch (err) {
      console.error('useLiveScreenState.onLogWorkingSet failed', err);
    }
  }, [db, invalidateSetLogs, prescribedReps, prescribedWeight, session?.id, setIndex]);

  const onOpenAmrapSheet = useCallback(() => {
    setPhase('amrap-log');
  }, []);

  const onCancelAmrapSheet = useCallback(() => {
    setPhase('set');
  }, []);

  const onSaveAmrap = useCallback(
    async (reps: number) => {
      if (!session?.id) return;
      try {
        await appendSetLog(db, {
          sessionId: session.id,
          index: setIndex,
          kind: 'amrap',
          prescribedWeight,
          prescribedReps,
          actualReps: reps,
        });
        void invalidateSetLogs();
        // Snapshot the just-logged AMRAP for RestPhase (even though AMRAP
        // is terminal, the snapshot keeps the contract consistent and lets
        // future flows reuse it without branching).
        setLastLogged({
          weight: prescribedWeight,
          reps,
          estimated1RM: estimateOneRm(prescribedWeight, reps),
          isAmrap: true,
        });
        // AMRAP is always terminal — go straight to complete.
        await completeSession(db, session.id);
        setPhase('complete');
      } catch (err) {
        console.error('useLiveScreenState.onSaveAmrap failed', err);
      }
    },
    [db, invalidateSetLogs, prescribedReps, prescribedWeight, session?.id, setIndex],
  );

  // W1.3 split-CTA: open the working-set actual-rep sheet.
  const onOpenWorkingSetLogSheet = useCallback(() => {
    setPhase('working-set-log');
  }, []);

  // W1.3 split-CTA: dismiss the sheet back to the underlying `set` surface.
  const onCancelWorkingSetLogSheet = useCallback(() => {
    setPhase('set');
  }, []);

  // W1.3 split-CTA: save the actual-rep value. Mirrors `onLogWorkingSet`
  // except `actualReps` comes from the sheet instead of being assumed equal
  // to `prescribedReps`. Same terminal-set behavior on non-AMRAP weeks.
  const onLogWorkingSetWithActual = useCallback(
    async (reps: number) => {
      if (!session?.id) return;
      try {
        await appendSetLog(db, {
          sessionId: session.id,
          index: setIndex,
          kind: 'working',
          prescribedWeight,
          prescribedReps,
          actualReps: reps,
        });
        void invalidateSetLogs();
        setLastLogged({
          weight: prescribedWeight,
          reps,
          estimated1RM: undefined,
          isAmrap: false,
        });
        if (setIndex === 2) {
          await completeSession(db, session.id);
          setPhase('complete');
          return;
        }
        setPhase('rest');
      } catch (err) {
        console.error('useLiveScreenState.onLogWorkingSetWithActual failed', err);
      }
    },
    [db, invalidateSetLogs, prescribedReps, prescribedWeight, session?.id, setIndex],
  );

  const onAdvanceFromRest = useCallback(() => {
    if (setIndex < 2) {
      setSetIndex((setIndex + 1) as WorkingSetIndex);
      setPhase('set');
      return;
    }
    setPhase('complete');
  }, [setIndex]);

  const onRequestCancel = useCallback(() => {
    phaseBeforeCancelRef.current = phase;
    setCancelArmed(false);
    setPhase('cancel-confirm');
  }, [phase]);

  const onDismissCancelSheet = useCallback(() => {
    setCancelArmed(false);
    setPhase(phaseBeforeCancelRef.current);
  }, []);

  // First tap on the destructive button — arm the confirm and fire the warning
  // haptic. The second tap is what actually destroys.
  const onConfirmCancelFirstTap = useCallback(() => {
    setCancelArmed(true);
    fireWarningHaptic();
  }, [fireWarningHaptic]);

  const onConfirmCancelSecondTap = useCallback(async () => {
    if (!session?.id) return;
    try {
      await cancelSession(db, session.id);
      setPhase('complete');
    } catch (err) {
      console.error('useLiveScreenState.onConfirmCancelSecondTap failed', err);
    }
  }, [db, session?.id]);

  return {
    phase,
    setIndex,
    restRemaining,
    restTarget: restSeconds,
    lastLogged,
    isAmrap,
    prescribedWeight,
    prescribedReps,
    pct,
    loaded: !!session,
    onLogWorkingSet,
    onOpenAmrapSheet,
    onSaveAmrap,
    onCancelAmrapSheet,
    onOpenWorkingSetLogSheet,
    onLogWorkingSetWithActual,
    onCancelWorkingSetLogSheet,
    onAdvanceFromRest,
    onRequestCancel,
    onConfirmCancelFirstTap,
    onConfirmCancelSecondTap,
    onDismissCancelSheet,
    cancelArmed,
  };
}
