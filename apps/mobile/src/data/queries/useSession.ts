import { useQuery } from '@tanstack/react-query';
import { useRepos } from '../context';
import { queryKeys } from './keys';

/** Fetch a single session by id. Returns null when not found. */
export function useSession(sessionId: number) {
  const { sessions } = useRepos();
  return useQuery({
    queryKey: queryKeys.session(sessionId),
    queryFn: () => sessions.get(sessionId) ?? null,
  });
}
