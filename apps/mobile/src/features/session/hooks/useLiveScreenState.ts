import { useDb } from '@/data/DbProvider';
import { cancelSession, completeSession } from '@/data/accessors/session';
import { useSession } from '@/data/queries/useSession';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import { useSetLogsForSession } from '@/data/queries/useSetLogsForSession';
import {
  type WorkingSetIndex,
  getWorkingSetByIndex,
  isAmrapSet,
  nextWorkingSetIndex,
} from '@/domain/schemes';
import { round as snapWeight } from '@/domain/units';
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
 * `setIndex` is **derived from the persisted `set_logs` rows on bootstrap**
 * — when the user backs out of Live and resumes, the next-unfinished set is
 * computed from the database, not from stale React state. After bootstrap
 * the index advances via local state for transient phase transitions
 * (set → rest → set), and the query is invalidated so other surfaces (Today's
 * "Resume working set N" CTA, SessionComplete's receipt) see the new row.
 *
 * Rest duration is fixed at 90s for this iteration. The warning haptic at T-3s
 * fires deterministically off the countdown so it can be asserted by advancing
 * fake timers in tests.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCancelConfirm } from './useCancelConfirm';
import { useLogWorkingSets } from './useLogWorkingSets';
import { useRestTimer } from './useRestTimer';

export type LivePhase = 'prep' | 'set' | 'amrap-log' | 'rest' | 'complete' | 'cancel-confirm';

/** Default rest duration in seconds. */
export const REST_SECONDS = 90;
/** Seconds-remaining at which the warning haptic fires. */
export const WARNING_THRESHOLD = 3;
/**
 * How long the cancel-confirm destructive button stays armed before
 * silently disarming itself. Prevents the footgun where a user taps once
 * accidentally, looks away, and the second tap an hour later destroys the
 * session.
 */
export const CANCEL_ARM_TIMEOUT_MS = 8000;

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
  /** Add 30s to the running countdown — no-op outside `rest`. */
  onAddRest: () => void;
  /** Subtract 30s from the running countdown (floored at -overtime allowed) — no-op outside `rest`. */
  onSubRest: () => void;
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

function computeNextSetIndex(
  logs: ReadonlyArray<{ kind: string; index: number }> | undefined,
): WorkingSetIndex | null {
  if (!logs) return 0;
  const completed = logs
    .filter((l) => l.kind === 'working' || l.kind === 'amrap')
    .map((l) => l.index)
    .filter((i): i is WorkingSetIndex => i === 0 || i === 1 || i === 2);
  return nextWorkingSetIndex(Array.from(new Set(completed)));
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

  // setLogs is the source of truth for which working/AMRAP indices have been
  // recorded for this session. On first load we use it to bootstrap setIndex
  // so a user who backs out of Live and resumes lands on the correct set.
  const setLogsQuery = useSetLogsForSession(sessionId);
  const setLogsData = setLogsQuery.data;

  const [phase, setPhase] = useState<LivePhase>('set');
  const [setIndex, setSetIndex] = useState<WorkingSetIndex>(0);
  const [lastLogged, setLastLogged] = useState<LastLoggedSet | null>(null);
  // Two-tap arm/disarm + auto-disarm for the destructive cancel button.
  const cancelConfirm = useCancelConfirm({
    timeoutMs: CANCEL_ARM_TIMEOUT_MS,
    onArmHaptic: fireWarningHaptic,
  });
  // Bootstrap-once gate: keeps the first non-undefined setLogs read from
  // overwriting subsequent local advances (after we manually setSetIndex on
  // log-and-advance, the query refetches and arrives with one MORE row,
  // which would otherwise re-derive the same setIndex value and cause a
  // benign re-render — guard so the read only happens once per session).
  const bootstrappedRef = useRef(false);
  // The phase to return to when the cancel sheet is dismissed. Captured at
  // open time so the cancel flow doesn't disturb the underlying state.
  const phaseBeforeCancelRef = useRef<LivePhase>('set');

  // Rest-timer driver — extracted hook owns the countdown, warning latch,
  // and ±30s controls.
  const restTimer = useRestTimer({
    active: phase === 'rest',
    seconds: restSeconds,
    warningThresholdSeconds: WARNING_THRESHOLD,
    fireWarningHaptic,
  });

  // Bootstrap setIndex (and possibly phase) from persisted set_logs the
  // first time the query resolves. If every working/AMRAP slot is already
  // filled we transition straight to `complete` (idempotent
  // completeSession — protects against the edge case where the row update
  // landed but the navigation effect never fired, e.g. due to crash).
  useEffect(() => {
    if (bootstrappedRef.current) return;
    if (setLogsData === undefined) return; // still loading
    bootstrappedRef.current = true;
    const next = computeNextSetIndex(setLogsData);
    if (next === null) {
      // All three slots filled. Re-running completeSession is a no-op when
      // status !== 'in_progress' (see accessors/session.completeSession).
      if (session?.id) {
        void completeSession(db, session.id).then(() => {
          setPhase('complete');
        });
      }
      return;
    }
    setSetIndex(next);
  }, [setLogsData, session?.id, db]);

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

  const { onLogWorkingSet, onSaveAmrap } = useLogWorkingSets({
    sessionId: session?.id ?? null,
    setIndex,
    prescribedWeight,
    prescribedReps,
    setLastLogged,
    setSetIndex,
    setPhase,
  });

  const onOpenAmrapSheet = useCallback(() => {
    setPhase('amrap-log');
  }, []);

  const onCancelAmrapSheet = useCallback(() => {
    setPhase('set');
  }, []);

  const onAdvanceFromRest = useCallback(() => {
    // setIndex was already advanced inside onLogWorkingSet (synchronously
    // for UI snappiness). The terminal set transitions straight to
    // 'complete' from there, so by the time the rest phase advances we
    // are always heading back to a 'set' surface.
    setPhase('set');
  }, []);

  const { disarm: disarmCancel, arm: armCancel } = cancelConfirm;

  const onRequestCancel = useCallback(() => {
    phaseBeforeCancelRef.current = phase;
    disarmCancel();
    setPhase('cancel-confirm');
  }, [phase, disarmCancel]);

  const onDismissCancelSheet = useCallback(() => {
    disarmCancel();
    setPhase(phaseBeforeCancelRef.current);
  }, [disarmCancel]);

  // First tap on the destructive button — arm the confirm and fire the warning
  // haptic via useCancelConfirm. The second tap is what actually destroys.
  const onConfirmCancelFirstTap = useCallback(() => {
    armCancel();
  }, [armCancel]);

  const onConfirmCancelSecondTap = useCallback(async () => {
    if (!session?.id) return;
    try {
      await cancelSession(db, session.id);
      await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      setPhase('complete');
    } catch (err) {
      console.error('useLiveScreenState.onConfirmCancelSecondTap failed', err);
    }
  }, [db, queryClient, session?.id]);

  return {
    phase,
    setIndex,
    restRemaining: restTimer.remaining,
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
    onAdvanceFromRest,
    onAddRest: restTimer.addTime,
    onSubRest: restTimer.subtractTime,
    onRequestCancel,
    onConfirmCancelFirstTap,
    onConfirmCancelSecondTap,
    onDismissCancelSheet,
    cancelArmed: cancelConfirm.armed,
  };
}
