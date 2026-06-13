import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lift } from '../../domain/types';
import { useDb } from '../DbProvider';
import { type LiftMissState, recordMiss } from '../accessors/liftMissState';
import { MISS_STATE_KEY } from './useMissState';

// Write-through: increments missCount for the lift, then invalidates the
// miss-state cache. Fired exactly once per completed AMRAP miss via the
// ref-guarded `useRecordMissOnce` hook (see features/session/hooks).
export function useRecordMiss() {
  const db = useDb();
  const queryClient = useQueryClient();

  return useMutation<LiftMissState, Error, { lift: Lift }>({
    mutationFn: ({ lift }) => recordMiss(db, lift),
    onSettled: (_data, _err, { lift }) => {
      void queryClient.invalidateQueries({ queryKey: MISS_STATE_KEY(lift) });
    },
  });
}
