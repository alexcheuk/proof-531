import { useQuery } from '@tanstack/react-query';
import type { Lift } from '../../domain/types';
import { useDb } from '../DbProvider';
import { getMissState } from '../accessors/liftMissState';

export const MISS_STATE_KEY = (lift: Lift) => ['liftMissState', lift] as const;

export function useMissState(lift: Lift) {
  const db = useDb();
  return useQuery({
    queryKey: MISS_STATE_KEY(lift),
    queryFn: () => getMissState(db, lift),
  });
}
