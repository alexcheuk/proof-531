/**
 * `useSessions()` — TanStack Query hook returning every session row,
 * newest first. Backs the History tab.
 *
 * Mirrors the PWA's Dexie `useSessions` hook semantics: returns the same
 * shape as the accessor (`Session[]`). The History screen pull-to-refresh
 * calls `refetch()` on this query.
 */
import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getSessions } from '../accessors/session';

export const SESSIONS_KEY = ['sessions'] as const;

export function useSessions() {
  const db = useDb();
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => getSessions(db),
  });
}
