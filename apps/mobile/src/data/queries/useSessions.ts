import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getSessions } from '../accessors/session';

export const SESSIONS_KEY = ['sessions'] as const;

export function useSessions() {
  const db = useDb();
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => getSessions(db),
  });
}
