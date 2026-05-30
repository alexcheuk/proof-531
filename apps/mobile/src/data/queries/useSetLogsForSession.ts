import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getSetLogsForSession } from '../accessors/setLog';

export const SET_LOGS_FOR_SESSION_KEY = (id: number | null) => ['setLogsForSession', id] as const;

export function useSetLogsForSession(sessionId: number | null) {
  const db = useDb();
  return useQuery({
    queryKey: SET_LOGS_FOR_SESSION_KEY(sessionId),
    queryFn: () => {
      if (sessionId == null) return Promise.resolve([]);
      return getSetLogsForSession(db, sessionId);
    },
    enabled: sessionId != null,
  });
}
