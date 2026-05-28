import type { Lift, Unit } from '@/domain/types';
/**
 * Onboarding wizard state machine. Ported from

 *
 * State lives in-memory via `useReducer` so the route stays simple — a full
 * app refresh discards in-progress state, which is acceptable for v1 (the
 * onboarding gate only flips on after `completeOnboarding` commits).
 */
import { type Dispatch, useReducer } from 'react';
import { LIFT_ORDER } from '../lifts';

export type OnboardingMode = 'direct' | 'calculate';

export interface LiftInput {
  mode: OnboardingMode;
  /** Current stepper value, in `state.unit`. Clamped [0, 9999]. */
  weight: number;
  /** AMRAP-style rep count used in `calculate` mode. Clamped [1, 15]. */
  reps: number;
}

export type OnboardingStep = 1 | 2 | 3 | 4;

export interface OnboardingState {
  step: OnboardingStep;
  unit: Unit;
  /** Ordered subset of LIFT_ORDER, length 1..4. */
  enabledLifts: Lift[];
  /**
   * Entries kept for ALL four lifts so toggling a lift off → on does not
   * lose the user's previously entered values. The accessor only reads
   * the entries for `enabledLifts` at finish time.
   */
  perLift: Record<Lift, LiftInput>;
  /** 0..enabledLifts.length-1. Only meaningful while step === 3. */
  cursor: number;
}

export type OnboardingAction =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'TOGGLE_LIFT'; lift: Lift }
  | { type: 'SET_LIFT_INPUT'; lift: Lift; patch: Partial<LiftInput> }
  | { type: 'SET_UNIT'; unit: Unit }
  | { type: 'GOTO'; step: OnboardingStep };

/**
 * Default per-lift inputs. Values are calibrated for `lbs`; for `kg` we
 * halve and snap to 2.5 (matches `round`). Mode defaults to `'calculate'`
 * so the user can punch in a recent working set rather than guessing a
 * true 1RM.
 */
const LBS_DEFAULTS: Record<Lift, LiftInput> = {
  squat: { mode: 'calculate', weight: 225, reps: 5 },
  bench: { mode: 'calculate', weight: 185, reps: 5 },
  deadlift: { mode: 'calculate', weight: 275, reps: 5 },
  press: { mode: 'calculate', weight: 115, reps: 5 },
};

const KG_DEFAULTS: Record<Lift, LiftInput> = {
  squat: { mode: 'calculate', weight: 100, reps: 5 },
  bench: { mode: 'calculate', weight: 85, reps: 5 },
  deadlift: { mode: 'calculate', weight: 125, reps: 5 },
  press: { mode: 'calculate', weight: 52.5, reps: 5 },
};

export function initialOnboardingState(unit: Unit = 'lbs'): OnboardingState {
  const defaults = unit === 'kg' ? KG_DEFAULTS : LBS_DEFAULTS;
  return {
    step: 1,
    unit,
    enabledLifts: [...LIFT_ORDER],
    perLift: {
      squat: { ...defaults.squat },
      bench: { ...defaults.bench },
      deadlift: { ...defaults.deadlift },
      press: { ...defaults.press },
    },
    cursor: 0,
  };
}

function clampReps(reps: number): number {
  if (!Number.isFinite(reps)) return 1;
  return Math.max(1, Math.min(15, Math.round(reps)));
}

function clampWeight(weight: number): number {
  if (!Number.isFinite(weight)) return 0;
  return Math.max(0, Math.min(9999, weight));
}

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case 'NEXT': {
      if (state.step === 1) return { ...state, step: 2 };
      if (state.step === 2) {
        if (state.enabledLifts.length === 0) return state;
        return { ...state, step: 3, cursor: 0 };
      }
      if (state.step === 3) {
        const last = state.enabledLifts.length - 1;
        if (state.cursor < last) {
          return { ...state, cursor: state.cursor + 1 };
        }
        return { ...state, step: 4 };
      }
      // step 4: NEXT is a no-op (finish handler is invoked elsewhere).
      return state;
    }
    case 'BACK': {
      if (state.step === 1) return state;
      if (state.step === 2) return { ...state, step: 1 };
      if (state.step === 3) {
        if (state.cursor > 0) return { ...state, cursor: state.cursor - 1 };
        return { ...state, step: 2 };
      }
      // step 4 → step 3, cursor at the last enabled lift.
      return {
        ...state,
        step: 3,
        cursor: Math.max(0, state.enabledLifts.length - 1),
      };
    }
    case 'TOGGLE_LIFT': {
      const { lift } = action;
      const currentlyEnabled = state.enabledLifts.includes(lift);
      if (currentlyEnabled && state.enabledLifts.length === 1) {
        // Last remaining lift — no-op.
        return state;
      }
      const nextEnabled = currentlyEnabled
        ? state.enabledLifts.filter((l) => l !== lift)
        : // Preserve LIFT_ORDER ordering when adding back.
          (LIFT_ORDER.filter((l) => state.enabledLifts.includes(l) || l === lift) as Lift[]);
      return { ...state, enabledLifts: nextEnabled };
    }
    case 'SET_LIFT_INPUT': {
      const prev = state.perLift[action.lift];
      const patch = action.patch;
      const next: LiftInput = {
        mode: patch.mode ?? prev.mode,
        weight: patch.weight !== undefined ? clampWeight(patch.weight) : prev.weight,
        reps: patch.reps !== undefined ? clampReps(patch.reps) : prev.reps,
      };
      return {
        ...state,
        perLift: { ...state.perLift, [action.lift]: next },
      };
    }
    case 'SET_UNIT': {
      if (state.unit === action.unit) return state;
      const oldDefaults = state.unit === 'kg' ? KG_DEFAULTS : LBS_DEFAULTS;
      const untouched = LIFT_ORDER.every((l) => {
        const cur = state.perLift[l];
        const def = oldDefaults[l];
        return cur.mode === def.mode && cur.weight === def.weight && cur.reps === def.reps;
      });
      if (!untouched) {
        return { ...state, unit: action.unit };
      }
      const newDefaults = action.unit === 'kg' ? KG_DEFAULTS : LBS_DEFAULTS;
      return {
        ...state,
        unit: action.unit,
        perLift: {
          squat: { ...newDefaults.squat },
          bench: { ...newDefaults.bench },
          deadlift: { ...newDefaults.deadlift },
          press: { ...newDefaults.press },
        },
      };
    }
    case 'GOTO':
      return { ...state, step: action.step };
    default:
      return state;
  }
}

export function useOnboardingState(
  unit: Unit = 'lbs',
): [OnboardingState, Dispatch<OnboardingAction>] {
  return useReducer(onboardingReducer, unit, initialOnboardingState);
}
