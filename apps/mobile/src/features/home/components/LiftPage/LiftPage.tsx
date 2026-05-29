import { useLastCompletedSessionForLift } from '@/data/queries/useLastCompletedSessionForLift';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SecondaryLink } from '@/design/primitives/SecondaryLink';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import { formatRelativeTime } from '@/domain/relativeTime';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { convert, displayUnit } from '@/domain/units';
/**
 * Per-lift content body on Home. Reanimated `LinearTransition` animates
 * layout when the selected lift changes (swap-out → swap-in feels like a
 * smooth strip, not a hard cut).
 *
 * Empty state (no TM for this lift): replaces TopSet / CycleStrip / LiftStats
 * with a "NO TRAINING MAX SET" strip pointing at onboarding.
 */
import { goTo } from '@/lib/routes';
import { useRouter } from 'expo-router';
import { View, type ViewStyle } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useLiftPageState } from '../../hooks/useLiftPageState';
import { CycleStrip } from '../CycleStrip';
import { LiftStats } from '../LiftStats';
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
  bestE1RM: number | null;
  isInProgress: boolean;
  /**
   * Number of working/AMRAP sets logged for this lift's active session.
   * Only consulted when `isInProgress` is true — drives the
   * "Resume · set N of 3" CTA copy so users see exactly where they are
   * before tapping in. Defaults to 0.
   */
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
  bestE1RM,
  isInProgress,
  completedCount = 0,
  onBegin,
  onResume,
}: LiftPageProps) {
  const router = useRouter();
  const { spacing } = useTheme();
  const state = useLiftPageState({ week, storageUnit, displayUnit: displayUnitProp, plateSet, tm });
  const bestE1RMDisplay = bestE1RM != null ? convert(bestE1RM, storageUnit, displayUnitProp) : null;
  const openProgress = () => goTo.progress(router, lift);
  const lastTrained = useLastCompletedSessionForLift(lift);
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

  if (state.empty) {
    return (
      <Animated.View
        layout={LinearTransition}
        key={lift}
        style={pageStyle}
        testID={`lift-page-${lift}`}
      >
        <LiftPageEyebrow lift={lift} cycle={cycle} week={week} isInProgress={isInProgress} />
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
      <LiftPageEyebrow lift={lift} cycle={cycle} week={week} isInProgress={isInProgress} />
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

      <CycleStrip currentWeek={week} />

      <View style={{ marginTop: spacing.lg }}>
        <LiftStats
          tmValue={state.tmDisplay}
          tmUnit={displayUnitProp}
          bestE1RM={bestE1RMDisplay}
          cycle={cycle}
        />
      </View>

      <SecondaryLink
        onPress={openProgress}
        testID={`lift-page-${lift}-see-progress`}
        accessibilityLabel={`See ${liftDisplayName(lift)} progress`}
      >
        SEE PROGRESS →
      </SecondaryLink>

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
    </Animated.View>
  );
}

export type { LiftPageProps };
