import { useDb } from '@/data/DbProvider';
import { cancelSession, completeSession } from '@/data/accessors/session';
import { appendSetLog } from '@/data/accessors/setLog';
import { useSession } from '@/data/queries/useSession';
import {
  SET_LOGS_FOR_SESSION_KEY,
  useSetLogsForSession,
} from '@/data/queries/useSetLogsForSession';
import { estimateOneRm } from '@/domain/epley';
import {
  type WorkingSetIndex,
  bbbPlanRows,
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

export type LivePhase =
  | 'prep'
  | 'set'
  | 'amrap-log'
  | 'working-set-log'
  | 'rest'
  | 'bbb-confirm'
  | 'complete'
  | 'cancel-confirm';

/** Default rest duration in seconds. */
export const REST_SECONDS = 90;
/** Seconds-remaining at which the warning haptic fires. */
export const WARNING_THRESHOLD = 3;
/** Seconds-remaining at which the T-10s "selection" haptic fires. */
export const TEN_SECOND_THRESHOLD = 10;
/** Hard ceiling on the rest timer when adding +30s — prevents runaway timers. */
export const REST_CEILING_SECONDS = 600;

export type UseLiveScreenStateOptions = {
  /** Defaults to REST_SECONDS — overridable so tests can assert on a shorter timeline. */
  restSeconds?: number;
  /**
   * Fires the warning haptic when the rest timer reaches T-3s.
   * Defaults to expo-haptics' `notificationAsync(Warning)` — injectable for tests.
   */
  fireWarningHaptic?: () => void;
  /**
   * Fires the selection haptic at T-10s (heads-up).
   * Defaults to expo-haptics' `selectionAsync()` — injectable for tests.
   */
  fireSelectionHaptic?: () => void;
  /**
   * Fires the light-impact haptic at T-0 (rest finished).
   * Defaults to expo-haptics' `impactAsync(Light)` — injectable for tests.
   */
  fireImpactHaptic?: () => void;
  /** BBB working percentage (defaults to 0.5). Surfaced for the BBB confirm phase. */
  bbbPct?: number;
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
  /** W2.2 — skip the rest immediately (forces `restRemaining` to 0). */
  onSkipRest: () => void;
  /** W2.2 — add 30 seconds to the rest, capped at REST_CEILING_SECONDS. */
  onAddRest: () => void;
  /** W2.4 — log the 5 BBB rows then transition to `complete`. */
  onConfirmBbb: () => Promise<void>;
  /** W2.4 — skip BBB and transition to `complete` without writing. */
  onSkipBbb: () => Promise<void>;
  /** W2.4 — surfaced storage-unit weight for BBB confirm + LOGGED↔NEXT band wiring. */
  bbbPrescribedWeight: number;
  /**
   * W2.5 — request cancel with the count of working+amrap rows already logged.
   * Branch A (zero working) triggers immediate cancel + `router.replace('/')` at
   * the screen layer; the hook just exposes the count so the caller can decide.
   */
  loggedWorkingCount: number;
  /** W2.5 — immediate cancel (Branch A). Resolves to `phase === 'complete'`. */
  onImmediateCancel: () => Promise<void>;
  /**
   * W2.1 fixup — true while the rest currently in progress follows the
   * terminal main-work set (working idx 2 deload OR AMRAP on weeks 1–3).
   * Surfaced so the screen layer can override the NEXT SET band with the
   * BBB summary instead of re-showing the just-completed prescription.
   * Reset on the next non-terminal log / phase transition out of the
   * post-terminal rest cycle.
   */
  postTerminalRest: boolean;
  /**
   * W3-E — phase the user was on when the cancel sheet was opened. Used by
   * the screen layer to render the correct underlying surface beneath the
   * sheet (so e.g. opening cancel from `bbb-confirm` keeps the BBB surface
   * visible behind the backdrop rather than falling through to `set`).
   * Mirrors the internal `phaseBeforeCancelRef` value; only meaningful while
   * `phase === 'cancel-confirm'`.
   */
  phaseBeforeCancel: LivePhase;
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

function defaultFireSelectionHaptic() {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic require for graceful degradation
    const Haptics = require('expo-haptics') as any;
    Haptics.selectionAsync?.();
  } catch (err) {
    console.warn('useLiveScreenState: selection haptic unavailable', err);
  }
}

function defaultFireImpactHaptic() {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic require for graceful degradation
    const Haptics = require('expo-haptics') as any;
    Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light ?? 'light');
  } catch (err) {
    console.warn('useLiveScreenState: impact haptic unavailable', err);
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
  const fireSelectionHaptic = options.fireSelectionHaptic ?? defaultFireSelectionHaptic;
  const fireImpactHaptic = options.fireImpactHaptic ?? defaultFireImpactHaptic;
  const bbbPct = options.bbbPct ?? 0.5;

  const sessionQuery = useSession(sessionId);
  const session = sessionQuery.data;

  // setLogs is the source of truth for which working/AMRAP indices have been
  // recorded for this session. On first load we use it to bootstrap setIndex
  // so a user who backs out of Live and resumes lands on the correct set.
  const setLogsQuery = useSetLogsForSession(sessionId);
  const setLogsData = setLogsQuery.data;

  const [phase, setPhase] = useState<LivePhase>('set');
  const [setIndex, setSetIndex] = useState<WorkingSetIndex>(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [cancelArmed, setCancelArmed] = useState(false);
  const [lastLogged, setLastLogged] = useState<LastLoggedSet | null>(null);
  // True when the rest currently in progress follows the terminal main-work
  // set (working set 2 on a deload week, or AMRAP on weeks 1–3). Drives the
  // BBB fork in `onAdvanceFromRest` (W2.4). Reset on each new rest cycle.
  const [postTerminalRest, setPostTerminalRest] = useState(false);
  // Bootstrap-once gate: keeps the first non-undefined setLogs read from
  // overwriting subsequent local advances (after we manually setSetIndex on
  // log-and-advance, the query refetches and arrives with one MORE row,
  // which would otherwise re-derive the same setIndex value and cause a
  // benign re-render — guard so the read only happens once per session).
  const bootstrappedRef = useRef(false);
  // The phase to return to when the cancel sheet is dismissed. Captured at
  // open time so the cancel flow doesn't disturb the underlying state. W3-E
  // promotes this from a ref to state so the screen layer can read it
  // synchronously during render to pick the right underlying surface (the
  // BBB surface stays visible behind the cancel sheet when triggered from
  // `bbb-confirm`, rather than falling through to the `set` surface).
  const [phaseBeforeCancel, setPhaseBeforeCancel] = useState<LivePhase>('set');
  // Track whether the warning threshold has already fired in the current rest
  // cycle so we don't double-trigger on re-renders or imprecise tick alignment.
  const warningFiredRef = useRef(false);
  // Same once-per-cycle gates for the T-10s heads-up haptic and the T-0 light
  // impact haptic. All three reset together when a new rest cycle starts.
  const tenSecondFiredRef = useRef(false);
  const zeroFiredRef = useRef(false);

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

  // Rest-timer driver. Runs only when phase === 'rest'. Lets `remaining`
  // go negative past T-0 so the count-down label in RestTimer keeps ticking
  // past the configured target — rest is free-form per the PWA reference.
  useEffect(() => {
    if (phase !== 'rest') return;
    warningFiredRef.current = false;
    tenSecondFiredRef.current = false;
    zeroFiredRef.current = false;
    setRestRemaining(restSeconds);
    const id = setInterval(() => {
      setRestRemaining((prev) => prev - 1);
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
  //
  // Three rungs on the haptic ladder (W2.2):
  //   T-10s  → selection haptic (heads-up).
  //   T-3s   → warning haptic   (warning).
  //   T-0s   → light impact     (the moment).
  useEffect(() => {
    if (phase !== 'rest') return;
    if (restRemaining === TEN_SECOND_THRESHOLD && !tenSecondFiredRef.current) {
      tenSecondFiredRef.current = true;
      fireSelectionHaptic();
    }
    if (restRemaining === WARNING_THRESHOLD && !warningFiredRef.current) {
      warningFiredRef.current = true;
      fireWarningHaptic();
    }
    if (restRemaining === 0 && !zeroFiredRef.current) {
      zeroFiredRef.current = true;
      fireImpactHaptic();
    }
  }, [phase, restRemaining, fireWarningHaptic, fireSelectionHaptic, fireImpactHaptic]);

  const onLogWorkingSet = useCallback(async () => {
    if (!session?.id) return;
    const loggedIndex = setIndex; // capture pre-advance index
    try {
      await appendSetLog(db, {
        sessionId: session.id,
        index: loggedIndex,
        kind: 'working',
        prescribedWeight,
        prescribedReps,
        actualReps: prescribedReps,
      });
      // Invalidate the per-session set-logs cache so Today's "Resume working
      // set N" CTA / SessionComplete's receipt see the new row immediately.
      await queryClient.invalidateQueries({
        queryKey: SET_LOGS_FOR_SESSION_KEY(session.id),
      });
      // Snapshot the just-logged set for RestPhase. Non-AMRAP working sets
      // don't carry an estimated 1RM (matches the PWA's `isAmrap` gate on
      // the RestPhase est-1RM column).
      setLastLogged({
        weight: prescribedWeight,
        reps: prescribedReps,
        estimated1RM: undefined,
        isAmrap: false,
      });
      // Terminal on the deload week (no AMRAP at index 2); AMRAP weeks
      // come in through onSaveAmrap. W2.4: route through `rest` so the
      // user can hit "Complete session" and we fork into `bbb-confirm`.
      if (loggedIndex === 2) {
        setPostTerminalRest(true);
        setPhase('rest');
        return;
      }
      // Advance setIndex locally — the query refetch above will eventually
      // confirm the same value, but local advance keeps the transition
      // synchronous and the UI in step with the user's tap.
      setSetIndex((loggedIndex + 1) as WorkingSetIndex);
      setPostTerminalRest(false);
      setPhase('rest');
    } catch (err) {
      console.error('useLiveScreenState.onLogWorkingSet failed', err);
    }
  }, [db, prescribedReps, prescribedWeight, queryClient, session?.id, setIndex]);

  const onOpenAmrapSheet = useCallback(() => {
    setPhase('amrap-log');
  }, []);

  const onCancelAmrapSheet = useCallback(() => {
    setPhase('set');
  }, []);

  const onSaveAmrap = useCallback(
    async (reps: number) => {
      if (!session?.id) return;
      const loggedIndex = setIndex;
      try {
        await appendSetLog(db, {
          sessionId: session.id,
          index: loggedIndex,
          kind: 'amrap',
          prescribedWeight,
          prescribedReps,
          actualReps: reps,
        });
        await queryClient.invalidateQueries({
          queryKey: SET_LOGS_FOR_SESSION_KEY(session.id),
        });
        // Snapshot the just-logged AMRAP for RestPhase (even though AMRAP
        // is terminal, the snapshot keeps the contract consistent and lets
        // future flows reuse it without branching).
        setLastLogged({
          weight: prescribedWeight,
          reps,
          estimated1RM: estimateOneRm(prescribedWeight, reps),
          isAmrap: true,
        });
        // AMRAP is always terminal. W2.4: route through `rest` so the user
        // can hit "Complete session" and we fork into `bbb-confirm`.
        setPostTerminalRest(true);
        setPhase('rest');
      } catch (err) {
        console.error('useLiveScreenState.onSaveAmrap failed', err);
      }
    },
    [db, prescribedReps, prescribedWeight, queryClient, session?.id, setIndex],
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
  // Advances `setIndex` locally on non-terminal sets to match main's
  // log-and-advance idiom in `onLogWorkingSet`.
  const onLogWorkingSetWithActual = useCallback(
    async (reps: number) => {
      if (!session?.id) return;
      const loggedIndex = setIndex;
      try {
        await appendSetLog(db, {
          sessionId: session.id,
          index: loggedIndex,
          kind: 'working',
          prescribedWeight,
          prescribedReps,
          actualReps: reps,
        });
        await queryClient.invalidateQueries({
          queryKey: SET_LOGS_FOR_SESSION_KEY(session.id),
        });
        setLastLogged({
          weight: prescribedWeight,
          reps,
          estimated1RM: undefined,
          isAmrap: false,
        });
        if (loggedIndex === 2) {
          // W2.4: route through `rest` then bbb-confirm fork.
          setPostTerminalRest(true);
          setPhase('rest');
          return;
        }
        setSetIndex((loggedIndex + 1) as WorkingSetIndex);
        setPostTerminalRest(false);
        setPhase('rest');
      } catch (err) {
        console.error('useLiveScreenState.onLogWorkingSetWithActual failed', err);
      }
    },
    [db, prescribedReps, prescribedWeight, queryClient, session?.id, setIndex],
  );

  const onAdvanceFromRest = useCallback(() => {
    // W2.4: when the just-finished rest follows the terminal main-work set
    // (working idx 2 on deload, or AMRAP on weeks 1–3), fork into the
    // bbb-confirm phase instead of completing immediately. The bootstrap
    // self-heal path in the effect above is unchanged — it still routes
    // straight to `complete` for sessions where every slot is already
    // filled at mount, since BBB-skipped-by-absence is the intended
    // interpretation of a force-quit "all main work logged" session.
    if (postTerminalRest) {
      setPhase('bbb-confirm');
      return;
    }
    // setIndex was already advanced inside onLogWorkingSet (synchronously
    // for UI snappiness). Here we just flip the surface back to 'set' so
    // the user sees the next working set.
    if (setIndex > 2) {
      setPhase('complete');
      return;
    }
    setPhase('set');
  }, [setIndex, postTerminalRest]);

  // W2.2 — skip the rest immediately. Force `restRemaining` to 0 which
  // triggers the T-0 light-impact haptic via the effect bus and lets the
  // CTA's breathe pulse start (the screen-layer wrapper watches the same
  // value). No confirm — skipping is benign.
  const onSkipRest = useCallback(() => {
    if (phase !== 'rest') return;
    setRestRemaining(0);
  }, [phase]);

  // W2.2 — add 30 seconds to the rest. Capped at REST_CEILING_SECONDS to
  // prevent runaway timers. Resets `warningFiredRef` / `zeroFiredRef` so a
  // re-entry through T-3s / T-0 still fires the haptic exactly once.
  const onAddRest = useCallback(() => {
    if (phase !== 'rest') return;
    setRestRemaining((prev) => {
      const next = prev + 30;
      if (next > REST_CEILING_SECONDS) {
        fireWarningHaptic();
        return prev;
      }
      // Pushing the timer past T-3s / T-0 means the next pass should re-fire
      // those haptics. T-10s is allowed to skip — it's a heads-up, not a
      // payoff, and re-firing it on every +30s tap would be noisy.
      if (next > WARNING_THRESHOLD) warningFiredRef.current = false;
      if (next > 0) zeroFiredRef.current = false;
      return next;
    });
  }, [phase, fireWarningHaptic]);

  // W2.4 — BBB confirm: write 5 BBB rows then transition to complete.
  // Partial-write failures are logged but the transition still happens (per
  // spec error-state policy: BBB rows that wrote, wrote; the session still
  // closes). The 5-row batch invalidates the typed per-session cache key
  // exactly once at the end.
  const onConfirmBbb = useCallback(async () => {
    if (!session?.id) return;
    const tmStorage = session.trainingMaxSnapshot;
    const rows = bbbPlanRows(session.id, tmStorage, storageUnit, bbbPct);
    const settled = await Promise.allSettled(rows.map((row) => appendSetLog(db, row)));
    const failedIndices = settled
      .map((r, i) => (r.status === 'rejected' ? (rows[i]?.index ?? -1) : null))
      .filter((i): i is number => i !== null);
    if (failedIndices.length > 0) {
      console.warn(
        'useLiveScreenState.onConfirmBbb: partial BBB write failed at indices',
        failedIndices,
      );
    }
    try {
      await queryClient.invalidateQueries({
        queryKey: SET_LOGS_FOR_SESSION_KEY(session.id),
      });
      await completeSession(db, session.id);
      setPhase('complete');
    } catch (err) {
      console.error('useLiveScreenState.onConfirmBbb post-write failed', err);
      // Best-effort: still try to transition so the user is not stranded.
      setPhase('complete');
    }
  }, [db, queryClient, session?.id, session?.trainingMaxSnapshot, storageUnit, bbbPct]);

  // W2.4 — skip BBB: no writes, just complete the session.
  const onSkipBbb = useCallback(async () => {
    if (!session?.id) return;
    try {
      await completeSession(db, session.id);
      setPhase('complete');
    } catch (err) {
      console.error('useLiveScreenState.onSkipBbb failed', err);
      setPhase('complete');
    }
  }, [db, session?.id]);

  // W2.5 — immediate cancel (Branch A: zero working sets logged). No confirm
  // sheet, no haptic noise. Caller (LiveScreen) does the route-replace.
  const onImmediateCancel = useCallback(async () => {
    if (!session?.id) return;
    try {
      await cancelSession(db, session.id);
      setPhase('complete');
    } catch (err) {
      console.error('useLiveScreenState.onImmediateCancel failed', err);
    }
  }, [db, session?.id]);

  const onRequestCancel = useCallback(() => {
    setPhaseBeforeCancel(phase);
    setCancelArmed(false);
    setPhase('cancel-confirm');
  }, [phase]);

  const onDismissCancelSheet = useCallback(() => {
    setCancelArmed(false);
    setPhase(phaseBeforeCancel);
  }, [phaseBeforeCancel]);

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

  // W2.4 BBB weight snapped to storage step — used both by the BBB confirm
  // surface (for the headline copy) and by the rest-phase NEXT band when the
  // user is on the post-terminal rest (the next "set" is the BBB plan, not
  // an out-of-range main-work row).
  const bbbPrescribedWeight = session
    ? snapWeight(session.trainingMaxSnapshot * bbbPct, storageUnit)
    : 0;

  // W2.5 — count of working/amrap rows already persisted for this session.
  // Drives the cancel branching (immediate vs. confirm sheet) at the screen
  // layer. Reads from the same `setLogsData` the bootstrap effect already
  // consumes, so no extra query is needed.
  const loggedWorkingCount = (setLogsData ?? []).filter(
    (l) => l.kind === 'working' || l.kind === 'amrap',
  ).length;

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
    onSkipRest,
    onAddRest,
    onConfirmBbb,
    onSkipBbb,
    bbbPrescribedWeight,
    loggedWorkingCount,
    onImmediateCancel,
    postTerminalRest,
    phaseBeforeCancel,
  };
}
