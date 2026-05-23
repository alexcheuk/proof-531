/**
 * `useSession(id)` — TanStack Query hook for a single session row.
 *
 * When `sessionId` is null the query is disabled — callers can pass `null`
 * while a session id is still being resolved without conditionally calling
 * the hook (avoids React's rules-of-hooks).
 */
import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getSession } from '../accessors/session';

export const SESSION_KEY = (id: number | null) => ['session', id] as const;

export function useSession(sessionId: number | null) {
  const db = useDb();
  return useQuery({
    queryKey: SESSION_KEY(sessionId),
    queryFn: () => {
      if (sessionId == null) return Promise.resolve(undefined);
      return getSession(db, sessionId);
    },
    enabled: sessionId != null,
  });
}
