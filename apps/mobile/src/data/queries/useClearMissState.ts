import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lift } from '../../domain/types';
import { useDb } from '../DbProvider';
import { type LiftMissState, clearMissState } from '../accessors/liftMissState';
import { MISS_STATE_KEY } from './useMissState';

// Off-day: clears the miss state. Optimistically vanishes the card; never
// touches TM_KEY (an off-day never changes the training max).
export function useClearMissState() {
  const db = useDb();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { lift: Lift }, { previous: LiftMissState | null }>({
    mutationFn: ({ lift }) => clearMissState(db, lift),
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
    },
  });
}
