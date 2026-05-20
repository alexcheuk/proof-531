import { colors, shape } from '@/design/tokens';
import { useCallback, useReducer } from 'react';
import { ScrollView } from 'react-native';
import {
  LIFT_ORDER,
  type LiftId,
  type OnboardingEntry,
  epley1RM,
  trainingMaxFrom1RM,
} from './lift-meta';
import { IntroStep } from './steps/IntroStep';
import { LiftEntryStep } from './steps/LiftEntryStep';
import { LiftSelectStep } from './steps/LiftSelectStep';
import { ReviewStep } from './steps/ReviewStep';

export type { OnboardingEntry };

export type OnboardingStepName = 'intro' | 'select' | 'entry' | 'review';

export type OnboardingUnit = 'lbs' | 'kg';

export type OnboardingState = {
  step: OnboardingStepName;
  unit: OnboardingUnit;
  enabled: Record<LiftId, boolean>;
  entries: Record<LiftId, OnboardingEntry>;
  entryIndex: number;
};

export type OnboardingAction =
  | { type: 'BEGIN' }
  | { type: 'SET_UNIT'; unit: OnboardingUnit }
  | { type: 'TOGGLE_LIFT'; lift: LiftId }
  | { type: 'GO_TO_ENTRIES' }
  | { type: 'SET_ENTRY'; lift: LiftId; weight: number; reps: number }
  | { type: 'NEXT_ENTRY' }
  | { type: 'PREV_ENTRY' }
  | { type: 'GO_TO_REVIEW' };

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  step: 'intro',
  unit: 'lbs',
  enabled: { squat: true, bench: true, deadlift: true, press: true },
  entries: {
    squat: { weight: 225, reps: 5 },
    bench: { weight: 155, reps: 5 },
    deadlift: { weight: 275, reps: 5 },
    press: { weight: 95, reps: 5 },
  },
  entryIndex: 0,
};

export function onboardingReducer(s: OnboardingState, a: OnboardingAction): OnboardingState {
  switch (a.type) {
    case 'BEGIN':
      return { ...s, step: 'select' };
    case 'SET_UNIT':
      return { ...s, unit: a.unit };
    case 'TOGGLE_LIFT':
      return { ...s, enabled: { ...s.enabled, [a.lift]: !s.enabled[a.lift] } };
    case 'GO_TO_ENTRIES':
      return { ...s, step: 'entry', entryIndex: 0 };
    case 'SET_ENTRY':
      return {
        ...s,
        entries: { ...s.entries, [a.lift]: { weight: a.weight, reps: a.reps } },
      };
    case 'NEXT_ENTRY': {
      const enabledLifts = LIFT_ORDER.filter((l) => s.enabled[l]);
      if (s.entryIndex + 1 >= enabledLifts.length) {
        return { ...s, step: 'review' };
      }
      return { ...s, entryIndex: s.entryIndex + 1 };
    }
    case 'PREV_ENTRY': {
      if (s.entryIndex === 0) return { ...s, step: 'select' };
      return { ...s, entryIndex: s.entryIndex - 1 };
    }
    case 'GO_TO_REVIEW':
      return { ...s, step: 'review' };
  }
}

export type OnboardingResult = {
  unit: OnboardingUnit;
  lifts: Array<{ id: LiftId; trainingMax: number; enabled: boolean }>;
};

export type OnboardingScreenProps = {
  onFinish: (result: OnboardingResult) => void;
};

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [state, dispatch] = useReducer(onboardingReducer, INITIAL_ONBOARDING_STATE);

  const enabledLifts = LIFT_ORDER.filter((l) => state.enabled[l]);
  const currentLift = enabledLifts[state.entryIndex];

  const handleFinish = useCallback(() => {
    onFinish({
      unit: state.unit,
      lifts: LIFT_ORDER.map((id) => ({
        id,
        trainingMax: trainingMaxFrom1RM(epley1RM(state.entries[id].weight, state.entries[id].reps)),
        enabled: state.enabled[id],
      })),
    });
  }, [onFinish, state.unit, state.entries, state.enabled]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ padding: shape.rLg, gap: shape.rLg }}
      testID="onboarding-screen"
    >
      {state.step === 'intro' ? <IntroStep onBegin={() => dispatch({ type: 'BEGIN' })} /> : null}

      {state.step === 'select' ? (
        <LiftSelectStep
          unit={state.unit}
          enabled={state.enabled}
          onUnitChange={(unit) => dispatch({ type: 'SET_UNIT', unit })}
          onToggleLift={(lift) => dispatch({ type: 'TOGGLE_LIFT', lift })}
          onNext={() => dispatch({ type: 'GO_TO_ENTRIES' })}
        />
      ) : null}

      {state.step === 'entry' && currentLift ? (
        <LiftEntryStep
          lift={currentLift}
          entryIndex={state.entryIndex}
          totalEnabled={enabledLifts.length}
          weight={state.entries[currentLift].weight}
          reps={state.entries[currentLift].reps}
          unit={state.unit}
          onChange={(weight, reps) =>
            dispatch({ type: 'SET_ENTRY', lift: currentLift, weight, reps })
          }
          onNext={() => dispatch({ type: 'NEXT_ENTRY' })}
          onPrev={() => dispatch({ type: 'PREV_ENTRY' })}
        />
      ) : null}

      {state.step === 'review' ? (
        <ReviewStep
          unit={state.unit}
          enabled={state.enabled}
          entries={state.entries}
          onDone={handleFinish}
        />
      ) : null}
    </ScrollView>
  );
}

export default OnboardingScreen;
