import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { useEffect } from 'react';
import { Text as RNText, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { PAPER_28, PAPER_45, PAPER_55 } from '../PRCertificate/paperTints';

/**
 * The "Previous best (struck through) · Stronger by +X" comparison row
 * shown below the e1RM block on the PR celebration screen.
 *
 * Extracted from `PrCelebrationNumbers` so it can live outside the
 * scaled wrapper that emphasises the numbers block — keeps the
 * separator hairline and the metric blocks at their natural 1× size
 * while the e1RM number above them is being typewriter-revealed at
 * 1.25× emphasis. The row is also always mounted regardless of
 * `visible`, so its layout box is reserved from the first render and
 * the body's `justifyContent: center` doesn't shift the rest of the
 * celebration upward when this row first appears.
 *
 * Entrance: each metric block fades in from a small left offset with
 * a stagger between them. Driven by shared-value progress rather than
 * Reanimated's `entering` so the animation can be triggered on phase
 * change rather than mount.
 */
export type PrCelebrationComparisonProps = {
  prevE1RMDisplay: number;
  e1RMDelta: number;
  unitGlyph: string;
  /** True once the orchestrator wants the row to reveal itself. */
  visible: boolean;
};

const ENTRY_DURATION_MS = 360;
const ENTRY_OFFSET_PX = 20;
const STAGGER_MS = 140;

function useLeftEntryStyle(visible: boolean, delayMs: number) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (visible) {
      progress.value = withDelay(
        delayMs,
        withTiming(1, {
          duration: ENTRY_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        }),
      );
    } else {
      progress.value = 0;
    }
  }, [visible, delayMs, progress]);
  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * -ENTRY_OFFSET_PX }],
  }));
}

export function PrCelebrationComparison({
  prevE1RMDisplay,
  e1RMDelta,
  unitGlyph,
  visible,
}: PrCelebrationComparisonProps) {
  const { colors, spacing, type } = useTheme();

  const prevStyle = useLeftEntryStyle(visible, 0);
  const deltaStyle = useLeftEntryStyle(visible, STAGGER_MS);

  return (
    <View
      style={{
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: PAPER_28,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}
    >
      <Animated.View style={prevStyle}>
        <RNText
          style={{
            fontFamily: `${type.mono}-SemiBold`,
            fontSize: 9,
            letterSpacing: 1.98,
            textTransform: 'uppercase',
            color: PAPER_55,
            marginBottom: 4,
          }}
        >
          Previous best
        </RNText>
        <RNText
          style={{
            fontFamily: `${type.display}-Medium`,
            fontSize: 22,
            color: PAPER_45,
            letterSpacing: -0.44,
            textDecorationLine: 'line-through',
            textDecorationColor: PAPER_45,
          }}
          testID="pr-celebration-prev"
        >
          {`${formatWeight(prevE1RMDisplay)} ${unitGlyph}`}
        </RNText>
      </Animated.View>
      <Animated.View style={[{ alignItems: 'flex-end' }, deltaStyle]}>
        <RNText
          style={{
            fontFamily: `${type.mono}-SemiBold`,
            fontSize: 9,
            letterSpacing: 1.98,
            textTransform: 'uppercase',
            color: PAPER_55,
            marginBottom: 4,
          }}
        >
          Stronger by
        </RNText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <RNText
            style={{
              fontFamily: `${type.display}-Bold`,
              fontSize: 32,
              lineHeight: 32,
              letterSpacing: -0.96,
              color: colors.bg0,
            }}
            testID="pr-celebration-delta"
          >
            {`+${formatWeight(e1RMDelta)}`}
          </RNText>
          <RNText
            style={{
              fontFamily: `${type.mono}-Bold`,
              fontSize: 11,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: colors.bg0,
              marginLeft: 4,
            }}
          >
            {unitGlyph}
          </RNText>
        </View>
      </Animated.View>
    </View>
  );
}
