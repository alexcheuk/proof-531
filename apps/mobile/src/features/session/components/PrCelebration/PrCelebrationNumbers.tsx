import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { Text as RNText, View } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import { PAPER_28, PAPER_45, PAPER_55 } from '../PRCertificate/paperTints';

/**
 * The bordered "current 1RM + prior best + delta" block that lives
 * under the hero on the full-screen PR celebration.
 *
 * Two cascading fade-ins (current row at +220ms, comparison at +320ms)
 * so the data appears after the hero lands. `hasComparison` is false
 * the first time a user PRs a lift (no prior best to strike through);
 * in that case we render only the e1RM row.
 */
export type PrCelebrationNumbersProps = {
  liftLower: string;
  e1RMDisplay: number;
  prevE1RMDisplay: number;
  e1RMDelta: number;
  unitGlyph: string;
  hasComparison: boolean;
};

export function PrCelebrationNumbers({
  liftLower,
  e1RMDisplay,
  prevE1RMDisplay,
  e1RMDelta,
  unitGlyph,
  hasComparison,
}: PrCelebrationNumbersProps) {
  const { colors, spacing, type } = useTheme();

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(140).delay(220).easing(Easing.out(Easing.cubic))}
        style={{
          marginTop: spacing.xl,
          paddingTop: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: PAPER_28,
        }}
        testID="pr-celebration-numbers"
      >
        <RNText
          style={{
            fontFamily: `${type.mono}-Medium`,
            fontSize: 10,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: PAPER_55,
          }}
        >
          {`${liftLower.toUpperCase()} · ESTIMATED 1RM`}
        </RNText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
          <RNText
            style={{
              fontFamily: `${type.display}-Bold`,
              fontSize: 64,
              lineHeight: 70,
              letterSpacing: -2.2,
              color: colors.bg0,
            }}
            testID="pr-celebration-e1rm"
          >
            {formatWeight(e1RMDisplay)}
          </RNText>
          <RNText
            style={{
              fontFamily: `${type.mono}-Bold`,
              fontSize: 13,
              letterSpacing: 2.6,
              textTransform: 'uppercase',
              color: colors.bg0,
              marginLeft: spacing.sm,
            }}
          >
            {unitGlyph}
          </RNText>
        </View>
      </Animated.View>

      {hasComparison ? (
        <Animated.View
          entering={FadeIn.duration(140).delay(320).easing(Easing.out(Easing.cubic))}
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
          <View>
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
          </View>
          <View style={{ alignItems: 'flex-end' }}>
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
          </View>
        </Animated.View>
      ) : null}
    </>
  );
}
