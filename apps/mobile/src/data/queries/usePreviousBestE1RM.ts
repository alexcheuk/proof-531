// Excludes the current session because appendSetLog already overwrote the prs row — querying prs alone gives delta=0.
import { useQuery } from '@tanstack/react-query';
import type { Lift } from '../../domain/types';
import { useDb } from '../DbProvider';
import { getPreviousBestE1RM } from '../accessors/setLog';

const PREVIOUS_BEST_E1RM_KEY = (lift: Lift | null, sessionId: number | null) =>
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
