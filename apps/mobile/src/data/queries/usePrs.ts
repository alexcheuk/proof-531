/**
 * `usePrs()` — TanStack Query hook returning all PR rows (one per lift, or none).
 *
 * Mirrors the PWA's `usePRs` Dexie hook.
 */
import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getPRs } from '../accessors/prs';

export const PRS_KEY = ['prs'] as const;

export function usePrs() {
  const db = useDb();
  return useQuery({
    queryKey: PRS_KEY,
    queryFn: () => getPRs(db),
  });
}
