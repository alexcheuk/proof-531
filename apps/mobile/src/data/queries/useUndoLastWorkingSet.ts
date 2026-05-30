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
