/**
 * `useSetLiftGoal()` — mutation that upserts (target ≠ null) or clears
 * (target === null) a per-lift goal. Goal carries a `kind` ('tm' | '1rm').
 *
 * Optimistic: writes `setQueryData(['liftGoal', lift], ...)` in `onMutate`
 * so the Progress goal panel updates the moment the user taps a stepper or
 * toggles a tab; on failure rolls back via the snapshot captured in
 * onMutate. Invalidates both `['liftGoal', lift]` and the
 * `['liftProgression']` prefix so the grid's "cycles to go" + goal-rule
 * placement recompute against the new target.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lift, Unit } from '../../domain/types';
import { useDb } from '../DbProvider';
import {
  type LiftGoal,
  type LiftGoalKind,
  clearLiftGoal,
  setLiftGoal,
} from '../accessors/liftGoal';
import { LIFT_GOAL_KEY } from './useLiftGoal';

type SetLiftGoalInput = {
  lift: Lift;
  /** Pass `null` to clear the goal. */
  target: { kind: LiftGoalKind; value: number; unit: Unit } | null;
};

export function useSetLiftGoal() {
  const db = useDb();
  const queryClient = useQueryClient();

  return useMutation<LiftGoal | null, Error, SetLiftGoalInput, { previous: LiftGoal | null }>({
    mutationFn: async ({ lift, target }) => {
      if (target === null) {
        await clearLiftGoal(db, lift);
        return null;
      }
      return setLiftGoal(db, lift, target.kind, target.value, target.unit);
    },
    onMutate: async ({ lift, target }) => {
      await queryClient.cancelQueries({ queryKey: LIFT_GOAL_KEY(lift) });
      const previous = queryClient.getQueryData<LiftGoal | null>(LIFT_GOAL_KEY(lift)) ?? null;
      // Preserve daysPerWeek across goal-target edits — the accessor's
      // `onConflictDoUpdate` does the same on the persisted row, so the
      // optimistic shape must match or the goal panel briefly clears the
      // freq input on the same frame.
      const optimistic: LiftGoal | null =
        target === null
          ? null
          : {
              lift,
              kind: target.kind,
              targetValue: target.value,
              unit: target.unit,
              updatedAt: Date.now(),
              daysPerWeek: previous?.daysPerWeek ?? null,
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
      void queryClient.invalidateQueries({ queryKey: ['liftProgression'] });
    },
  });
}
