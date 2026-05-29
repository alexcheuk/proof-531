import { useDb } from '@/data/DbProvider';
import { updateSettings } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import type { Settings } from '@/domain/types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

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
