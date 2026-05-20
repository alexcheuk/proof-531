import { useQuery } from '@tanstack/react-query';
import { useRepos } from '../context';
import { queryKeys } from './keys';

/**
 * All completed sessions, newest-first. The "history" view consumes this.
 */
export function useHistory() {
  const { sessions } = useRepos();
  return useQuery({
    queryKey: queryKeys.history,
    queryFn: () =>
      sessions
        .list()
        .filter((s) => s.completedAt !== null)
        .sort((a, b) => {
          const aT = a.completedAt?.getTime() ?? 0;
          const bT = b.completedAt?.getTime() ?? 0;
          return bT - aT;
        }),
  });
}
