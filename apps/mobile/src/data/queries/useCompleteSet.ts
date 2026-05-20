import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRepos } from '../context';
import { queryKeys } from './keys';

/**
 * Mark a set complete with actual reps. Invalidates the per-session set
 * list, the parent session, history, and PR strip — completion can
 * promote a set to a new PR, which downstream views must reflect.
 */
export function useCompleteSet() {
  const { sets } = useRepos();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actualReps }: { id: number; actualReps: number }) =>
      Promise.resolve(sets.update(id, { actualReps, completedAt: new Date() })),
    onSuccess: (updated) => {
      if (!updated) return;
      qc.invalidateQueries({ queryKey: queryKeys.setsBySession(updated.sessionId) });
      qc.invalidateQueries({ queryKey: queryKeys.session(updated.sessionId) });
      qc.invalidateQueries({ queryKey: queryKeys.history });
      qc.invalidateQueries({ queryKey: queryKeys.prStrip });
    },
  });
}
