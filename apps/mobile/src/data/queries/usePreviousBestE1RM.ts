/**
 * `usePreviousBestE1RM(lift, excludingSessionId)` — returns the best
 * estimated 1RM across all completed-session AMRAP set_logs for `lift`,
 * excluding rows from `excludingSessionId`.
 *
 * Used by the SessionComplete PR certificate to render the prior best:
 * by the time the screen mounts, `appendSetLog` has already overwritten
 * the `prs` row with this session's new e1RM, so the `prs` table alone
 * always reports `prevBest === newBest` (delta = 0).
 *
 * Disabled when `lift` or `excludingSessionId` is null/undefined.
 */
import { useQuery } from '@tanstack/react-query';
import type { Lift } from '../../domain/types';
import { useDb } from '../DbProvider';
import { getPreviousBestE1RM } from '../accessors/setLog';

export const PREVIOUS_BEST_E1RM_KEY = (lift: Lift | null, sessionId: number | null) =>
  ['previousBestE1RM', lift, sessionId] as const;

export function usePreviousBestE1RM(lift: Lift | null, excludingSessionId: number | null) {
  const db = useDb();
  return useQuery({
    queryKey: PREVIOUS_BEST_E1RM_KEY(lift, excludingSessionId),
    queryFn: () => {
      if (lift === null || excludingSessionId === null) return Promise.resolve(0);
      return getPreviousBestE1RM(db, lift, excludingSessionId);
    },
    enabled: lift !== null && excludingSessionId !== null,
  });
}
