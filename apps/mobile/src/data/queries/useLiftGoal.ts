/**
 * `useLiftGoal(lift)` — TanStack Query hook returning the per-lift e1RM goal
 * row, or `null` when no goal has been set.
 *
 * Companion mutation lives in `./useSetLiftGoal.ts` so the read and the
 * optimistic write stay in separate files.
 */
import { useQuery } from '@tanstack/react-query';
import type { Lift } from '../../domain/types';
import { useDb } from '../DbProvider';
import { getLiftGoal } from '../accessors/liftGoal';

export const LIFT_GOAL_KEY = (lift: Lift) => ['liftGoal', lift] as const;

export function useLiftGoal(lift: Lift) {
  const db = useDb();
  return useQuery({
    queryKey: LIFT_GOAL_KEY(lift),
    queryFn: () => getLiftGoal(db, lift),
  });
}
