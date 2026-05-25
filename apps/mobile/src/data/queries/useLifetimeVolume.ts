/**
 * `useLifetimeVolume()` — TanStack Query hook returning the lifetime sum of
 * `prescribedWeight × actualReps` across every working/amrap SetLog whose
 * parent session is `completed`.
 *
 * Aggregated in SQL inside `getLifetimeVolume` so the wire is just a single
 * number; no N-row fetch into JS. Backs the History tab's achievement-strip
 * "total volume" stat.
 */
import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getLifetimeVolume } from '../accessors/setLog';

const LIFETIME_VOLUME_KEY = ['lifetimeVolume'] as const;

export function useLifetimeVolume() {
  const db = useDb();
  return useQuery({
    queryKey: LIFETIME_VOLUME_KEY,
    queryFn: () => getLifetimeVolume(db),
  });
}
