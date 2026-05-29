import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getSession } from '../accessors/session';

export const SESSION_KEY = (id: number | null) => ['session', id] as const;

export function useSession(sessionId: number | null) {
  const db = useDb();
  return useQuery({
    queryKey: SESSION_KEY(sessionId),
    queryFn: () => {
      if (sessionId == null) return Promise.resolve(null);
      return getSession(db, sessionId);
    },
    enabled: sessionId != null,
  });
}
