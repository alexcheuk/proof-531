/**
 * `useActiveSession()` — TanStack Query hook returning the (single)
 * currently in-progress session row, or `undefined` if none exists.
 *
 * Mirrors the PWA's `useActiveSession()` Dexie hook. Consumers (HomeScreen,
 * useHomeScreenState) read `data?.lift` to determine the in-progress lift
 * and gate CTA copy/glyph accordingly.
 *
 * Invalidation: `createSession` / `completeSession` / `cancelSession`
 * callers should invalidate `ACTIVE_SESSION_KEY` to refresh consumers.
 */
import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getActiveSession } from '../accessors/session';

export const ACTIVE_SESSION_KEY = ['activeSession'] as const;

export function useActiveSession() {
  const db = useDb();
  return useQuery({
    queryKey: ACTIVE_SESSION_KEY,
    queryFn: () => getActiveSession(db),
  });
}
