import { useDb } from '@/data/DbProvider';
// Disabling a lift with an in-progress session cancels the session (Discord 1508768403)  -  otherwise
// Home's Begin CTA keeps redirecting to the disabled lift.
import { cancelSession, getActiveSession } from '@/data/accessors/session';
import { getSettings, updateSettings } from '@/data/accessors/settings';
import { ACTIVE_SESSION_KEY } from '@/data/queries/useActiveSession';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
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
      // the only enabled lift  -  we can skip the write.
      if (next === current.enabledLifts) return;
      const disabled = current.enabledLifts.filter((l) => !next.includes(l));
      await updateSettings(db, { enabledLifts: next });
      if (disabled.length > 0) {
        const active = await getActiveSession(db);
        if (active && disabled.includes(active.lift)) {
          await cancelSession(db, active.id);
          await queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY });
          await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
        }
      }
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    [db, queryClient],
  );
}
