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
