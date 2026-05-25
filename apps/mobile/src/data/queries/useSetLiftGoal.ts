/**
 * `useSetLiftGoal()` — mutation that upserts (target ≠ null) or clears
 * (target === null) a per-lift e1RM goal.
 *
 * Optimistic: writes `setQueryData(['liftGoal', lift], ...)` in `onMutate`
 * so the Progress goal strip updates the moment the user taps Save; on
 * failure rolls back via the snapshot captured in onMutate. Invalidates
 * both `['liftGoal', lift]` and the `['liftProgression']` prefix so the
 * grid's "cycles to go" recomputes against the new target.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lift, Unit } from '../../domain/types';
import { useDb } from '../DbProvider';
import { type LiftGoal, clearLiftGoal, setLiftGoal } from '../accessors/liftGoal';
import { LIFT_GOAL_KEY } from './useLiftGoal';

export type SetLiftGoalInput = {
  lift: Lift;
  /** Pass `null` to clear the goal. */
  targetE1RM: number | null;
  /** Required when targetE1RM is non-null (the storage unit at write time). */
  unit?: Unit;
};

export function useSetLiftGoal() {
  const db = useDb();
  const queryClient = useQueryClient();

  return useMutation<LiftGoal | null, Error, SetLiftGoalInput, { previous: LiftGoal | null }>({
    mutationFn: async ({ lift, targetE1RM, unit }) => {
      if (targetE1RM === null) {
        await clearLiftGoal(db, lift);
        return null;
      }
      if (!unit) {
        throw new Error('useSetLiftGoal: `unit` is required when targetE1RM is non-null');
      }
      return setLiftGoal(db, lift, targetE1RM, unit);
    },
    onMutate: async ({ lift, targetE1RM, unit }) => {
      // Cancel any in-flight refetch so it doesn't clobber our optimistic value.
      await queryClient.cancelQueries({ queryKey: LIFT_GOAL_KEY(lift) });
      const previous = queryClient.getQueryData<LiftGoal | null>(LIFT_GOAL_KEY(lift)) ?? null;
      const optimistic: LiftGoal | null =
        targetE1RM === null
          ? null
          : {
              lift,
              targetE1RM,
              unit: unit ?? previous?.unit ?? 'lbs',
              updatedAt: Date.now(),
            };
      queryClient.setQueryData(LIFT_GOAL_KEY(lift), optimistic);
      return { previous };
    },
    onError: (_err, { lift }, context) => {
      if (context) {
        queryClient.setQueryData(LIFT_GOAL_KEY(lift), context.previous);
      }
    },
    onSettled: (_data, _err, { lift }) => {
      void queryClient.invalidateQueries({ queryKey: LIFT_GOAL_KEY(lift) });
      // Prefix invalidation: the projection's "cycles to go" depends on the goal.
      void queryClient.invalidateQueries({ queryKey: ['liftProgression'] });
    },
  });
}
