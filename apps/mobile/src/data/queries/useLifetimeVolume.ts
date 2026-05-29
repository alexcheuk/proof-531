import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getLifetimeVolume } from '../accessors/setLog';

// Exported so invalidators (useLiveScreenEffects, BbbPromptScreen) can
// hit the same key instead of duplicating the string literal.
export const LIFETIME_VOLUME_KEY = ['lifetimeVolume'] as const;

export function useLifetimeVolume() {
  const db = useDb();
  return useQuery({
    queryKey: LIFETIME_VOLUME_KEY,
    queryFn: () => getLifetimeVolume(db),
  });
}
