/**
 * `useSettings()` — TanStack Query hook for the singleton settings row.
 *
 * Mirrors the PWA's `useSettings` Dexie hook. The db handle is supplied via
 * `<DbProvider>` so hooks stay pure (no module-level db import).
 */
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
