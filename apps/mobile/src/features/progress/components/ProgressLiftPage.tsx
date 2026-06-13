import { type LiftProgression, useLiftProgression } from '@/data/queries/useLiftProgression';
import { usePrs } from '@/data/queries/usePrs';
import { useSettings } from '@/data/queries/useSettings';
import { useScrolledPast } from '@/design/hooks/useScrolledPast';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { LOWER_BODY, tmIncrement } from '@/domain/increments';
import { liftLongName } from '@/domain/labels';
import { cyclesUntilTmGoal } from '@/domain/progression';
import type { Lift } from '@/domain/types';
import { convert, displayUnit } from '@/domain/units';
import { QueryShell } from '@/features/shared/QueryShell';
import { goTo } from '@/lib/routes';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, ScrollView, View } from 'react-native';
import { goalStep } from '../goalDefaults';
import { useGoalState } from '../hooks/useGoalState';
import { BeyondChartFooter } from './BeyondChartFooter';
import { GoalPanel } from './GoalPanel';
import { ProgressGridHeader } from './ProgressGridHeader';
import { ProgressLiftRow } from './ProgressLiftRow';
import { ProgressSkeleton } from './ProgressSkeleton';
import { StatsTriplet } from './StatsTriplet';

export type ProgressLiftPageProps = {
  lift: Lift;
  // tells ProgressScreen whether this page is scrolled so the shared masthead can elevate
  onScrolledChange?: (scrolled: boolean) => void;
  // session just closed via "Close the day"; drives JustCompletedAnimator on the matching grid cell
  justCompletedSessionId?: number | undefined;
};

export function ProgressLiftPage({
  lift,
  onScrolledChange,
  justCompletedSessionId,
}: ProgressLiftPageProps) {
  const router = useRouter();
  const { colors, layout, spacing } = useTheme();
  const progression = useLiftProgression(lift);
  const settings = useSettings();
  const prs = usePrs();

  const data: LiftProgression | undefined = progression.data;
  const storageUnit = settings.data?.storageUnit ?? 'lbs';
  const displayU = settings.data?.displayUnit ?? storageUnit;
  const ugDisplay = displayUnit(displayU);
  const tmStep = tmIncrement(displayU, lift);

  const liftPr = (() => {
    const row = prs.data?.find((p) => p.lift === lift) ?? null;
    if (!row) return null;
    return convert(row.bestE1RM, storageUnit, displayU);
  })();

  const {
    draftKind,
    draftValue,
    unset,
    isError: goalIsError,
    persistedDaysPerWeek,
    draftTargetTm,
    onKindChange,
    onValueChange,
    onDaysPerWeekChange,
  } = useGoalState(lift, {
    displayU,
    storageUnit,
    tmStep,
    currentTm: data?.tm ?? 0,
  });

  const { scrolled, onScroll, scrollEventThrottle } = useScrolledPast();
  useEffect(() => {
    onScrolledChange?.(scrolled);
  }, [scrolled, onScrolledChange]);

  // Scroll to the active-cycle row once its y offset has been measured.
  // Row offsets are captured via `onLayout` on the per-row wrapper below;
  // bumping `layoutTick` from there re-runs the effect after first paint.
  // We fire the scroll once per `${lift}:${currentCycle}` pair so a swipe
  // to a different lift (or a cycle advance after a session) re-snaps,
  // but normal data refetches don't fight the user's manual scroll
  // position. A small top padding leaves a hint of the row above so the
  // active row doesn't feel pinned at the edge.
  const scrollRef = useRef<ScrollView | null>(null);
  const rowOffsetsRef = useRef<Map<number, number>>(new Map());
  const lastScrolledKeyRef = useRef<string | null>(null);
  const [layoutTick, setLayoutTick] = useState(0);
  const handleRowLayout = useCallback((cycle: number, e: LayoutChangeEvent) => {
    const prev = rowOffsetsRef.current.get(cycle);
    const next = e.nativeEvent.layout.y;
    if (prev === next) return;
    rowOffsetsRef.current.set(cycle, next);
    setLayoutTick((t) => t + 1);
  }, []);
  const currentCycleForScroll = data?.currentCycle;
  // `layoutTick` is intentionally in the dep list  -  it's a re-run trigger
  // bumped by `handleRowLayout` when row offsets arrive after first
  // paint. The void reference keeps it read so the dep is non-dead.
  useEffect(() => {
    void layoutTick;
    if (currentCycleForScroll === undefined) return;
    const key = `${lift}:${currentCycleForScroll}`;
    if (lastScrolledKeyRef.current === key) return;
    const offset = rowOffsetsRef.current.get(currentCycleForScroll);
    if (offset === undefined) return;
    lastScrolledKeyRef.current = key;
    scrollRef.current?.scrollTo({ y: Math.max(0, offset - 24), animated: true });
  }, [lift, currentCycleForScroll, layoutTick]);

  if (progression.isError || goalIsError) {
    return <QueryShell query={progression}>{null}</QueryShell>;
  }
  if (!data || !settings.data) {
    return <ProgressSkeleton />;
  }

  const cyclesUntilDraft = cyclesUntilTmGoal(
    draftTargetTm,
    data.tm,
    data.currentCycle,
    lift,
    displayU,
  );

  const goalCycle =
    cyclesUntilDraft !== null && cyclesUntilDraft > 0 ? data.currentCycle + cyclesUntilDraft : null;
  const lastRenderedCycle = data.rows[data.rows.length - 1]?.cycle ?? data.currentCycle;
  const goalBeyondChart = goalCycle !== null && goalCycle > lastRenderedCycle;
  const cyclesBeyondChart = goalBeyondChart ? goalCycle - lastRenderedCycle : 0;

  const minGoal = data.tm + tmStep;

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
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
        daysPerWeek={persistedDaysPerWeek}
        onKindChange={onKindChange}
        onValueChange={onValueChange}
        onDaysPerWeekChange={onDaysPerWeekChange}
        unset={unset}
        testID={`goal-panel-${lift}`}
      />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: spacing.md,
          }}
        >
          <CapsLabel weight="semibold">Cycle matrix</CapsLabel>
          <CapsLabel size="xs" color="ink3">{`weight · amreps · ${ugDisplay}`}</CapsLabel>
        </View>

        <View style={{ borderWidth: 1, borderColor: colors.ink0 }}>
          <ProgressGridHeader unitGlyph={ugDisplay} />
          {data.rows.map((row) => (
            <View key={`row-${row.cycle}`} onLayout={(e) => handleRowLayout(row.cycle, e)}>
              <ProgressLiftRow
                lift={lift}
                unit={displayU}
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
                justCompletedSessionId={justCompletedSessionId}
              />
            </View>
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

      <View
        style={{ paddingHorizontal: layout.gutter, paddingTop: spacing.xxl, alignItems: 'center' }}
      >
        <CapsLabel size="xs" color="ink3" style={{ letterSpacing: 2.88 }}>
          {`+${tmStep} per cycle · ${LOWER_BODY.has(lift) ? 'lower body' : 'upper body'}`}
        </CapsLabel>
      </View>
    </ScrollView>
  );
}
