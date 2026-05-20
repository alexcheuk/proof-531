import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRepos } from '../context';
import type { sets as setsTable } from '../db/schema';
import { queryKeys } from './keys';

type NewSet = typeof setsTable.$inferInsert;

/**
 * Create a new prescribed set on a session. Invalidates the per-session
 * set list and the session itself so consumers refresh.
 */
export function useStartSet() {
  const { sets } = useRepos();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewSet) => Promise.resolve(sets.create(input)),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: queryKeys.setsBySession(created.sessionId) });
      qc.invalidateQueries({ queryKey: queryKeys.session(created.sessionId) });
    },
  });
}
