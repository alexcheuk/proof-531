import { useDb } from '@/data/DbProvider';
import { updateSettings } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import type { Settings } from '@/domain/types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Standard `update settings → invalidate the settings query` pair used by
 * every settings section that commits a single field. Replaces the
 * `useDb + useQueryClient + async commit` boilerplate that was
 * duplicated five times across `sections/`.
 *
 * Returns a single async function; callers await it (or `void` it) at
 * the site of the user gesture. Errors propagate — sections that need
 * to surface them can wrap in try/catch.
 */
export function useUpdateSettings(): (patch: Partial<Omit<Settings, 'id'>>) => Promise<void> {
  const db = useDb();
  const queryClient = useQueryClient();
  return useCallback(
    async (patch) => {
      await updateSettings(db, patch);
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    [db, queryClient],
  );
}
