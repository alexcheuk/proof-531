import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import { useLiftGoal } from '@/data/queries/useLiftGoal';
import { useSetLiftGoal } from '@/data/queries/useSetLiftGoal';
import { useSetLiftGoalDaysPerWeek } from '@/data/queries/useSetLiftGoalDaysPerWeek';
import { goalTargetTm } from '@/domain/progression';
import type { Lift, Unit } from '@/domain/types';
import { displayWeight } from '@/domain/units';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ceilToStep, defaultBumpStep } from '../goalDefaults';

export type GoalState = {
  draftKind: LiftGoalKind;
  draftValue: number;
  unset: boolean;
  persistedDaysPerWeek: number | null;
  draftTargetTm: number;
  isError: boolean;
  onKindChange: (kind: LiftGoalKind) => void;
  onValueChange: (value: number) => void;
  onDaysPerWeekChange: (daysPerWeek: number | null) => void;
};

// Parent (ProgressLiftPage) passes display/storage context to avoid duplicate fetches.
export function useGoalState(
  lift: Lift,
  opts: {
    displayU: Unit;
    storageUnit: Unit;
    tmStep: number;
    currentTm: number;
  },
): GoalState {
  const { displayU, storageUnit, tmStep, currentTm } = opts;

  const goalQuery = useLiftGoal(lift);
  const setGoal = useSetLiftGoal();
  const setDaysPerWeek = useSetLiftGoalDaysPerWeek();

  const goalRow = goalQuery.data ?? null;
  const persistedKind: LiftGoalKind = goalRow?.kind ?? 'tm';
  const persistedValue: number | null = goalRow
    ? Math.round(displayWeight(goalRow.targetValue, goalRow.unit, displayU))
    : null;

  const defaultValueFor = useCallback(
    (kind: LiftGoalKind): number => {
      const base = kind === 'tm' ? currentTm : Math.round(currentTm / 0.9);
      return ceilToStep(base + 4 * tmStep, defaultBumpStep(displayU));
    },
    [currentTm, displayU, tmStep],
  );

  const [draftKind, setDraftKind] = useState<LiftGoalKind>(persistedKind);
  const [draftValue, setDraftValue] = useState<number>(
    persistedValue ?? defaultValueFor(persistedKind),
  );

  useEffect(() => {
    setDraftKind(persistedKind);
    setDraftValue(persistedValue ?? defaultValueFor(persistedKind));
  }, [persistedKind, persistedValue, defaultValueFor]);

  const persist = useCallback(
    (kind: LiftGoalKind, value: number) => {
      const valueStorage = displayWeight(value, displayU, storageUnit);
      void setGoal.mutateAsync({
        lift,
        target: { kind, value: valueStorage, unit: storageUnit },
      });
    },
    [setGoal, lift, displayU, storageUnit],
  );

  const onKindChange = useCallback(
    (kind: LiftGoalKind) => {
      const nextValue =
        kind === draftKind
          ? draftValue
          : kind === 'tm'
            ? Math.round(draftValue * 0.9)
            : Math.round(draftValue / 0.9);
      setDraftKind(kind);
      setDraftValue(nextValue);
      persist(kind, nextValue);
    },
    [draftKind, draftValue, persist],
  );

  const onValueChange = useCallback(
    (value: number) => {
      setDraftValue(value);
      persist(draftKind, value);
    },
    [draftKind, persist],
  );

  const persistedDaysPerWeek = goalRow?.daysPerWeek ?? null;
  const onDaysPerWeekChange = useCallback(
    (daysPerWeek: number | null) => {
      void setDaysPerWeek.mutateAsync({ lift, daysPerWeek });
    },
    [setDaysPerWeek, lift],
  );

  const draftTargetTm = useMemo(
    () => goalTargetTm(draftKind, draftValue, displayU),
    [draftKind, draftValue, displayU],
  );

  return {
    draftKind,
    draftValue,
    unset: persistedValue === null,
    isError: goalQuery.isError,
    persistedDaysPerWeek,
    draftTargetTm,
    onKindChange,
    onValueChange,
    onDaysPerWeekChange,
  };
}
