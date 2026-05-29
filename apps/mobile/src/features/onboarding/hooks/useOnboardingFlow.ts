import { useDb } from '@/data/DbProvider';
import { completeOnboarding } from '@/data/accessors/onboarding';
import { useSettings } from '@/data/queries/useSettings';
import { estimateOneRm } from '@/domain/epley';
import type { Lift } from '@/domain/types';
import { round } from '@/domain/units';
import { goTo } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { type Dispatch, useCallback, useMemo, useState } from 'react';
import {
  type OnboardingAction,
  type OnboardingState,
  useOnboardingState,
} from './useOnboardingState';

export type UseOnboardingFlowResult = {
  state: OnboardingState;
  dispatch: Dispatch<OnboardingAction>;
  computed: Partial<Record<Lift, number>>;
  finishing: boolean;
  handleFinish: () => Promise<void>;
};

export function useOnboardingFlow(): UseOnboardingFlowResult {
  const router = useRouter();
  const db = useDb();
  const queryClient = useQueryClient();
  const settings = useSettings();
  const initialUnit = settings.data?.storageUnit ?? 'lbs';
  const [state, dispatch] = useOnboardingState(initialUnit);
  const [finishing, setFinishing] = useState(false);

  const computed = useMemo<Partial<Record<Lift, number>>>(() => {
    const out: Partial<Record<Lift, number>> = {};
    for (const lift of state.enabledLifts) {
      const input = state.perLift[lift];
      const raw =
        input.mode === 'direct'
          ? Number(input.weight) || 0
          : estimateOneRm(Number(input.weight), Number(input.reps));
      out[lift] = round(raw, state.unit);
    }
    return out;
  }, [state.enabledLifts, state.perLift, state.unit]);

  const handleFinish = useCallback(async () => {
    if (finishing) return;
    setFinishing(true);
    try {
      const oneRMs: Partial<Record<Lift, number>> = {};
      for (const lift of state.enabledLifts) {
        oneRMs[lift] = computed[lift] ?? 0;
      }
      await completeOnboarding(db, {
        unit: state.unit,
        enabledLifts: state.enabledLifts,
        oneRMs,
      });
      // Refetch (not invalidate) so we navigate AFTER the cache holds the
      // new TMs/settings — invalidateQueries marks stale + triggers a
      // refetch but does NOT await it, so the gate would race the refetch
      // and bounce us right back to /onboarding. refetchQueries awaits.
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['trainingMaxes'] }),
        queryClient.refetchQueries({ queryKey: ['settings'] }),
      ]);
      goTo.home(router);
    } catch (err) {
      // Should not happen given reducer invariants (every enabled lift has
      // a positive computed value). Log so the user can retry.
      console.error('completeOnboarding failed', err);
    } finally {
      // Reset on BOTH success and failure paths. Success previously
      // relied on navigation unmounting the screen, which is fine for
      // goTo.home (replaces stack) but brittle if the flow changes.
      setFinishing(false);
    }
  }, [computed, db, finishing, queryClient, router, state.enabledLifts, state.unit]);

  return { state, dispatch, computed, finishing, handleFinish };
}
