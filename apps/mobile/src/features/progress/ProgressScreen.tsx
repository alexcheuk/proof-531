/**
 * Progress screen — single-lift cycle × day grid with future projection,
 * goal strip, and a horizontal pager between lifts. Mirrors the design
 * spec at `_workspace/01_design_spec.md` faithfully — see "Per-screen
 * breakdown".
 *
 * Composition only — token / hex / px literals stay in the design layer.
 * Data wiring: per-lift `useLiftProgression` (carries past/future rows,
 * goal, cyclesUntilGoal) + `useSetLiftGoal` for the goal sheet.
 */
import { goTo } from '@/app/routes';
import { useLatestTms } from '@/data/queries/useLatestTm';
import { type LiftProgression, useLiftProgression } from '@/data/queries/useLiftProgression';
import { usePrs } from '@/data/queries/usePrs';
import { useSetLiftGoal } from '@/data/queries/useSetLiftGoal';
import { useSettings } from '@/data/queries/useSettings';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { E1rmCell } from '@/design/primitives/E1rmCell';
import { GoalStrip } from '@/design/primitives/GoalStrip';
import { Masthead } from '@/design/primitives/Masthead';
import { PagerDots } from '@/design/primitives/PagerDots';
import { ProgressGridCell } from '@/design/primitives/ProgressGridCell';
import { ProgressGridRow } from '@/design/primitives/ProgressGridRow';
import { Skeleton } from '@/design/primitives/Skeleton';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { displayUnit, displayWeight } from '@/domain/units';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, type ListRenderItem, ScrollView, View, useWindowDimensions } from 'react-native';
import { GoalRuleRow } from './components/GoalRuleRow';
import { GoalSheet } from './components/GoalSheet';
import { useProgressCarouselSync } from './hooks/useProgressCarouselSync';

export type ProgressScreenProps = {
  lift: Lift;
};

export function ProgressScreen({ lift }: ProgressScreenProps) {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const settings = useSettings();
  const tms = useLatestTms();
  const prs = usePrs();

  const enabledLifts = useMemo<Lift[]>(
    () => settings.data?.enabledLifts ?? ['squat', 'bench', 'deadlift', 'press'],
    [settings.data?.enabledLifts],
  );

  const [selectedLift, setSelectedLift] = useState<Lift>(lift);

  // Keep route param in sync with pager. The pager drives the param; the
  // param drives the pager. The Carousel hook handles the scrollToIndex
  // edge of the loop.
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
        <Masthead />
        <QueryShell query={combined}>{null}</QueryShell>
      </View>
    );
  }

  const selectedIndex = Math.max(0, enabledLifts.indexOf(selectedLift));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }} testID="progress-screen">
      <Masthead />
      {combined.isLoading || !settings.data ? (
        <ProgressSkeleton />
      ) : (
        <>
          <View
            style={{
              paddingHorizontal: layout.gutter,
              paddingTop: spacing.md,
              paddingBottom: spacing.sm,
              alignItems: 'center',
            }}
          >
            <PagerDots count={enabledLifts.length} selectedIndex={selectedIndex} />
          </View>
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

/**
 * One page (one lift) inside the Progress pager. Each page is independent —
 * its own ScrollView with its own grid + goal sheet. Lifting per-lift
 * state to the parent would prevent vertical scroll positions from
 * persisting per lift.
 */
function ProgressLiftPage({ lift }: { lift: Lift }) {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();
  const progression = useLiftProgression(lift);
  const setGoal = useSetLiftGoal();
  const tms = useLatestTms();
  const prs = usePrs();
  const settings = useSettings();
  const [sheetOpen, setSheetOpen] = useState(false);

  const openSheet = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetOpen(true);
  }, []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const data: LiftProgression | undefined = progression.data;
  if (progression.isError) {
    return <QueryShell query={progression}>{null}</QueryShell>;
  }
  if (!data) {
    return <ProgressSkeleton />;
  }

  const tmRow = tms.data?.find((t) => t.lift === lift);
  const displayU = settings.data?.displayUnit ?? settings.data?.storageUnit ?? 'lbs';
  const unitGlyph = displayUnit(displayU);

  const prRow = prs.data?.find((p) => p.lift === lift);
  const bestE1RMRawDisplay = prRow
    ? displayWeight(prRow.bestE1RM, tmRow?.unit ?? displayU, displayU)
    : 0;
  const bestE1RM = Math.round(Math.max(bestE1RMRawDisplay, data.currentE1RM));

  // The carousel page swaps display unit when the user changes display
  // unit in Settings, so just consume the progression hook's `unit`.
  const goalDisplay = data.goal?.value ?? null;

  const handleSave = async (target: number) => {
    if (!tmRow) return;
    await setGoal.mutateAsync({
      lift,
      targetE1RM: target,
      unit: tmRow.unit,
    });
  };
  const handleClear = async () => {
    await setGoal.mutateAsync({ lift, targetE1RM: null });
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: spacing.xxl, backgroundColor: colors.bg0 }}
      showsVerticalScrollIndicator={false}
      testID={`progress-page-${lift}`}
    >
      <LiftHeader
        lift={lift}
        tmDisplay={data.tm}
        currentE1RM={Math.max(data.currentE1RM, bestE1RM)}
        unitGlyph={unitGlyph}
      />
      {goalDisplay !== null && data.goal !== null ? (
        <GoalStrip
          state="goal-set"
          goalValue={goalDisplay}
          goalUnit={data.goal.unit === 'lbs' ? 'lb' : 'kg'}
          cyclesUntilGoal={data.cyclesUntilGoal}
          lift={lift}
          onPress={openSheet}
          testID={`goal-strip-${lift}`}
        />
      ) : (
        <GoalStrip state="no-goal" onPress={openSheet} testID={`goal-strip-${lift}`} />
      )}
      <View style={{ paddingHorizontal: layout.gutter, marginTop: spacing.lg }}>
        <ProgressGridHeader unitGlyph={unitGlyph} />
        <ProgressGridBody
          data={data}
          onPastCellPress={(sessionId) => {
            void Haptics.selectionAsync();
            goTo.complete(router, sessionId, { from: 'history' });
          }}
        />
        {data.pastRows.length === 0 && data.currentE1RM === 0 ? (
          <View style={{ alignItems: 'center', marginTop: spacing.lg }} testID="progress-empty">
            <CapsLabel size="sm" color="ink3">
              LOG A SESSION TO LIGHT UP THIS GRID
            </CapsLabel>
          </View>
        ) : null}
      </View>
      <GoalSheet
        open={sheetOpen}
        onDismiss={closeSheet}
        lift={lift}
        unit={displayU}
        currentGoal={goalDisplay}
        bestE1RM={bestE1RM}
        currentTm={data.tm}
        currentCycle={data.currentCycle}
        rollingMargin={0}
        onSave={handleSave}
        onClear={handleClear}
        testID={`goal-sheet-${lift}`}
      />
    </ScrollView>
  );
}

function LiftHeader({
  lift,
  tmDisplay,
  currentE1RM,
  unitGlyph,
}: {
  lift: Lift;
  tmDisplay: number;
  currentE1RM: number;
  unitGlyph: 'lb' | 'kg';
}) {
  const { layout, spacing } = useTheme();
  return (
    <View
      style={{ paddingHorizontal: layout.gutter, marginTop: spacing.md, alignItems: 'flex-start' }}
      accessibilityRole="header"
      accessibilityLabel={`${liftDisplayName(lift)} progress`}
    >
      <Text
        variant="sans"
        weight="bold"
        size={56}
        color="ink0"
        style={{ letterSpacing: -2.24, lineHeight: 64 }}
      >
        {liftDisplayName(lift).toLowerCase()}
        <Text variant="sans" weight="bold" size={56} color="amber" style={{ lineHeight: 64 }}>
          .
        </Text>
      </Text>
      <View style={{ marginTop: spacing.xs }}>
        <CapsLabel size="sm" color="ink2">
          {`TM ${tmDisplay} ${unitGlyph} · e1RM ${currentE1RM > 0 ? `${currentE1RM} ${unitGlyph}` : '—'}`}
        </CapsLabel>
      </View>
    </View>
  );
}

function ProgressGridHeader({ unitGlyph }: { unitGlyph: 'lb' | 'kg' }) {
  const { colors, spacing } = useTheme();
  const cell = (label: string, flex: number) => (
    <View style={{ flex, alignItems: 'center', justifyContent: 'center' }}>
      <Text
        variant="mono"
        weight="medium"
        size={10}
        color="ink3"
        style={{ letterSpacing: 2.2, textTransform: 'uppercase' }}
      >
        {label}
      </Text>
    </View>
  );
  // Match the row layout: 32 px label + 4 flex cells + 0.8 flex e1RM.
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 28,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        marginBottom: spacing.xs,
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Spacer matching ProgressGridRow's leading label column. */}
      <View style={{ width: 32 }} />
      {cell('D1', 1)}
      {cell('D2', 1)}
      {cell('D3', 1)}
      {cell('DELOAD', 1)}
      {cell(`e1RM ${unitGlyph}`, 0.8)}
    </View>
  );
}

function ProgressGridBody({
  data,
  onPastCellPress,
}: {
  data: LiftProgression;
  onPastCellPress: (sessionId: number) => void;
}) {
  // Past rows oldest-first, then the future tail (which includes the
  // currentCycle row as its first entry per useLiftProgression).
  const rows: Array<{ row: LiftProgression['futureRows'][number]; eyebrow?: string }> = [];
  for (const r of data.pastRows) {
    rows.push({ row: r });
  }
  for (let i = 0; i < data.futureRows.length; i++) {
    const r = data.futureRows[i];
    if (!r) continue;
    if (i === 0) rows.push({ row: r, eyebrow: 'CURRENT' });
    else rows.push({ row: r });
  }

  // Insert goal-rule row between the first row whose e1rm >= goal and the
  // one prior. We use the `crossesGoal` flag set by the data hook.
  const elements: React.ReactNode[] = [];
  for (let i = 0; i < rows.length; i++) {
    const entry = rows[i];
    if (!entry) continue;
    const { row, eyebrow } = entry;
    if (row.crossesGoal && data.goal) {
      elements.push(
        <GoalRuleRow
          key={`goal-rule-${row.cycle}`}
          goalValue={data.goal.value}
          unit={data.goal.unit === 'lbs' ? 'lb' : 'kg'}
          testID="progress-goal-rule"
        />,
      );
    }
    elements.push(
      <ProgressGridRow
        key={`row-${row.cycle}`}
        cycle={row.cycle}
        testID={`progress-row-${row.cycle}`}
        {...(eyebrow ? { eyebrow } : {})}
      >
        {row.cells.map((cell) => {
          if (cell.kind === 'future') {
            return (
              <ProgressGridCell
                key={`cell-${row.cycle}-${cell.day}`}
                variant="ghosted"
                weight={cell.projectedWeight}
                marker={cell.deload ? '─' : null}
                accessibilityLabel={`Cycle ${row.cycle}, day ${cell.day}: projected ${cell.projectedWeight}`}
                testID={`progress-cell-${row.cycle}-${cell.day}`}
              />
            );
          }
          const variant = cell.kind === 'last-done' ? 'outlined' : 'filled';
          const a11yPrefix = cell.kind === 'last-done' ? 'Most recent. ' : '';
          const marker = cell.deload ? '✓' : null;
          return (
            <ProgressGridCell
              key={`cell-${row.cycle}-${cell.day}`}
              variant={variant}
              weight={cell.topWeight}
              reps={cell.amrap ? cell.topReps : null}
              marker={marker}
              onPress={() => onPastCellPress(cell.sessionId)}
              accessibilityLabel={`${a11yPrefix}Cycle ${row.cycle}, day ${cell.day}: top set ${cell.topWeight} for ${cell.topReps} reps`}
              testID={`progress-cell-${row.cycle}-${cell.day}`}
            />
          );
        })}
        <E1rmCell
          value={row.e1rm}
          variant={row.e1rmKind}
          showAchievement={row.crossesGoal === true}
          accessibilityLabel={
            row.e1rmKind === 'past'
              ? `Cycle ${row.cycle} estimated 1RM ${row.e1rm}`
              : `Cycle ${row.cycle} projected estimated 1RM ${row.e1rm}${row.crossesGoal ? ' — projected to reach goal' : ''}`
          }
          testID={`progress-e1rm-${row.cycle}`}
        />
      </ProgressGridRow>,
    );
  }

  return <View>{elements}</View>;
}

function ProgressSkeleton() {
  const { spacing, layout } = useTheme();
  return (
    <View
      style={{ flex: 1, paddingHorizontal: layout.gutter, paddingTop: spacing.lg, gap: spacing.md }}
      testID="progress-skeleton"
    >
      <Skeleton width="60%" height={56} />
      <Skeleton height={12} width="40%" />
      <Skeleton height={64} />
      {Array.from({ length: 7 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton row index is the key
        <Skeleton key={`pg-sk-${i}`} height={56} />
      ))}
    </View>
  );
}
