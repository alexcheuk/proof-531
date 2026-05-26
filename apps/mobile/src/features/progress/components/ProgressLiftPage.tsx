/**
 * One page of the Progress carousel — a single lift's title block, stats
 * triplet, goal panel, cycle×day matrix, and footnote. Composes the data
 * layer (`useLiftProgression`, `useLiftGoal`, `useSetLiftGoal`) and the
 * pure projection math from `domain/progression.ts`. Display-unit conversion
 * happens at the data hook; site code consumes numbers ready to render.
 */
import { goTo } from '@/app/routes';
import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import { useLiftGoal } from '@/data/queries/useLiftGoal';
import { type LiftProgression, useLiftProgression } from '@/data/queries/useLiftProgression';
import { usePrs } from '@/data/queries/usePrs';
import { useSetLiftGoal } from '@/data/queries/useSetLiftGoal';
import { useSettings } from '@/data/queries/useSettings';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { tmIncrement } from '@/domain/increments';
import { goalTargetTm } from '@/domain/progression';
import type { Lift } from '@/domain/types';
import { displayUnit, displayWeight } from '@/domain/units';
import { QueryShell } from '@/features/shared/QueryShell';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text as RNText, ScrollView, View } from 'react-native';
import { ceilToStep, defaultBumpStep, goalStep } from '../goalDefaults';
import { isLowerBody, liftLongName } from '../labels';
import { BeyondChartFooter } from './BeyondChartFooter';
import { GoalPanel } from './GoalPanel';
import { ProgressGridHeader } from './ProgressGridHeader';
import { ProgressLiftRow } from './ProgressLiftRow';
import { ProgressSkeleton } from './ProgressSkeleton';
import { StatsTriplet } from './StatsTriplet';

export function ProgressLiftPage({ lift }: { lift: Lift }) {
  const router = useRouter();
  const { colors, layout, spacing, type } = useTheme();
  const progression = useLiftProgression(lift);
  const goalQuery = useLiftGoal(lift);
  const setGoal = useSetLiftGoal();
  const settings = useSettings();
  const prs = usePrs();

  const data: LiftProgression | undefined = progression.data;
  const storageUnit = settings.data?.storageUnit ?? 'lbs';
  const displayU = settings.data?.displayUnit ?? storageUnit;
  const ugDisplay = displayUnit(displayU);
  const tmStep = useMemo(() => tmIncrement(displayU, lift), [displayU, lift]);

  const liftPr = useMemo(() => {
    const row = prs.data?.find((p) => p.lift === lift) ?? null;
    if (!row) return null;
    return Math.round(displayWeight(row.bestE1RM, storageUnit, displayU));
  }, [prs.data, lift, storageUnit, displayU]);

  const goalRow = goalQuery.data ?? null;
  const persistedKind: LiftGoalKind = goalRow?.kind ?? 'tm';
  const persistedValue: number | null = goalRow
    ? Math.round(displayWeight(goalRow.targetValue, goalRow.unit, displayU))
    : null;

  const defaultValueFor = useCallback(
    (kind: LiftGoalKind): number => {
      const tm = data?.tm ?? 0;
      const base = kind === 'tm' ? tm : Math.round(tm / 0.9);
      return ceilToStep(base + 4 * tmStep, defaultBumpStep(displayU));
    },
    [data?.tm, displayU, tmStep],
  );

  const [draftKind, setDraftKind] = useState<LiftGoalKind>(persistedKind);
  const [draftValue, setDraftValue] = useState<number>(
    persistedValue ?? defaultValueFor(persistedKind),
  );

  useEffect(() => {
    setDraftKind(persistedKind);
    setDraftValue(persistedValue ?? defaultValueFor(persistedKind));
  }, [persistedKind, persistedValue, defaultValueFor]);

  const unset = persistedValue === null;

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

  const draftTargetTm = useMemo(
    () => goalTargetTm(draftKind, draftValue, displayU),
    [draftKind, draftValue, displayU],
  );

  if (progression.isError || goalQuery.isError) {
    return <QueryShell query={progression}>{null}</QueryShell>;
  }
  if (!data || !settings.data) {
    return <ProgressSkeleton />;
  }

  const cyclesUntilDraft = (() => {
    if (data.tm >= draftTargetTm) return 0;
    for (let k = 1; k <= 120; k++) {
      const projected = data.tm + k * tmStep;
      if (projected >= draftTargetTm) return k;
    }
    return null;
  })();

  const goalCycle =
    cyclesUntilDraft !== null && cyclesUntilDraft > 0 ? data.currentCycle + cyclesUntilDraft : null;
  const lastRenderedCycle = data.rows[data.rows.length - 1]?.cycle ?? data.currentCycle;
  const goalBeyondChart = goalCycle !== null && goalCycle > lastRenderedCycle;
  const cyclesBeyondChart = goalBeyondChart ? goalCycle - lastRenderedCycle : 0;

  const minGoal = data.tm + tmStep;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      testID={`progress-lift-${lift}`}
    >
      <TitleBlock eyebrow={`On the ${liftLongName(lift)}`} title="Progress." />

      <StatsTriplet
        tm={data.tm}
        bestE1RM={liftPr}
        cycle={data.currentCycle}
        unitGlyph={ugDisplay}
        testID={`stats-triplet-${lift}`}
      />

      <GoalPanel
        kind={draftKind}
        value={draftValue}
        unitGlyph={ugDisplay}
        step={goalStep(displayU)}
        minValue={minGoal}
        cyclesUntilGoal={cyclesUntilDraft}
        onKindChange={onKindChange}
        onValueChange={onValueChange}
        unset={unset}
        testID={`goal-panel-${lift}`}
      />

      <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 10,
          }}
        >
          <RNText
            style={{
              fontFamily: `${type.mono}-SemiBold`,
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: colors.ink2,
            }}
          >
            Cycle matrix
          </RNText>
          <RNText
            style={{
              fontFamily: `${type.mono}-Medium`,
              fontSize: 9,
              letterSpacing: 1.62,
              textTransform: 'uppercase',
              color: colors.ink3,
            }}
          >
            {`weight · amreps · ${ugDisplay}`}
          </RNText>
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.ink0,
            borderLeftWidth: 1,
            borderLeftColor: colors.ink0,
            borderRightWidth: 1,
            borderRightColor: colors.ink0,
            borderBottomWidth: 1,
            borderBottomColor: colors.ink0,
          }}
        >
          <ProgressGridHeader unitGlyph={ugDisplay} />
          {data.rows.map((row) => (
            <ProgressLiftRow
              key={`row-${row.cycle}`}
              row={row}
              unitGlyph={ugDisplay}
              onPastCellPress={(sessionId) => {
                void Haptics.selectionAsync();
                goTo.complete(router, sessionId, { from: 'history' });
              }}
              goalCycle={goalCycle}
              draftKind={draftKind}
              draftValue={draftValue}
              draftTargetTm={draftTargetTm}
            />
          ))}
          {goalBeyondChart ? (
            <BeyondChartFooter
              cyclesBeyond={cyclesBeyondChart}
              goalValue={draftValue}
              unitGlyph={ugDisplay}
              testID={`progress-beyond-${lift}`}
            />
          ) : null}
        </View>
      </View>

      <View style={{ paddingHorizontal: layout.gutter, paddingTop: 28, alignItems: 'center' }}>
        <RNText
          style={{
            fontFamily: `${type.mono}-Medium`,
            fontSize: 9,
            letterSpacing: 2.88,
            textTransform: 'uppercase',
            color: colors.ink3,
          }}
        >
          {`+${tmStep} per cycle · ${isLowerBody(lift) ? 'lower body' : 'upper body'}`}
        </RNText>
      </View>
    </ScrollView>
  );
}
