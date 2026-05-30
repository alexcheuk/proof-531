import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getSessionIdsWithPrs } from '../accessors/setLog';

export const SESSION_PR_IDS_KEY = ['sessionPrIds'] as const;

export function useSessionPrIds() {
  const db = useDb();
  return useQuery({
    queryKey: SESSION_PR_IDS_KEY,
    queryFn: async () => {
      const ids = await getSessionIdsWithPrs(db);
      return new Set(ids);
    },
  });
}
