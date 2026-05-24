/**
 * Per-lift content body on Home. Reanimated `LinearTransition` animates
 * layout when the selected lift changes (swap-out → swap-in feels like a
 * smooth strip, not a hard cut).
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/LiftPage.tsx`.
 * Empty state (no TM for this lift): replaces TopSet / CycleStrip / LiftStats
 * with a "NO TRAINING MAX SET" strip pointing at onboarding.
 */
import { useLastCompletedSessionForLift } from '@/data/queries/useLastCompletedSessionForLift';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import { formatRelativeTime } from '@/domain/relativeTime';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useLiftPageState } from '../../hooks/useLiftPageState';
import { CycleStrip } from '../CycleStrip';
import { LiftStats } from '../LiftStats';
import { LiftPageEmpty } from './LiftPageEmpty';
import { LiftPageEyebrow } from './LiftPageEyebrow';
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
  onBegin: () => void;
  onResume: () => void;
  onOpenPlan: () => void;
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
  onBegin,
  onResume,
  onOpenPlan,
}: LiftPageProps) {
  const { spacing } = useTheme();
  const state = useLiftPageState({ week, storageUnit, displayUnit: displayUnitProp, plateSet, tm });
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
        <LiftPageTitle lift={lift} />
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
      <LiftPageTitle lift={lift} />
      {week === 4 ? (
        <CapsLabel
          size="xs"
          color="ink3"
          style={{ marginTop: spacing.sm, letterSpacing: 1.62 }}
          testID={`lift-page-${lift}-deload-callout`}
        >
          DELOAD WEEK · EASE OFF, BUILD THE NEXT CYCLE
        </CapsLabel>
      ) : null}
      {lastTrainedHint ? (
        <CapsLabel
          size="xs"
          color="ink3"
          style={{ marginTop: spacing.sm, letterSpacing: 1.62 }}
          testID={`lift-page-${lift}-last-trained`}
        >
          {lastTrainedHint}
        </CapsLabel>
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
          bestE1RM={bestE1RM}
          cycle={cycle}
        />
      </View>

      <View style={{ flex: 1, minHeight: 18 }} />

      <PrimaryPillButton
        onPress={isInProgress ? onResume : onBegin}
        glyph={isInProgress ? '↩' : '→'}
        testID={`lift-page-${lift}-cta`}
      >
        {isInProgress ? 'Resume session' : 'Begin session'}
      </PrimaryPillButton>

      <Pressable
        onPress={onOpenPlan}
        testID={`lift-page-${lift}-open-plan`}
        accessibilityRole="button"
        accessibilityLabel={`See the full ${liftDisplayName(lift)} session`}
        style={{ paddingVertical: spacing.sm, marginTop: spacing.md, alignItems: 'center' }}
      >
        <CapsLabel weight="semibold" style={{ textAlign: 'center' }}>
          SEE FULL SESSION →
        </CapsLabel>
      </Pressable>
    </Animated.View>
  );
}

export type { LiftPageProps };
