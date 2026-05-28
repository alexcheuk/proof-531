/**
 * Four-step onboarding wizard orchestrator. Composition shell only — all
 * state + finish-flow plumbing lives in `useOnboardingFlow`.
 *
 * Ported from `the PWA reference`.
 */
import { StatusBar } from 'expo-status-bar';
import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import { Intro } from './steps/Intro';
import { OneRmEntry } from './steps/OneRmEntry';
import { PickLifts } from './steps/PickLifts';
import { Review } from './steps/Review';

export function OnboardingScreen() {
  const { state, dispatch, computed, finishing, handleFinish } = useOnboardingFlow();

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
