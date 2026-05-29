import { useDb } from '@/data/DbProvider';
import { completeSession, resetSession } from '@/data/accessors/session';
import { useSession } from '@/data/queries/useSession';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import { useSetLogsForSession } from '@/data/queries/useSetLogsForSession';
import { useUndoLastWorkingSet } from '@/data/queries/useUndoLastWorkingSet';
import {
  type WorkingSetIndex,
  getWorkingSetByIndex,
  isAmrapSet,
  isTmTestSet,
  nextWorkingSetIndex,
} from '@/domain/schemes';
import { round as snapWeight } from '@/domain/units';
/**
 * Live screen state machine + rest-timer driver.
 *
 * `setIndex` is bootstrapped from persisted `set_logs` rows so back-nav + resume
 * picks up where the user left off. The index then advances via local state for
 * phase transitions (set → rest → set); queries are invalidated so the receipt
 * and Today's "resume" CTA stay in sync.
 *
 * Rest duration defaults to `REST_SECONDS` (180 s, configurable in Settings).
 * The T-3s warning haptic fires deterministically off the countdown and is
 * assert-able by advancing fake timers in tests.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clearRestSnapshot, readRestSnapshot } from '../sessionRuntime';
import { useCancelConfirm } from './useCancelConfirm';
import { useLogWorkingSets } from './useLogWorkingSets';
import { useRestTimer } from './useRestTimer';

export type LivePhase =
  | 'set'
  | 'amrap-log'
  | 'tm-test-log'
  | 'rest'
  | 'pr-celebration'
  | 'awaiting-bbb'
  | 'complete'
  | 'reset-confirm';

/**
 * Default rest duration in seconds.
 *
 * Set at **180s (3 minutes)** as a middle ground for 5/3/1 working sets.
 * Wendler's "Beyond 5/3/1" recommends 2-3 minutes between the 5s / 3s sets
 * and 4-5 minutes before the heavy top set; the BBB 5×10 supplementary work
 * typically uses 60-90 seconds. Users who run the program with shorter rest
 * can adjust in Settings.
 *
 * History: previously 90s (PWA carry-over) — too short for the heavy top
 * set per user feedback 2026-05-24.
 */
const REST_SECONDS = 180;
/** Seconds-remaining at which the warning haptic fires. */
const WARNING_THRESHOLD = 3;
/**
 * How long a destructive confirm button stays armed before silently
 * disarming itself. Prevents the footgun where a user taps once
 * accidentally, looks away, and the second tap an hour later destroys
 * the session. Used by the Restart confirm flow.
 */
const CANCEL_ARM_TIMEOUT_MS = 8000;

export type UseLiveScreenStateOptions = {
  /** Defaults to REST_SECONDS — overridable so tests can assert on a shorter timeline. */
  restSeconds?: number;
  /**
   * Fires the warning haptic when the rest timer reaches T-3s.
   * Defaults to expo-haptics' `notificationAsync(Warning)` — injectable for tests.
   */
  fireWarningHaptic?: () => void;
  /**
   * Fires the "rest done" alarm the moment the timer crosses 0 — alarm
   * vibration pattern + foreground sound notification so the user doesn't
   * need to watch the screen.
   * Defaults to `defaultFireDoneAlarm`; injectable for tests.
   */
  fireDoneHaptic?: () => void;
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
  /** Read the live rest deadline (ms, or null) — consumed by the notification layer. */
  getRestDeadlineMs: () => number | null;
  /** Re-anchor the rest countdown to a deadline copied back from the notification. */
  syncRestDeadline: (endsAtMs: number) => void;
  /** Snapshot of the most recently logged set. Cleared between sessions; null until the first log of this session. */
  lastLogged: LastLoggedSet | null;
  /** True if the current working set is the AMRAP top set. */
  isAmrap: boolean;
  /** True if the current set is the Week-4 TM Test set. */
  isTmTest: boolean;
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
  /** Open the TM Test rep-entry sheet (Week-4 sessions only). */
  onOpenTmTestSheet: () => void;
  /** Persist the TM Test reps (Week-4 sessions only). */
  onSaveTmTest: (reps: number) => Promise<void>;
  /** Dismiss the TM Test sheet without saving. */
  onCancelTmTestSheet: () => void;
  onAdvanceFromRest: () => void;
  /**
   * Roll back the most recent `working` set log for this session and return
   * to the `'set'` surface. No-op outside `'rest'` or when the most recent
   * row is not a `working` set (e.g. AMRAP). Best-effort: failures are
   * swallowed so the UI never enters an undefined state.
   */
  onUndoLastSet: () => Promise<void>;
  /** Open the Restart-session confirm sheet. */
  onRequestReset: () => void;
  onConfirmResetFirstTap: () => void;
  onConfirmResetSecondTap: () => Promise<void>;
  onDismissResetSheet: () => void;
  /** True once the user has tapped the destructive Restart button once. */
  resetArmed: boolean;
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

type RestChronometerModule = typeof import('@/lib/restChronometer');

function defaultFireDoneAlarm() {
  try {
    const RN = require('react-native') as typeof import('react-native');
    // biome-ignore lint/suspicious/noExplicitAny: dynamic require for graceful degradation
    const Haptics = require('expo-haptics') as any;

    if (RN.Platform.OS === 'android') {
      // Triple-pulse alarm vibration: [delay, on, pause, on, pause, on] in ms.
      RN.Vibration.vibrate([0, 400, 150, 400, 150, 400]);
      // When foregrounded, no trigger notification was scheduled — fire an
      // immediate sound alert on the high-importance rest-done channel.
      if (RN.AppState.currentState === 'active') {
        const restChronometer = require('@/lib/restChronometer') as RestChronometerModule;
        void restChronometer.fireRestDoneAlarmForeground();
      }
    } else {
      // iOS: NotificationFeedbackType.Error is a naturally multi-pulse ("alarm")
      // haptic — stronger and more urgent than Success. expo-notifications'
      // scheduled notification handles the sound; this gives the physical cue.
      Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Error ?? 'error');
    }
  } catch (err) {
    console.warn('useLiveScreenState: done alarm unavailable', err);
  }
}

function computeNextSetIndex(
  logs: ReadonlyArray<{ kind: string; index: number }> | undefined,
  week: 1 | 2 | 3 | 4,
): WorkingSetIndex | null {
  if (!logs) return 0;
  const completed = logs
    .filter((l) => l.kind === 'working' || l.kind === 'amrap' || l.kind === 'tm-test')
    .map((l) => l.index)
    .filter((i): i is WorkingSetIndex => i === 0 || i === 1 || i === 2);
  return nextWorkingSetIndex(Array.from(new Set(completed)), week);
}

export function useLiveScreenState(
  sessionId: number | null,
  options: UseLiveScreenStateOptions = {},
): UseLiveScreenStateResult {
  const db = useDb();
  const queryClient = useQueryClient();
  const restSeconds = options.restSeconds ?? REST_SECONDS;
  const fireWarningHaptic = options.fireWarningHaptic ?? defaultFireWarningHaptic;
  const fireDoneHaptic = options.fireDoneHaptic ?? defaultFireDoneAlarm;

  const sessionQuery = useSession(sessionId);
  const session = sessionQuery.data;

  // setLogs is the source of truth for which working/AMRAP indices have been
  // recorded for this session. On first load we use it to bootstrap setIndex
  // so a user who backs out of Live and resumes lands on the correct set.
  const setLogsQuery = useSetLogsForSession(sessionId);
  const setLogsData = setLogsQuery.data;

  // Read any persisted rest snapshot once on mount so we can seed phase /
  // lastLogged / timer-remaining synchronously and avoid a flicker of the
  // set surface before the bootstrap effect runs.
  const initialSnapshotRef = useRef(sessionId != null ? readRestSnapshot(sessionId) : null);
  const initialSnapshot = initialSnapshotRef.current;
  const initialRestoredRemaining = initialSnapshot
    ? Math.max(1, Math.ceil((initialSnapshot.endsAtMs - Date.now()) / 1000))
    : null;

  const [phase, setPhase] = useState<LivePhase>(initialSnapshot ? 'rest' : 'set');
  const [setIndex, setSetIndex] = useState<WorkingSetIndex>(0);
  const [lastLogged, setLastLogged] = useState<LastLoggedSet | null>(
    initialSnapshot?.lastLogged ?? null,
  );
  // Two-tap arm/disarm + auto-disarm for the destructive Reset (Restart)
  // button.
  const resetConfirm = useCancelConfirm({
    timeoutMs: CANCEL_ARM_TIMEOUT_MS,
    onArmHaptic: fireWarningHaptic,
  });
  // Bootstrap-once gate: keeps the first non-undefined setLogs read from
  // overwriting subsequent local advances (after we manually setSetIndex on
  // log-and-advance, the query refetches and arrives with one MORE row,
  // which would otherwise re-derive the same setIndex value and cause a
  // benign re-render — guard so the read only happens once per session).
  const bootstrappedRef = useRef(false);
  // The phase to return to when the Reset confirm sheet is dismissed.
  // Captured at open time so the reset flow doesn't disturb the
  // underlying state.
  const phaseBeforeResetRef = useRef<LivePhase>('set');

  // Rest-timer driver — extracted hook owns the countdown, warning latch,
  // and ±30s controls. `initialRemaining` carries the restored snapshot
  // value on first mount; null on every subsequent rest entry so the timer
  // uses the configured rest target.
  const restTimer = useRestTimer({
    active: phase === 'rest',
    seconds: restSeconds,
    initialRemaining: initialRestoredRemaining,
    warningThresholdSeconds: WARNING_THRESHOLD,
    fireWarningHaptic,
    fireDoneHaptic,
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
    const weekForCompute = (session?.week ?? 1) as 1 | 2 | 3 | 4;
    const next = computeNextSetIndex(setLogsData, weekForCompute);
    // A restored snapshot already seeded setIndex above (the set after the
    // most recent log). When restoring rest, trust the snapshot — the user
    // is mid-rest, so we don't want to bounce them back to the set surface
    // because of a race between query refetch and snapshot write.
    if (initialSnapshotRef.current && next !== null) {
      setSetIndex(next);
      return;
    }
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
  }, [setLogsData, session?.id, session?.week, db]);

  // Per-set view model — derived from the session week + current index.
  // Defaults are safe (week=1, snapshot=0) so the hook never throws while
  // the session row is still loading.
  const week = (session?.week ?? 1) as 1 | 2 | 3 | 4;
  // Week 4 has a single set at index 0 (the TM test). Clamp to 0 defensively
  // so a stale setIndex carried over from a week-1–3 session doesn't fault
  // `getWorkingSetByIndex(4, 1|2)`.
  const safeSetIndex: WorkingSetIndex = week === 4 ? 0 : setIndex;
  const workingSet = getWorkingSetByIndex(week, safeSetIndex);
  const storageUnit = session?.storageUnitSnapshot ?? 'lbs';
  const prescribedWeight = session
    ? snapWeight(session.trainingMaxSnapshot * workingSet.pct, storageUnit)
    : 0;
  const prescribedReps = workingSet.reps;
  const pct = workingSet.pct;
  const isAmrap = isAmrapSet(week, safeSetIndex);
  const isTmTest = isTmTestSet(week, safeSetIndex);

  const undoLastWorkingSet = useUndoLastWorkingSet();

  const { onLogWorkingSet, onSaveAmrap, onSaveTmTest } = useLogWorkingSets({
    sessionId: session?.id ?? null,
    setIndex,
    prescribedWeight,
    prescribedReps,
    restSeconds,
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

  const onOpenTmTestSheet = useCallback(() => {
    setPhase('tm-test-log');
  }, []);

  const onCancelTmTestSheet = useCallback(() => {
    setPhase('set');
  }, []);

  const onUndoLastSet = useCallback(async () => {
    if (phase !== 'rest') return;
    if (!session?.id) return;
    try {
      const removed = await undoLastWorkingSet(session.id);
      if (!removed) return;
      // The deleted row was the working set at `removed.index`. Restore
      // the local state machine so the user lands back on that set ready
      // to re-log it.
      const restoredIndex =
        removed.index === 0 || removed.index === 1 || removed.index === 2
          ? (removed.index as WorkingSetIndex)
          : 0;
      clearRestSnapshot(session.id);
      setSetIndex(restoredIndex);
      setLastLogged(null);
      setPhase('set');
    } catch (err) {
      console.error('useLiveScreenState.onUndoLastSet failed', err);
    }
  }, [phase, session?.id, undoLastWorkingSet]);

  const onAdvanceFromRest = useCallback(() => {
    // setIndex was already advanced inside onLogWorkingSet (synchronously
    // for UI snappiness). The terminal set transitions straight to
    // 'complete' from there, so by the time the rest phase advances we
    // are always heading back to a 'set' surface.
    if (session?.id) clearRestSnapshot(session.id);
    setPhase('set');
  }, [session?.id]);

  const { disarm: disarmReset, arm: armReset } = resetConfirm;

  const onRequestReset = useCallback(() => {
    phaseBeforeResetRef.current = phase;
    disarmReset();
    setPhase('reset-confirm');
  }, [phase, disarmReset]);

  const onDismissResetSheet = useCallback(() => {
    disarmReset();
    setPhase(phaseBeforeResetRef.current);
  }, [disarmReset]);

  const onConfirmResetFirstTap = useCallback(() => {
    armReset();
  }, [armReset]);

  const onConfirmResetSecondTap = useCallback(async () => {
    if (!session?.id) return;
    try {
      await resetSession(db, session.id);
      clearRestSnapshot(session.id);
      // Reset the local state machine: setIndex back to 0, no lastLogged,
      // phase back to 'set' so the user is dropped on set 1. Setting
      // bootstrappedRef.current=true prevents the bootstrap effect from
      // re-running and re-deriving setIndex from the now-empty setLogs
      // query (which would land on the same value but cause a
      // flash-of-stale-state during the round trip).
      bootstrappedRef.current = true;
      setSetIndex(0);
      setLastLogged(null);
      disarmReset();
      setPhase('set');
      // Refetch session row (startedAt was rewritten) + clear set_logs
      // cache for this session so the live screen, today screen, and
      // history all re-read.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['session', session.id] }),
        queryClient.invalidateQueries({ queryKey: ['setLogsForSession', session.id] }),
        queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
      ]);
    } catch (err) {
      console.error('useLiveScreenState.onConfirmResetSecondTap failed', err);
    }
  }, [db, queryClient, session?.id, disarmReset]);

  return {
    phase,
    setIndex: safeSetIndex,
    restRemaining: restTimer.remaining,
    restTarget: restSeconds,
    lastLogged,
    isAmrap,
    isTmTest,
    prescribedWeight,
    prescribedReps,
    pct,
    loaded: !!session,
    onLogWorkingSet,
    onOpenAmrapSheet,
    onSaveAmrap,
    onCancelAmrapSheet,
    onOpenTmTestSheet,
    onSaveTmTest,
    onCancelTmTestSheet,
    onAdvanceFromRest,
    onAddRest: restTimer.addTime,
    onSubRest: restTimer.subtractTime,
    getRestDeadlineMs: restTimer.getDeadlineMs,
    syncRestDeadline: restTimer.setDeadline,
    onUndoLastSet,
    onRequestReset,
    onConfirmResetFirstTap,
    onConfirmResetSecondTap,
    onDismissResetSheet,
    resetArmed: resetConfirm.armed,
  };
}
