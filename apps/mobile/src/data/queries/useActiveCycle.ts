import { useQuery } from '@tanstack/react-query';
import { useRepos } from '../context';
import { queryKeys } from './keys';

/**
 * The active cycle = the most recently-started cycle that has not been
 * marked complete. Returns null when no such cycle exists.
 */
export function useActiveCycle() {
  const { cycles } = useRepos();
  return useQuery({
    queryKey: queryKeys.activeCycle,
    queryFn: () => {
      const all = cycles.list();
      const active = all
        .filter((c) => c.completedAt === null)
        .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
      return active.length > 0 ? active[0] : null;
    },
  });
}
