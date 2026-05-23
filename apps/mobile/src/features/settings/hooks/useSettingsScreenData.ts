import type { TrainingMax } from '@/data/accessors/trainingMax';
/**
 * Combined Settings-screen read surface. Wraps `useSettings()` and
 * `useLatestTms()` so the screen has a single load/undefined check.
 *
 * Ported from `~/Development/531-pwa/src/features/settings/hooks/useSettingsScreenData.ts`.
 * The mobile port collapses the PWA's `tmsByLift` Map shape (built from
 * Dexie's `useLiveQuery`) to the TanStack Query data, indexed by Lift.
 */
import { useLatestTms } from '@/data/queries/useLatestTm';
import { useSettings } from '@/data/queries/useSettings';
import type { Lift, Settings } from '@/domain/types';
import { useMemo } from 'react';

export interface SettingsScreenData {
  settings: Settings | undefined;
  tmsByLift: Partial<Record<Lift, TrainingMax>> | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

export function useSettingsScreenData(): SettingsScreenData {
  const settingsQuery = useSettings();
  const tmsQuery = useLatestTms();

  const tmsByLift = useMemo<Partial<Record<Lift, TrainingMax>> | undefined>(() => {
    if (!tmsQuery.data) return undefined;
    const out: Partial<Record<Lift, TrainingMax>> = {};
    for (const row of tmsQuery.data) {
      out[row.lift as Lift] = row;
    }
    return out;
  }, [tmsQuery.data]);

  return {
    settings: settingsQuery.data,
    tmsByLift,
    isLoading: settingsQuery.isLoading || tmsQuery.isLoading,
    isError: settingsQuery.isError || tmsQuery.isError,
    error: settingsQuery.error ?? tmsQuery.error,
    refetch: () => Promise.all([settingsQuery.refetch(), tmsQuery.refetch()]),
  };
}
