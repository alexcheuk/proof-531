import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Text } from '@/design/primitives/Text';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import { decompose } from '@/domain/plates';
import { prescription } from '@/domain/schemes';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { convert, displayUnit, round } from '@/domain/units';
/**
 * Per-lift content body on Home. Reanimated `LinearTransition` animates
 * layout when the selected lift changes (swap-out → swap-in feels like a
 * smooth strip, not a hard cut).
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/LiftPage.tsx`.
 * The PWA renders inside a CSS scroll-snap carousel; the RN port renders a
 * single page at a time keyed on `lift` and lets Reanimated tween the
 * resulting layout swap.
 *
 * Empty state (no TM for this lift): replaces TopSet/CycleStrip/LiftStats
 * with a "NO TRAINING MAX SET" strip and a CTA pointing the user back at
 * onboarding so a TM can be set.
 */
import { useRouter } from 'expo-router';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
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

  const sets = prescription(week);
  const topSet = sets[2];

  const pageStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flex: 1,
  };

  // Eyebrow — "Cycle N · Day W" on the left, "In progress" on the right
  // (only when a session is actively running for this lift).
  const eyebrow = (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
      }}
    >
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
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          testID={`lift-page-${lift}-in-progress`}
        >
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
        </View>
      ) : null}
    </View>
  );

  // Title — typographic, e-ink heavy.
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
      <Text
        variant="sans"
        weight="bold"
        size={64}
        color="amber"
        style={{
          lineHeight: 74,
        }}
      >
        .
      </Text>
    </Text>
  );

  // Empty state — no TM yet.
  if (tm == null || topSet == null) {
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

  // Snap in storage units, then convert for render. This keeps the snap to
  // the storage step (5 lb / 2.5 kg of the underlying TM row) while letting
  // the user see the number in whichever unit Settings currently picks.
  const topWeightStorage = round(tm * topSet.pct, storageUnit);
  const topWeight = convert(topWeightStorage, storageUnit, displayUnitProp);
  const tmDisplay = convert(tm, storageUnit, displayUnitProp);

  // Decompose plates against the display weight under the configured plate set.
  const decomposed = decompose(topWeight, plateSet);

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
          weight={topWeight}
          unitGlyph={displayUnit(displayUnitProp)}
          reps={topSet.reps}
          amrap={!!topSet.amrap}
          pctLabel={`${Math.round(topSet.pct * 100)}% TM`}
          tmLabel={`TM ${tmDisplay} ${displayUnit(displayUnitProp)}`}
          perSide={decomposed.perSide}
          plateVariant="mini"
          bordered
        />
      </View>

      <CycleStrip currentWeek={week} />

      <View style={{ marginTop: spacing.lg }}>
        <LiftStats tmValue={tmDisplay} tmUnit={displayUnitProp} bestE1RM={bestE1RM} cycle={cycle} />
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
        style={{ paddingVertical: spacing.sm, marginTop: spacing.md, alignItems: 'center' }}
      >
        <Text
          variant="mono"
          weight="semibold"
          size={10}
          color="ink2"
          style={{ textTransform: 'uppercase', letterSpacing: 2.2, textAlign: 'center' }}
        >
          {/* eslint-disable-next-line */}
          SEE FULL SESSION →
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export type { LiftPageProps };
