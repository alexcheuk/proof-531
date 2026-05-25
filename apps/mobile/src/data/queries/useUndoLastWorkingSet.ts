/**
 * `useUndoLastWorkingSet()` — returns a callable that rolls back the most
 * recent `working` set log for a given session.
 *
 * Wraps the `undoLastWorkingSet` accessor and invalidates the set-logs +
 * sessions query keys on success so any surface that derives from the
 * persisted log set (Today's "Resume working set N" CTA, the receipt) re-
 * paints. Returns the deleted row so the Live screen can roll back its
 * local state machine (setIndex, phase, lastLogged) without a re-query.
 *
 * AMRAP rows are NOT undoable in this iteration (the accessor returns null
 * in that case). The caller already hides the affordance during the
 * rest-after-AMRAP transition, so this is defense in depth.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDb } from '../DbProvider';
import { type SetLog, undoLastWorkingSet } from '../accessors/setLog';
import { SESSIONS_KEY } from './useSessions';
import { SET_LOGS_FOR_SESSION_KEY } from './useSetLogsForSession';

export function useUndoLastWorkingSet() {
  const db = useDb();
  const queryClient = useQueryClient();
  return useCallback(
    async (sessionId: number): Promise<SetLog | null> => {
      const removed = await undoLastWorkingSet(db, sessionId);
      if (removed) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: SET_LOGS_FOR_SESSION_KEY(sessionId) }),
          queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
        ]);
      }
      return removed;
    },
    [db, queryClient],
  );
}
