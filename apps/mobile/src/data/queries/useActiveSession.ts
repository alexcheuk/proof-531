import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getActiveSession } from '../accessors/session';

export const ACTIVE_SESSION_KEY = ['activeSession'] as const;

export function useActiveSession() {
  const db = useDb();
  return useQuery({
    queryKey: ACTIVE_SESSION_KEY,
    queryFn: () => getActiveSession(db),
  });
}
