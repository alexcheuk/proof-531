import type { Unit } from '@/domain/types';
import { trainingMaxFrom } from '@/domain/units';
import { useMemo } from 'react';
import type { LiftInput } from '../../hooks/useOnboardingState';

/**
 * Derived view-model for `OneRmEntry`.
 *
 * Pulls the small bit of math (weight step, training-max round-down, last-lift
 * flag, hint copy) out of the step body so the component is pure presentation.
 */
export type UseOneRmEntryStateOptions = {
  data: LiftInput;
  computed: number;
  unit: Unit;
  step: number;
  total: number;
};

export type UseOneRmEntryStateResult = {
  /** Weight stepper increment for the chosen unit (5 lb / 2.5 kg). */
  weightStep: number;
  /** 90% training max rounded to the unit's step. */
  tm: number;
  /** True when this is the last lift in the wizard. */
  isLast: boolean;
  /** True when the user hasn't yet entered enough to compute a 1RM. */
  hintVisible: boolean;
  /** Help-text copy shown beneath the CTA before it becomes tappable. */
  hintCopy: string;
};

export function useOneRmEntryState({
  data,
  computed,
  unit,
  step,
  total,
}: UseOneRmEntryStateOptions): UseOneRmEntryStateResult {
  return useMemo(() => {
    const weightStep = unit === 'kg' ? 2.5 : 5;
    const tm = trainingMaxFrom(computed, unit);
    const isLast = step === total;
    const hintVisible = !computed;
    const hintCopy =
      data.mode === 'direct' ? 'Set a weight to continue' : 'Enter a weight and reps to continue';
    return { weightStep, tm, isLast, hintVisible, hintCopy };
  }, [data.mode, computed, unit, step, total]);
}
