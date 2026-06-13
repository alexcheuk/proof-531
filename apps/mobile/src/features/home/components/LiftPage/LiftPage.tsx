import { useLastCompletedSessionForLift } from '@/data/queries/useLastCompletedSessionForLift';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { formatRelativeTime } from '@/domain/relativeTime';
import { prescription, tmTestSet } from '@/domain/schemes';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { DayPreviewSheet } from '@/features/shared/DayPreviewSheet/DayPreviewSheet';
import { WorkingSetsBand } from '@/features/shared/WorkingSetsBand';
// LinearTransition animates layout when the selected lift changes — swap feels like a smooth strip, not a hard cut.
import { goTo } from '@/lib/routes';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useCycleDaySessionId } from '../../hooks/useCycleDaySessionId';
import { useLiftPageState } from '../../hooks/useLiftPageState';
import { CycleStrip } from '../CycleStrip';
import { LiftPageEmpty } from './LiftPageEmpty';
import { LiftPageEyebrow } from './LiftPageEyebrow';
import { LiftPageHint } from './LiftPageHint';
import { LiftPageTitle } from './LiftPageTitle';

type LiftPageProps = {
  lift: Lift;
  week: Week;
  cycle: number;
  storageUnit: Unit;
  displayUnit: Unit;
  plateSet: PlateSet;
  tm: number | null;
  isInProgress: boolean;
  // sets completed so far in the active session; drives "Resume · set N of 3" copy
  completedCount?: number;
  onBegin: () => void;
  onResume: () => void;
};

export function LiftPage({
  lift,
  week,
  cycle,
  storageUnit,
  displayUnit: displayUnitProp,
  plateSet,
  tm,
  isInProgress,
  completedCount = 0,
  onBegin,
  onResume,
}: LiftPageProps) {
  const router = useRouter();
  const { spacing } = useTheme();
  const state = useLiftPageState({ week, storageUnit, displayUnit: displayUnitProp, plateSet, tm });
  const openProgress = () => goTo.progress(router, lift);
  const lastTrained = useLastCompletedSessionForLift(lift);

  // DayPreviewSheet state — which day of the CURRENT cycle is being previewed.
  // `null` = closed. The session id (mini-receipt) is resolved from the cached
  // progression query for the previewed day; current/future days resolve null.
  const [previewWeek, setPreviewWeek] = useState<Week | null>(null);
  const previewSessionId = useCycleDaySessionId(lift, cycle, previewWeek ?? week);
  const lastTrainedHint =
    !isInProgress && lastTrained.startedAt !== null
      ? `LAST TRAINED ${formatRelativeTime(lastTrained.startedAt).toUpperCase()}`
      : null;

  const pageStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flex: 1,
  };

  // `state.empty` is true whenever `tm == null`, so in the non-empty branch
  // `tm` is guaranteed non-null — narrow it for the ladder (the band wants a
  // concrete number).
  if (state.empty || tm == null) {
    return (
      <Animated.View
        layout={LinearTransition}
        key={lift}
        style={pageStyle}
        testID={`lift-page-${lift}`}
      >
        <LiftPageEyebrow lift={lift} cycle={cycle} isInProgress={isInProgress} />
        <LiftPageTitle lift={lift} onPress={openProgress} />
        <LiftPageEmpty testIDPrefix={`lift-page-${lift}`} />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      layout={LinearTransition}
      key={lift}
      style={pageStyle}
      testID={`lift-page-${lift}`}
    >
      <LiftPageEyebrow lift={lift} cycle={cycle} isInProgress={isInProgress} />
      <LiftPageTitle lift={lift} onPress={openProgress} />
      {week === 4 ? (
        // Test-week callout — testID still uses `deload-callout` to preserve
        // any existing test references; the copy itself shifts to the TM
        // test framing.
        <LiftPageHint testID={`lift-page-${lift}-deload-callout`}>
          TM TEST · VERIFY THE TRAINING MAX
        </LiftPageHint>
      ) : null}
      {lastTrainedHint ? (
        <LiftPageHint testID={`lift-page-${lift}-last-trained`}>{lastTrainedHint}</LiftPageHint>
      ) : null}

      <View style={{ marginTop: spacing.lg }}>
        <TopSetBlock
          weight={state.topWeight}
          unitGlyph={displayUnit(displayUnitProp)}
          reps={state.topSet.reps}
          amrap={!!state.topSet.amrap}
          pctLabel={`${Math.round(state.topSet.pct * 100)}% TM`}
          tmLabel={`TM ${state.tmDisplay} ${displayUnit(displayUnitProp)}`}
          perSide={state.perSide}
          plateVariant="mini"
          bordered
        />
      </View>

      {/* Read-only working-set ladder — the detail of today's prescription,
          adjacent to the hero it expands. Tighter `md` top margin reads as a
          continuation of the hero, not a separate section. Week 4 collapses
          to the single TM-test row. The band reuses its own weight math so
          Home and Today never drift. */}
      <View style={{ marginTop: spacing.md }} testID={`lift-page-${lift}-ladder`}>
        <WorkingSetsBand
          variant="compact"
          sets={week === 4 ? [tmTestSet()] : prescription(week)}
          tm={tm}
          storageUnit={storageUnit}
          renderUnit={displayUnitProp}
          unitGlyph={displayUnit(displayUnitProp)}
          tmInDisplay={state.tmDisplay}
          rowTestIDPrefix={`lift-page-${lift}-ladder-row`}
        />
      </View>

      <CycleStrip currentDay={week} onCellPress={(d) => setPreviewWeek(d)} />

      <View style={{ flex: 1, minHeight: 18 }} />

      <PrimaryPillButton
        onPress={isInProgress ? onResume : onBegin}
        glyph={isInProgress ? '↩' : '→'}
        testID={`lift-page-${lift}-cta`}
      >
        {isInProgress
          ? completedCount > 0 && completedCount < 3
            ? `Resume · set ${completedCount + 1} of 3`
            : 'Resume session'
          : 'Begin session'}
      </PrimaryPillButton>

      {previewWeek !== null ? (
        <DayPreviewSheet
          open
          lift={lift}
          cycle={cycle}
          week={previewWeek}
          storageUnit={storageUnit}
          displayUnit={displayUnitProp}
          tm={tm}
          plateSet={plateSet}
          sessionId={previewSessionId}
          onDismiss={() => setPreviewWeek(null)}
          testID={`lift-page-${lift}-day-preview`}
        />
      ) : null}
    </Animated.View>
  );
}

export type { LiftPageProps };
