import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lift, Unit } from '../../domain/types';
import { useDb } from '../DbProvider';
import { type LiftMissState, applyMissReset } from '../accessors/liftMissState';
import { TM_KEY } from './useLatestTm';
import { MISS_STATE_KEY } from './useMissState';

// Apply reset: writes the 10% TM cut AND clears miss state in one accessor
// call. Optimistically vanishes the card; on error the card returns so the
// lifter can retry from Today. Invalidates both miss state and TM_KEY so the
// new TM appears everywhere.
export function useApplyMissReset() {
  const db = useDb();
  const queryClient = useQueryClient();

  return useMutation<
    { newTm: number; unit: Unit },
    Error,
    { lift: Lift },
    { previous: LiftMissState | null }
  >({
    mutationFn: ({ lift }) => applyMissReset(db, lift),
    onMutate: async ({ lift }) => {
      await queryClient.cancelQueries({ queryKey: MISS_STATE_KEY(lift) });
      const previous = queryClient.getQueryData<LiftMissState | null>(MISS_STATE_KEY(lift)) ?? null;
      queryClient.setQueryData<LiftMissState | null>(MISS_STATE_KEY(lift), null);
      return { previous };
    },
    onError: (_err, { lift }, context) => {
      if (context) {
        queryClient.setQueryData(MISS_STATE_KEY(lift), context.previous);
      }
    },
    onSettled: (_data, _err, { lift }) => {
      void queryClient.invalidateQueries({ queryKey: MISS_STATE_KEY(lift) });
      void queryClient.invalidateQueries({ queryKey: TM_KEY });
    },
  });
}
