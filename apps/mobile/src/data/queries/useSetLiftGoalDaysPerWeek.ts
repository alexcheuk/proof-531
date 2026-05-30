import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lift } from '../../domain/types';
import { useDb } from '../DbProvider';
import { type LiftGoal, setLiftGoalDaysPerWeek } from '../accessors/liftGoal';
import { LIFT_GOAL_KEY } from './useLiftGoal';

type SetDaysPerWeekInput = {
  lift: Lift;
  /** Pass `null` to clear (return estimate to days-only). */
  daysPerWeek: number | null;
};

export function useSetLiftGoalDaysPerWeek() {
  const db = useDb();
  const queryClient = useQueryClient();

  return useMutation<void, Error, SetDaysPerWeekInput, { previous: LiftGoal | null }>({
    mutationFn: async ({ lift, daysPerWeek }) => {
      await setLiftGoalDaysPerWeek(db, lift, daysPerWeek);
    },
    onMutate: async ({ lift, daysPerWeek }) => {
      await queryClient.cancelQueries({ queryKey: LIFT_GOAL_KEY(lift) });
      const previous = queryClient.getQueryData<LiftGoal | null>(LIFT_GOAL_KEY(lift)) ?? null;
      if (previous) {
        queryClient.setQueryData<LiftGoal>(LIFT_GOAL_KEY(lift), {
          ...previous,
          daysPerWeek,
          updatedAt: Date.now(),
        });
      }
      return { previous };
    },
    onError: (_err, { lift }, context) => {
      if (context) {
        queryClient.setQueryData(LIFT_GOAL_KEY(lift), context.previous);
      }
    },
    onSettled: (_data, _err, { lift }) => {
      void queryClient.invalidateQueries({ queryKey: LIFT_GOAL_KEY(lift) });
    },
  });
}
