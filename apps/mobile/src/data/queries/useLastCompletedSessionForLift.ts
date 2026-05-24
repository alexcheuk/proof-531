import { useSessions } from '@/data/queries/useSessions';
import type { Lift } from '@/domain/types';
import { useMemo } from 'react';

/**
 * Returns the timestamp of the most recent COMPLETED session for `lift`,
 * or `null` when the lift has never been finished. Reuses the existing
 * `useSessions` cache (no extra query).
 *
 * Surfaces the wall-clock `startedAt` (not `endedAt`) so the caller can
 * pass it to `formatRelativeTime` and the displayed cadence matches the
 * user's intuition about when the lift was "done".
 */
export function useLastCompletedSessionForLift(lift: Lift): {
  startedAt: number | null;
  isLoading: boolean;
} {
  const query = useSessions();
  const startedAt = useMemo<number | null>(() => {
    const rows = query.data;
    if (!rows) return null;
    // Newest-first per accessor contract — first match wins.
    for (const s of rows) {
      if (s.lift === lift && s.status === 'completed') return s.startedAt;
    }
    return null;
  }, [query.data, lift]);
  return { startedAt, isLoading: query.isLoading };
}
