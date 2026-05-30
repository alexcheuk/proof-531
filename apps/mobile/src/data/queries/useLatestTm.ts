import { useQuery } from '@tanstack/react-query';
import type { Lift } from '../../domain/types';
import { useDb } from '../DbProvider';
import { getCurrentTrainingMaxes } from '../accessors/trainingMax';

export const TM_KEY = ['trainingMaxes'] as const;

export function useLatestTms() {
  const db = useDb();
  return useQuery({
    queryKey: TM_KEY,
    queryFn: () => getCurrentTrainingMaxes(db),
  });
}

export function useLatestTm(lift: Lift) {
  const all = useLatestTms();
  return {
    ...all,
    data: all.data?.find((t) => t.lift === lift),
  };
}
