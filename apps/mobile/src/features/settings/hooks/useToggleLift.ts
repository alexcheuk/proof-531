import { useDb } from '@/data/DbProvider';
/**
 * Returns a stable `(lift) => Promise<void>` that toggles a lift in
 * `Settings.enabledLifts`, preserving LIFT_ORDER and no-opping if the toggle
 * would empty the set.
 *
 * Ported from `~/Development/531-pwa/src/features/settings/hooks/useToggleLift.ts`.
 * Reads via a one-shot `getSettings()` await (not a closure over the query
 * cache) so the write uses the value at toggle-time.
 */
import { getSettings, updateSettings } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import type { Lift } from '@/domain/types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { nextEnabledLifts } from '../nextEnabledLifts';

export function useToggleLift(): (lift: Lift) => Promise<void> {
  const db = useDb();
  const queryClient = useQueryClient();
  return useCallback(
    async (lift: Lift) => {
      const current = await getSettings(db);
      const next = nextEnabledLifts(current.enabledLifts, lift);
      // `nextEnabledLifts` returns the same array reference when toggling
      // the only enabled lift — we can skip the write.
      if (next === current.enabledLifts) return;
      await updateSettings(db, { enabledLifts: next });
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    [db, queryClient],
  );
}
