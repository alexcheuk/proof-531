/**
 * Per-lift content body on Home. Reanimated `LinearTransition` animates
 * layout when the selected lift changes (swap-out → swap-in feels like a
 * smooth strip, not a hard cut).
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/LiftPage.tsx`.
 * Empty state (no TM for this lift): replaces TopSet / CycleStrip / LiftStats
 * with a "NO TRAINING MAX SET" strip pointing at onboarding.
 */
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { useRouter } from 'expo-router';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useLiftPageState } from '../hooks/useLiftPageState';
import { CycleStrip } from './CycleStrip';
import { LiftStats } from './LiftStats';

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
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const state = useLiftPageState({ week, storageUnit, displayUnit: displayUnitProp, plateSet, tm });

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
      <Text
        variant="mono"
        weight="semibold"
        size={10}
        color="ink2"
        style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
      >
        Cycle {cycle} · Day {week}
      </Text>
      {isInProgress ? (
        <Row gap="xs" testID={`lift-page-${lift}-in-progress`}>
          <View style={{ width: 6, height: 6, backgroundColor: colors.ink0 }} />
          <Text
            variant="mono"
            weight="bold"
            size={9}
            color="ink0"
            style={{ textTransform: 'uppercase', letterSpacing: 1.98 }}
          >
            In progress
          </Text>
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
        <View
          style={{
            marginTop: spacing.xl,
            paddingVertical: spacing.xl,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.line,
            alignItems: 'center',
          }}
        >
          <Text
            variant="mono"
            weight="semibold"
            size={11}
            color="ink2"
            style={{ textTransform: 'uppercase', letterSpacing: 1.98 }}
          >
            NO TRAINING MAX SET
          </Text>
          <Pressable
            onPress={() => router.push('/onboarding')}
            testID={`lift-page-${lift}-open-settings`}
            accessibilityRole="button"
            accessibilityLabel="Open onboarding to set a training max"
            style={{
              marginTop: spacing.md,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              backgroundColor: colors.ink0,
            }}
          >
            <Text
              variant="sans"
              weight="bold"
              size={13}
              color="bg0"
              style={{ textTransform: 'uppercase', letterSpacing: 0.78 }}
            >
              Open settings →
            </Text>
          </Pressable>
        </View>
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
        <Text
          variant="mono"
          weight="semibold"
          size={10}
          color="ink2"
          style={{ textTransform: 'uppercase', letterSpacing: 2.2, textAlign: 'center' }}
        >
          SEE FULL SESSION →
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export type { LiftPageProps };
