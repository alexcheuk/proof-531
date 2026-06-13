import { useSessions } from '@/data/queries/useSessions';
import type { Lift } from '@/domain/types';
import { useMemo } from 'react';

// Returns startedAt (not endedAt)  -  user's intuition of "when I did this" is when they started, not when they finished.
export function useLastCompletedSessionForLift(lift: Lift): {
  startedAt: number | null;
  isLoading: boolean;
} {
  const query = useSessions();
  const startedAt = useMemo<number | null>(() => {
    const rows = query.data;
    if (!rows) return null;
    // Newest-first per accessor contract  -  first match wins.
    for (const s of rows) {
      if (s.lift === lift && s.status === 'completed') return s.startedAt;
    }
    return null;
  }, [query.data, lift]);
  return { startedAt, isLoading: query.isLoading };
}
