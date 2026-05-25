import { useDb } from '@/data/DbProvider';
import { completeSession } from '@/data/accessors/session';
import { appendSetLog } from '@/data/accessors/setLog';
import { PRS_KEY } from '@/data/queries/usePrs';
import { SESSION_PR_IDS_KEY } from '@/data/queries/useSessionPrIds';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import { SET_LOGS_FOR_SESSION_KEY } from '@/data/queries/useSetLogsForSession';
import { estimateOneRm } from '@/domain/epley';
import type { WorkingSetIndex } from '@/domain/schemes';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { clearRestSnapshot, setRestSnapshot } from '../sessionRuntime';
import type { LastLoggedSet, LivePhase } from './useLiveScreenState';

/**
 * Owns the two persistence callbacks fired by the Live screen's CTA:
 *
 *   - `onLogWorkingSet()` — append a `working` set log, advance the local
 *     setIndex, transition to `'rest'` (or `'complete'` on the last set
 *     of a deload week).
 *   - `onSaveAmrap(reps)` — append an `amrap` set log, snapshot the
 *     estimated 1RM for RestPhase, invalidate the PR-bearing query
 *     surface, and transition to `'complete'`.
 *
 * Side effects are bundled here so the screen-state hook stays focused
 * on phase + index machinery and so the persistence contract can be
 * tested in isolation.
 */
export type UseLogWorkingSetsOptions = {
  sessionId: number | null;
  setIndex: WorkingSetIndex;
  prescribedWeight: number;
  prescribedReps: number;
  /**
   * Configured rest target in seconds — stamped into the runtime snapshot
   * so a remount during rest can restore the running countdown. Defaults
   * to the production constant when omitted (tests don't care about the
   * absolute value, only that the snapshot exists).
   */
  restSeconds?: number;
  setLastLogged: (snapshot: LastLoggedSet) => void;
  setSetIndex: (next: WorkingSetIndex) => void;
  setPhase: (next: LivePhase) => void;
};

export type UseLogWorkingSetsResult = {
  onLogWorkingSet: () => Promise<void>;
  onSaveAmrap: (reps: number) => Promise<void>;
};

export function useLogWorkingSets({
  sessionId,
  setIndex,
  prescribedWeight,
  prescribedReps,
  restSeconds = 180,
  setLastLogged,
  setSetIndex,
  setPhase,
}: UseLogWorkingSetsOptions): UseLogWorkingSetsResult {
  const db = useDb();
  const queryClient = useQueryClient();

  const onLogWorkingSet = useCallback(async () => {
    if (sessionId == null) return;
    const loggedIndex = setIndex;
    try {
      await appendSetLog(db, {
        sessionId,
        index: loggedIndex,
        kind: 'working',
        prescribedWeight,
        prescribedReps,
        actualReps: prescribedReps,
      });
      await queryClient.invalidateQueries({ queryKey: SET_LOGS_FOR_SESSION_KEY(sessionId) });
      const snapshot: LastLoggedSet = {
        weight: prescribedWeight,
        reps: prescribedReps,
        estimated1RM: undefined,
        isAmrap: false,
      };
      setLastLogged(snapshot);
      // Terminal on the deload week (no AMRAP at index 2); AMRAP weeks come
      // in through `onSaveAmrap`.
      if (loggedIndex === 2) {
        clearRestSnapshot(sessionId);
        await completeSession(db, sessionId);
        await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
        setPhase('complete');
        return;
      }
      // Advance setIndex locally — the query refetch above will eventually
      // confirm the same value, but local advance keeps the transition
      // synchronous and the UI in step with the user's tap.
      setSetIndex((loggedIndex + 1) as WorkingSetIndex);
      // Persist a rest snapshot so navigating away from /session/live during
      // rest can restore the running timer on remount.
      setRestSnapshot({
        sessionId,
        endsAtMs: Date.now() + restSeconds * 1000,
        lastLogged: snapshot,
      });
      setPhase('rest');
    } catch (err) {
      console.error('useLogWorkingSets.onLogWorkingSet failed', err);
    }
  }, [
    db,
    prescribedReps,
    prescribedWeight,
    queryClient,
    restSeconds,
    sessionId,
    setIndex,
    setLastLogged,
    setPhase,
    setSetIndex,
  ]);

  const onSaveAmrap = useCallback(
    async (reps: number) => {
      if (sessionId == null) return;
      const loggedIndex = setIndex;
      try {
        const inserted = await appendSetLog(db, {
          sessionId,
          index: loggedIndex,
          kind: 'amrap',
          prescribedWeight,
          prescribedReps,
          actualReps: reps,
        });
        await invalidatePostAmrap(queryClient, sessionId);
        setLastLogged({
          weight: prescribedWeight,
          reps,
          estimated1RM: estimateOneRm(prescribedWeight, reps),
          isAmrap: true,
        });
        clearRestSnapshot(sessionId);
        await completeSession(db, sessionId);
        await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
        // After AMRAP, stop on the PR celebration screen if this AMRAP
        // set a new record (Discord 1508314178257948682), otherwise drop
        // straight on the BBB prompt (Discord 1508265973554348032). The
        // celebration screen's CTA routes onward to /session/bbb so
        // the user always sees BBB before the receipt.
        setPhase(inserted.isPR ? 'pr-celebration' : 'awaiting-bbb');
      } catch (err) {
        console.error('useLogWorkingSets.onSaveAmrap failed', err);
      }
    },
    [
      db,
      prescribedReps,
      prescribedWeight,
      queryClient,
      sessionId,
      setIndex,
      setLastLogged,
      setPhase,
    ],
  );

  return { onLogWorkingSet, onSaveAmrap };
}

/**
 * AMRAP can flip the PR table (and therefore the History tab's PR-marker
 * query). Invalidate set-logs + both PR-shaped caches so a navigation to
 * History after a PR-setting session paints fresh.
 */
async function invalidatePostAmrap(queryClient: QueryClient, sessionId: number): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: SET_LOGS_FOR_SESSION_KEY(sessionId) }),
    queryClient.invalidateQueries({ queryKey: PRS_KEY }),
    queryClient.invalidateQueries({ queryKey: SESSION_PR_IDS_KEY }),
  ]);
}
