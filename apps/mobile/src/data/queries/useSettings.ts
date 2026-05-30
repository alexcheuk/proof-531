import { useQuery } from '@tanstack/react-query';
import { useDb } from '../DbProvider';
import { getSettings } from '../accessors/settings';

export const SETTINGS_KEY = ['settings'] as const;

export function useSettings() {
  const db = useDb();
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => getSettings(db),
  });
}
