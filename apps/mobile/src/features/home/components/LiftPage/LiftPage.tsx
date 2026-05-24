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
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
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

const TITLE_SIZE = 64;
// PWA `tracking-[-0.04em]` × 64px = -2.56 letter spacing.
const TITLE_LETTER_SPACING = -2.56;
// PWA `leading-[0.92]` ≈ 0.92 * 64 ≈ 58.88; RN clips descenders on tight
// line heights, so we bump to 74 (matches the spec note in the plan).
const TITLE_LINE_HEIGHT = 74;

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
  const { colors, spacing } = useTheme();
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

  // Eyebrow — "Cycle N · Day W" on the left, "In progress" on the right
  // (only when a session is actively running for this lift).
  const eyebrow = (
    <Row justify="space-between" gap="sm">
      <CapsLabel weight="semibold">{`Cycle ${cycle} · Day ${week}`}</CapsLabel>
      {isInProgress ? (
        <Row gap="xs" testID={`lift-page-${lift}-in-progress`}>
          <View style={{ width: 6, height: 6, backgroundColor: colors.ink0 }} />
          <CapsLabel size="xs" weight="bold" color="ink0" style={{ letterSpacing: 1.98 }}>
            In progress
          </CapsLabel>
        </Row>
      ) : null}
    </Row>
  );

  const title = (
    <Text
      variant="sans"
      weight="bold"
      size={TITLE_SIZE}
      color="ink0"
      style={{
        lineHeight: TITLE_LINE_HEIGHT,
        letterSpacing: TITLE_LETTER_SPACING,
        marginTop: spacing.md,
      }}
    >
      {liftDisplayName(lift)}
      <Text variant="sans" weight="bold" size={64} color="amber" style={{ lineHeight: 74 }}>
        .
      </Text>
    </Text>
  );

  if (state.empty) {
    return (
      <Animated.View
        layout={LinearTransition}
        key={lift}
        style={pageStyle}
        testID={`lift-page-${lift}`}
      >
        {eyebrow}
        {title}
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
      {eyebrow}
      {title}
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
