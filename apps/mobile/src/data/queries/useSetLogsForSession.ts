/**
 * `useSetLogsForSession(id)` — TanStack Query hook returning every set_logs
 * row for a single session, in insertion order.
 *
 * When `sessionId` is null the query is disabled — callers can pass `null`
 * while a session id is still being resolved without conditionally calling
 * the hook (avoids React's rules-of-hooks).
 *
 * Mirrors the PWA's per-session `useLiveQuery` on `db.setLogs.where('sessionId')`.
 */
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
