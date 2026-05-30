import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { useEffect } from 'react';
import { Text as RNText, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { PAPER_28, PAPER_45, PAPER_55 } from '../PRCertificate/paperTints';

// Always mounted (even when not visible) so its layout box is reserved from the first render —
// prevents justifyContent:center from shifting the celebration upward when this row appears.
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
    return () => {
      cancelAnimation(progress);
    };
  }, [visible, delayMs, progress]);
  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * -ENTRY_OFFSET_PX }],
  }));
}

function useFadeOpacityStyle(visible: boolean) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: ENTRY_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    return () => {
      cancelAnimation(progress);
    };
  }, [visible, progress]);
  return useAnimatedStyle(() => ({ opacity: progress.value }));
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
  const borderStyle = useFadeOpacityStyle(visible);

  return (
    <>
      {/* Hairline above the comparison row. Always in the layout (1px
       * tall) so the body's centered content doesn't shift when the
       * border reveals; opacity is driven by `visible` so the border
       * only paints once phase reaches 'final'. */}
      <Animated.View
        style={[
          borderStyle,
          {
            marginTop: spacing.md,
            height: 1,
            backgroundColor: PAPER_28,
          },
        ]}
      />
      <View
        style={{
          paddingTop: spacing.md,
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
                // rn-line-height-ok: numeric delta value (e.g. "+12") only
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
    </>
  );
}
