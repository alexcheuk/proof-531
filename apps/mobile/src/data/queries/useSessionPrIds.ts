/**
 * `useSessionPrIds()` — distinct session ids that contain a PR set log.
 *
 * Returned as a `Set<number>` so consumers can call `prIds.has(session.id)`
 * inside a list render without an O(n²) `.includes` over the array.
 *
 * Backs the History tab's PR star marker and per-cycle PR count.
 */
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
