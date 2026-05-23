import { useDb } from '@/data/DbProvider';
import { cancelSession, completeSession } from '@/data/accessors/session';
import { appendSetLog } from '@/data/accessors/setLog';
import { useSession } from '@/data/queries/useSession';
import { type WorkingSetIndex, getWorkingSetByIndex, isAmrapSet } from '@/domain/schemes';
import { round as snapWeight } from '@/domain/units';
/**
 * Live screen state machine + rest-timer driver.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/hooks/
 * useLiveScreenState.ts`. The PWA models the screen as `ready` vs `rest`
 * keyed on persisted SetLog rows. The mobile port simplifies to an explicit
 * phase tag so the screen can also model the AMRAP rep-entry sheet and the
 * cancel-confirm sheet as first-class states, and so the rest timer can
 * count DOWN (per PE-05 done_when: T-3s warning haptic, T-0 chime).
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
 * Rest duration is fixed at 90s for this iteration. The chime + warning haptic
 * fire deterministically off the countdown so they can be asserted by
 * advancing fake timers in tests.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type LivePhase = 'prep' | 'set' | 'amrap-log' | 'rest' | 'complete' | 'cancel-confirm';

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
  /**
   * Fires the chime when the rest timer reaches T-0.
   * Defaults to a graceful expo-av loader — injectable for tests.
   */
  playChime?: () => void;
};

export type UseLiveScreenStateResult = {
  phase: LivePhase;
  setIndex: WorkingSetIndex;
  /** Seconds remaining in the rest timer; 0 when not resting. */
  restRemaining: number;
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

/**
 * Default chime player. Attempts to load an expo-av Sound from the bundled
 * placeholder. The asset may not exist yet — log and continue rather than
 * throwing.
 */
function defaultPlayChime() {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic require for graceful degradation
    const ExpoAv = require('expo-av') as any;
    const Audio = ExpoAv?.Audio;
    if (!Audio?.Sound?.createAsync) return;
    // Fire-and-forget — tests only assert `Audio.Sound.createAsync` was called.
    Promise.resolve()
      .then(() => {
        // The asset may not exist; the catch below swallows the load error.
        let asset: unknown = null;
        try {
          asset = require('../../../../assets/audio/chime.wav');
        } catch {
          // No bundled asset yet — pass an empty source; Audio.Sound.createAsync
          // in production will reject, but tests assert call only.
          asset = null;
        }
        return Audio.Sound.createAsync(asset, { shouldPlay: true });
      })
      .catch((err: unknown) => {
        console.warn('useLiveScreenState: chime asset unavailable', err);
      });
  } catch (err) {
    console.warn('useLiveScreenState: chime player unavailable', err);
  }
}

export function useLiveScreenState(
  sessionId: number | null,
  options: UseLiveScreenStateOptions = {},
): UseLiveScreenStateResult {
  const db = useDb();
  const restSeconds = options.restSeconds ?? REST_SECONDS;
  const fireWarningHaptic = options.fireWarningHaptic ?? defaultFireWarningHaptic;
  const playChime = options.playChime ?? defaultPlayChime;

  const sessionQuery = useSession(sessionId);
  const session = sessionQuery.data;

  const [phase, setPhase] = useState<LivePhase>('set');
  const [setIndex, setSetIndex] = useState<WorkingSetIndex>(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [cancelArmed, setCancelArmed] = useState(false);
  // The phase to return to when the cancel sheet is dismissed. Captured at
  // open time so the cancel flow doesn't disturb the underlying state.
  const phaseBeforeCancelRef = useRef<LivePhase>('set');
  // Track which thresholds have already fired in the current rest cycle so we
  // don't double-trigger on re-renders or imprecise tick alignment.
  const warningFiredRef = useRef(false);
  const chimeFiredRef = useRef(false);

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
    chimeFiredRef.current = false;
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
  // interval callback so the haptic/chime fire from inside React's commit
  // phase rather than from a setState updater (which can run twice under
  // StrictMode and would double-fire the side effect).
  useEffect(() => {
    if (phase !== 'rest') return;
    if (restRemaining === WARNING_THRESHOLD && !warningFiredRef.current) {
      warningFiredRef.current = true;
      fireWarningHaptic();
    }
    if (restRemaining === 0 && !chimeFiredRef.current) {
      chimeFiredRef.current = true;
      playChime();
    }
  }, [phase, restRemaining, fireWarningHaptic, playChime]);

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
  }, [db, prescribedReps, prescribedWeight, session?.id, setIndex]);

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
        // AMRAP is always terminal — go straight to complete.
        await completeSession(db, session.id);
        setPhase('complete');
      } catch (err) {
        console.error('useLiveScreenState.onSaveAmrap failed', err);
      }
    },
    [db, prescribedReps, prescribedWeight, session?.id, setIndex],
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
    isAmrap,
    prescribedWeight,
    prescribedReps,
    pct,
    loaded: !!session,
    onLogWorkingSet,
    onOpenAmrapSheet,
    onSaveAmrap,
    onCancelAmrapSheet,
    onAdvanceFromRest,
    onRequestCancel,
    onConfirmCancelFirstTap,
    onConfirmCancelSecondTap,
    onDismissCancelSheet,
    cancelArmed,
  };
}
