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

export type UseLogWorkingSetsOptions = {
  sessionId: number | null;
  setIndex: WorkingSetIndex;
  prescribedWeight: number;
  prescribedReps: number;
  restSeconds?: number;
  setLastLogged: (snapshot: LastLoggedSet) => void;
  setSetIndex: (next: WorkingSetIndex) => void;
  setPhase: (next: LivePhase) => void;
};

export type UseLogWorkingSetsResult = {
  onLogWorkingSet: () => Promise<void>;
  onSaveAmrap: (reps: number) => Promise<void>;
  onSaveTmTest: (reps: number) => Promise<void>;
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
      // Advance setIndex locally  -  the query refetch above will eventually
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
        await appendSetLog(db, {
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
        // After AMRAP, always route to BBB so the user reviews their
        // supplementary plan. PR celebration is reserved for TM-test day
        // (D4) only, where the test itself is the meaningful performance
        // moment. (Discord 1522003692159500398)
        setPhase('awaiting-bbb');
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

  const onSaveTmTest = useCallback(
    async (reps: number) => {
      if (sessionId == null) return;
      try {
        const inserted = await appendSetLog(db, {
          sessionId,
          index: 0,
          kind: 'tm-test',
          prescribedWeight,
          prescribedReps,
          actualReps: reps,
        });
        await queryClient.invalidateQueries({ queryKey: SET_LOGS_FOR_SESSION_KEY(sessionId) });
        // TM test is a single-set session  -  no rest, no celebration. Set the
        // snapshot for any chrome that reads `lastLogged` and immediately
        // complete the session.
        setLastLogged({
          weight: prescribedWeight,
          reps,
          estimated1RM: undefined,
          isAmrap: false,
        });
        clearRestSnapshot(sessionId);
        await completeSession(db, sessionId);
        await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
        // Show PR celebration when the TM-test establishes a new estimated
        // 1RM record (Discord 1522003692159500398: "only after a successful
        // TM test"). Celebration screen routes to /session/complete for
        // TM-test sessions (no BBB prompt on D4).
        setPhase(inserted.isPR ? 'pr-celebration' : 'complete');
      } catch (err) {
        console.error('useLogWorkingSets.onSaveTmTest failed', err);
      }
    },
    [db, prescribedReps, prescribedWeight, queryClient, sessionId, setLastLogged, setPhase],
  );

  return { onLogWorkingSet, onSaveAmrap, onSaveTmTest };
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
