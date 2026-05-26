/**
 * Progress screen — single-lift cycle × day matrix with TM/1RM goal panel,
 * stats triplet, goal rule, and beyond-chart marker.
 *
 * Implements the canonical design at
 * `_workspace/00_input/canonical-progress-v3.jsx` (visual + structural
 * source of truth). Layout mirrors HomeScreen: Masthead + LiftTabs are
 * fixed at the top; the per-lift content (title block, stats triplet,
 * goal panel, cycle matrix, footnote) scrolls inside the FlatList page.
 *
 * Composition only — tokens / hex / px literals stay in `src/design/`.
 * Data wiring: `useLiftProgression` for the per-lift view-model,
 * `useLiftGoal` + `useSetLiftGoal` for the goal panel.
 */
import { goTo } from '@/app/routes';
import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import { useLatestTms } from '@/data/queries/useLatestTm';
import { useLiftGoal } from '@/data/queries/useLiftGoal';
import { type LiftProgression, useLiftProgression } from '@/data/queries/useLiftProgression';
import { usePrs } from '@/data/queries/usePrs';
import { useSetLiftGoal } from '@/data/queries/useSetLiftGoal';
import { useSettings } from '@/data/queries/useSettings';
import { Masthead } from '@/design/primitives/Masthead';
import { ProgressGridCell } from '@/design/primitives/ProgressGridCell';
import { ProgressGridRow } from '@/design/primitives/ProgressGridRow';
import { Skeleton } from '@/design/primitives/Skeleton';
import { TmCell } from '@/design/primitives/TmCell';
import { useTheme } from '@/design/theme';
import { tmIncrement } from '@/domain/increments';
import { goalTargetTm } from '@/domain/progression';
import type { Lift, Unit } from '@/domain/types';
import { displayWeight } from '@/domain/units';
import { LiftTabs } from '@/features/home/components/LiftTabs';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  type ListRenderItem,
  Text as RNText,
  ScrollView,
  View,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { BeyondChartFooter } from './components/BeyondChartFooter';
import { GoalPanel } from './components/GoalPanel';
import { GoalRuleRow } from './components/GoalRuleRow';
import { StatsTriplet } from './components/StatsTriplet';
import { useProgressCarouselSync } from './hooks/useProgressCarouselSync';

export type ProgressScreenProps = {
  lift: Lift;
};

function longLiftName(l: Lift): string {
  if (l === 'deadlift') return 'deadlift';
  if (l === 'press') return 'overhead press';
  if (l === 'bench') return 'bench press';
  return 'back squat';
}

function unitGlyphFor(unit: Unit): 'lb' | 'kg' {
  return unit === 'lbs' ? 'lb' : 'kg';
}

function goalStep(unit: Unit): number {
  return unit === 'lbs' ? 5 : 2.5;
}

function defaultBumpStep(unit: Unit): number {
  return unit === 'lbs' ? 25 : 10;
}

function ceilToStep(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

export function ProgressScreen({ lift }: ProgressScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const settings = useSettings();
  const tms = useLatestTms();
  const prs = usePrs();

  const enabledLifts = useMemo<Lift[]>(
    () => settings.data?.enabledLifts ?? ['squat', 'bench', 'deadlift', 'press'],
    [settings.data?.enabledLifts],
  );

  const [selectedLift, setSelectedLift] = useState<Lift>(lift);
  useEffect(() => {
    setSelectedLift(lift);
  }, [lift]);

  const updateRouteParam = useCallback(
    (next: Lift) => {
      setSelectedLift(next);
      router.setParams({ lift: next });
    },
    [router],
  );

  const { listRef, onMomentumScrollEnd } = useProgressCarouselSync({
    selectedLift,
    enabledLifts,
    screenWidth,
    setSelectedLift: updateRouteParam,
  });

  const renderItem = useCallback<ListRenderItem<Lift>>(
    ({ item }) => (
      <View style={{ width: screenWidth }}>
        <ProgressLiftPage lift={item} />
      </View>
    ),
    [screenWidth],
  );

  const combined = combineQueries(settings, tms, prs);
  if (combined.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
        <Masthead rightSlot={<CapsRight>projection</CapsRight>} />
        <QueryShell query={combined}>{null}</QueryShell>
      </View>
    );
  }

  const selectedIndex = Math.max(0, enabledLifts.indexOf(selectedLift));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }} testID="progress-screen">
      <Masthead rightSlot={<CapsRight>projection</CapsRight>} />
      {combined.isLoading || !settings.data ? (
        <ProgressSkeleton />
      ) : (
        <>
          {enabledLifts.length > 1 ? (
            <LiftTabs
              enabled={enabledLifts}
              selected={selectedLift}
              inProgressLift={null}
              onSelect={updateRouteParam}
            />
          ) : null}
          <FlatList
            ref={listRef}
            testID="progress-lift-carousel"
            data={enabledLifts}
            keyExtractor={(l) => l}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            getItemLayout={(_, i) => ({
              length: screenWidth,
              offset: screenWidth * i,
              index: i,
            })}
            initialScrollIndex={selectedIndex}
            initialNumToRender={enabledLifts.length}
            windowSize={enabledLifts.length || 1}
          />
        </>
      )}
    </View>
  );
}

function CapsRight({ children }: { children: string }) {
  const { colors, type } = useTheme();
  return (
    <RNText
      style={{
        fontFamily: `${type.mono}-Medium`,
        fontSize: 10,
        letterSpacing: 2.2,
        textTransform: 'uppercase',
        color: colors.ink2,
      }}
    >
      {children}
    </RNText>
  );
}

/** One page (one lift) inside the Progress pager. */
function ProgressLiftPage({ lift }: { lift: Lift }) {
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
  const ugDisplay = unitGlyphFor(displayU);
  const tmStep = useMemo(() => tmIncrement(displayU, lift), [displayU, lift]);

  // Per-lift PR for the stats triplet (Best e1RM). PRs are stored in
  // storage units; convert to display at the render boundary.
  const liftPr = useMemo(() => {
    const row = prs.data?.find((p) => p.lift === lift) ?? null;
    if (!row) return null;
    return Math.round(displayWeight(row.bestE1RM, storageUnit, displayU));
  }, [prs.data, lift, storageUnit, displayU]);

  // Goal panel local state — seeded from the persisted goal, or from a
  // sensible default when no goal exists. Tabs/steppers mutate this state
  // AND fire the persistence mutation (optimistic).
  const goalRow = goalQuery.data ?? null;
  const persistedKind: LiftGoalKind = goalRow?.kind ?? 'tm';
  const persistedValue: number | null = goalRow
    ? Math.round(displayWeight(goalRow.targetValue, goalRow.unit, displayU))
    : null;

  // Default goal value seeded relative to current TM so the goal rule
  // typically lands inside the chart.
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

  // Sync local draft to persisted goal when the query resolves / lift changes.
  useEffect(() => {
    setDraftKind(persistedKind);
    setDraftValue(persistedValue ?? defaultValueFor(persistedKind));
  }, [persistedKind, persistedValue, defaultValueFor]);

  const unset = persistedValue === null;

  const persist = useCallback(
    (kind: LiftGoalKind, value: number) => {
      // Convert display-unit value back to storage units before persisting.
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
      // Swap kinds: TM ↔ 1RM via 0.9 factor so the "real" goal stays put.
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

  // For the goal-rule placement, recompute targetTm + crossing in display
  // units against the draft (so the rule moves the moment the user steps).
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
      <View
        style={{
          paddingHorizontal: layout.gutter,
          paddingTop: 14,
          paddingBottom: 22,
          borderBottomWidth: 1,
          borderBottomColor: colors.lineStrong,
        }}
      >
        <RNText
          style={{
            fontFamily: `${type.mono}-SemiBold`,
            fontSize: 10,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            color: colors.ink2,
            marginBottom: 8,
          }}
        >
          {`On the ${longLiftName(lift)}`}
        </RNText>
        <RNText
          style={{
            fontFamily: `${type.sans}-Bold`,
            fontSize: 56,
            lineHeight: 52,
            letterSpacing: -2.24,
            color: colors.ink0,
          }}
        >
          Progress.
        </RNText>
      </View>

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
            <Row
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

function Row({
  row,
  unitGlyph,
  onPastCellPress,
  goalCycle,
  draftKind,
  draftValue,
  draftTargetTm,
}: {
  row: LiftProgression['rows'][number];
  unitGlyph: 'lb' | 'kg';
  onPastCellPress: (sessionId: number) => void;
  goalCycle: number | null;
  draftKind: LiftGoalKind;
  draftValue: number;
  draftTargetTm: number;
}) {
  const placeRuleAbove = goalCycle === row.cycle;
  return (
    <>
      {placeRuleAbove ? (
        <GoalRuleRow
          kind={draftKind}
          value={draftValue}
          targetTm={draftTargetTm}
          unitGlyph={unitGlyph}
          testID={`progress-goal-rule-${row.cycle}`}
        />
      ) : null}
      <ProgressGridRow
        cycle={row.cycle}
        state={row.isCurrent ? 'current' : row.isPast ? 'past' : 'future'}
        testID={`progress-row-${row.cycle}`}
      >
        {row.cells.map((cell) => {
          if (cell.kind === 'now') {
            return (
              <ProgressGridCell
                key={`cell-${row.cycle}-${cell.day}`}
                variant="now"
                weight={cell.prescribedWeight}
                accessibilityLabel={`Cycle ${row.cycle}, day ${cell.day}: now, prescribed ${cell.prescribedWeight} ${unitGlyph}`}
                testID={`progress-cell-${row.cycle}-${cell.day}`}
              />
            );
          }
          if (cell.kind === 'future') {
            return (
              <ProgressGridCell
                key={`cell-${row.cycle}-${cell.day}`}
                variant="future"
                weight={cell.projectedWeight}
                marker={cell.deload ? '─' : null}
                accessibilityLabel={`Cycle ${row.cycle}, day ${cell.day}: projected ${cell.projectedWeight} ${unitGlyph}`}
                testID={`progress-cell-${row.cycle}-${cell.day}`}
              />
            );
          }
          // past / last-done
          const variant = cell.kind === 'last-done' ? 'outlined' : 'past';
          const marker = cell.deload ? '✓' : null;
          const a11yPrefix = cell.kind === 'last-done' ? 'Most recent. ' : '';
          return (
            <ProgressGridCell
              key={`cell-${row.cycle}-${cell.day}`}
              variant={variant}
              weight={cell.topWeight}
              reps={cell.amrap ? cell.topReps : null}
              marker={marker}
              onPress={() => onPastCellPress(cell.sessionId)}
              accessibilityLabel={`${a11yPrefix}Cycle ${row.cycle}, day ${cell.day}: top set ${cell.topWeight} ${unitGlyph}${cell.amrap ? ` for ${cell.topReps} reps` : cell.deload ? ' deload logged' : ''}`}
              testID={`progress-cell-${row.cycle}-${cell.day}`}
            />
          );
        })}
        <TmCell
          tm={row.tm}
          variant={row.isCurrent ? 'current' : row.isPast ? 'past' : 'future'}
          unitGlyph={unitGlyph}
          accessibilityLabel={`Cycle ${row.cycle} training max ${row.tm} ${unitGlyph}`}
          testID={`progress-tm-${row.cycle}`}
        />
      </ProgressGridRow>
    </>
  );
}

function ProgressGridHeader({ unitGlyph }: { unitGlyph: 'lb' | 'kg' }) {
  const { colors, type } = useTheme();
  // Mirror ProgressGridRow's column structure: 34 px label + 4× flex 1 + 54 px TM.
  const dayLabels: Array<{ label: string; scheme: string }> = [
    { label: 'D1', scheme: '5+' },
    { label: 'D2', scheme: '3+' },
    { label: 'D3', scheme: '1+' },
    { label: 'D4', scheme: 'del' },
  ];
  const headerCell = (
    key: string,
    label: string,
    sub: string | null,
    flex: number | undefined,
    width: number | undefined,
    withLeftRule: boolean,
    withLeftStrongRule: boolean,
  ) => (
    <View
      key={key}
      style={{
        flex,
        width,
        paddingVertical: 8,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: 36,
        borderLeftWidth: withLeftRule || withLeftStrongRule ? 1 : 0,
        borderLeftColor: withLeftStrongRule ? colors.ink0 : colors.line,
      }}
    >
      <RNText
        style={{
          fontFamily: `${type.mono}-Bold`,
          fontSize: 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: colors.ink0,
        }}
      >
        {label}
      </RNText>
      {sub ? (
        <RNText
          style={{
            fontFamily: `${type.mono}-Medium`,
            fontSize: 8,
            letterSpacing: 1.44,
            textTransform: 'uppercase',
            color: colors.ink3,
          }}
        >
          {sub}
        </RNText>
      ) : null}
    </View>
  );

  const wrap: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.ink0,
  };

  return (
    <View style={wrap}>
      {/* Label spacer (34 px) + right rule matches the body's ink0 label/day divider. */}
      <View
        style={{
          width: 34,
          borderRightWidth: 1,
          borderRightColor: colors.ink0,
        }}
      />
      {dayLabels.map((d, i) => headerCell(d.label, d.label, d.scheme, 1, undefined, i > 0, false))}
      {headerCell('tm', '→ TM', unitGlyph, undefined, 54, false, true)}
    </View>
  );
}

function isLowerBody(lift: Lift): boolean {
  return lift === 'squat' || lift === 'deadlift';
}

function ProgressSkeleton() {
  const { colors, spacing, layout } = useTheme();
  const containerStyle: ViewStyle = {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.bg0,
  };
  return (
    <View style={containerStyle} testID="progress-skeleton">
      <Skeleton style={{ width: '60%', height: 56 }} />
      <Skeleton style={{ height: 96 }} />
      <Skeleton style={{ height: 200 }} />
    </View>
  );
}
