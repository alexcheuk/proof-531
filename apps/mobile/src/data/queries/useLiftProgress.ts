// Cache invalidation: completeSession must invalidate LIFT_PROGRESS_KEY(lift) and ALL_LIFT_PROGRESS_KEY so
// headers pick up the new cycle/week immediately.
import { useQuery } from '@tanstack/react-query';
import type { Lift } from '../../domain/types';
import { useDb } from '../DbProvider';
import { getAllLiftProgress, getLiftProgress } from '../accessors/liftProgress';

const LIFT_PROGRESS_KEY = (lift: Lift) => ['liftProgress', lift] as const;
const ALL_LIFT_PROGRESS_KEY = (lifts: readonly Lift[]) =>
  ['liftProgress', 'all', [...lifts].sort().join(',')] as const;

export function useLiftProgress(lift: Lift) {
  const db = useDb();
  return useQuery({
    queryKey: LIFT_PROGRESS_KEY(lift),
    queryFn: () => getLiftProgress(db, lift),
  });
}

export function useAllLiftProgress(lifts: readonly Lift[]) {
  const db = useDb();
  return useQuery({
    queryKey: ALL_LIFT_PROGRESS_KEY(lifts),
    queryFn: () => getAllLiftProgress(db, lifts),
  });
}
