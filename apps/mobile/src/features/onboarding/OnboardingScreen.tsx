import { useDb } from '@/data/DbProvider';
import { completeOnboarding } from '@/data/accessors/onboarding';
import { useSettings } from '@/data/queries/useSettings';
import { estimateOneRm } from '@/domain/epley';
import type { Lift } from '@/domain/types';
/**
 * Four-step onboarding wizard orchestrator. Ported from
 * `~/Development/531-pwa/src/features/onboarding/OnboardingScreen.tsx`.
 *
 * State lives in-memory (useReducer) — a full app refresh discards the
 * wizard. The onboarding gate flips on after `completeOnboarding` commits
 * and we navigate to `/`.
 *
 * Unit is read once from Settings; while the live query is loading we
 * fall back to `'lbs'`. The wizard does not expose a unit toggle later
 * in the flow (the SegRail on Intro is the single seed point).
 */
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { useOnboardingState } from './hooks/useOnboardingState';
import { Intro } from './steps/Intro';
import { OneRmEntry } from './steps/OneRmEntry';
import { PickLifts } from './steps/PickLifts';
import { Review } from './steps/Review';

export function OnboardingScreen() {
  const router = useRouter();
  const db = useDb();
  const settings = useSettings();
  const initialUnit = settings.data?.storageUnit ?? 'lbs';
  const [state, dispatch] = useOnboardingState(initialUnit);
  const [finishing, setFinishing] = useState(false);

  // Per-lift integer estimated 1RM, derived from current weight/reps/mode.
  const computed = useMemo<Partial<Record<Lift, number>>>(() => {
    const out: Partial<Record<Lift, number>> = {};
    for (const lift of state.enabledLifts) {
      const input = state.perLift[lift];
      const raw =
        input.mode === 'direct'
          ? Number(input.weight) || 0
          : estimateOneRm(Number(input.weight), Number(input.reps));
      out[lift] = Math.round(raw);
    }
    return out;
  }, [state.enabledLifts, state.perLift]);

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
      router.replace('/');
    } catch (err) {
      // Should not happen given reducer invariants (every enabled lift has
      // a positive computed value). Log + re-enable so the user can retry.
      console.error('completeOnboarding failed', err);
      setFinishing(false);
    }
  }, [computed, db, finishing, router, state.enabledLifts, state.unit]);

  if (state.step === 1) {
    return (
      <>
        <StatusBar style="dark" />
        <Intro
          onNext={() => dispatch({ type: 'NEXT' })}
          unit={state.unit}
          onUnitChange={(next) => dispatch({ type: 'SET_UNIT', unit: next })}
        />
      </>
    );
  }

  if (state.step === 2) {
    return (
      <>
        <StatusBar style="dark" />
        <PickLifts
          enabled={state.enabledLifts}
          unit={state.unit}
          onToggle={(lift) => dispatch({ type: 'TOGGLE_LIFT', lift })}
          onBack={() => dispatch({ type: 'BACK' })}
          onNext={() => dispatch({ type: 'NEXT' })}
        />
      </>
    );
  }

  if (state.step === 3) {
    const lift = state.enabledLifts[state.cursor];
    if (!lift) {
      // Defensive: enabledLifts can never be empty here (reducer invariants).
      // If cursor is out of range, bounce back to step 2.
      return (
        <>
          <StatusBar style="dark" />
          <PickLifts
            enabled={state.enabledLifts}
            unit={state.unit}
            onToggle={(l) => dispatch({ type: 'TOGGLE_LIFT', lift: l })}
            onBack={() => dispatch({ type: 'BACK' })}
            onNext={() => dispatch({ type: 'NEXT' })}
          />
        </>
      );
    }
    return (
      <>
        <StatusBar style="dark" />
        <OneRmEntry
          lift={lift}
          step={state.cursor + 1}
          total={state.enabledLifts.length}
          data={state.perLift[lift]}
          computed={computed[lift] ?? 0}
          unit={state.unit}
          onChange={(patch) => dispatch({ type: 'SET_LIFT_INPUT', lift, patch })}
          onBack={() => dispatch({ type: 'BACK' })}
          onNext={() => dispatch({ type: 'NEXT' })}
        />
      </>
    );
  }

  // step === 4
  return (
    <>
      <StatusBar style="dark" />
      <Review
        enabledLifts={state.enabledLifts}
        computed={computed}
        unit={state.unit}
        onBack={() => dispatch({ type: 'BACK' })}
        onFinish={handleFinish}
        finishing={finishing}
      />
    </>
  );
}
