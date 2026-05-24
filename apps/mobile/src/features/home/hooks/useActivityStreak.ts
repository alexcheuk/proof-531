import { useSessions } from '@/data/queries/useSessions';
import { currentStreak, recentActivity } from '@/features/history/activity';
import { useMemo } from 'react';

/**
 * Returns the user's current trailing day-streak based on completed
 * sessions (same math used by the History tab's sparkline + caption).
 *
 * Reuses the existing `useSessions` cache — no extra query.
 */
export function useActivityStreak(): { streak: number } {
  const query = useSessions();
  const streak = useMemo<number>(() => {
    const rows = query.data;
    if (!rows || rows.length === 0) return 0;
    return currentStreak(recentActivity(rows));
  }, [query.data]);
  return { streak };
}
