import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { Text as RNText, View } from 'react-native';
import Animated, { Easing, FadeInLeft } from 'react-native-reanimated';
import { PAPER_28, PAPER_45, PAPER_55 } from '../PRCertificate/paperTints';

/**
 * The bordered "current 1RM + prior best + delta" block that lives
 * under the hero on the PR celebration screen.
 *
 * Composition slots so the screen orchestrator can drive the intro
 * sequence in place (rather than through a parallel overlay):
 *
 *   - `eyebrowOverride` — replaces the default "NEW ESTIMATED 1RM"
 *     caps line. Used to show "PREVIOUS BEST" during the intro
 *     typewriter and the in-flight backspace+retype to "NEW ESTIMATED
 *     1RM" during tick-up.
 *   - `valueOverride` — replaces the formatted e1RM number. Used to
 *     show the prior-best value and the in-flight count-up value.
 *   - `hideComparison` — keeps the comparison row out of the tree
 *     during the intro phases (it's only revealed once the count-up
 *     settles).
 *   - `hideTopBorder` — skip rendering the hairline above the eyebrow.
 *     The screen renders a non-scaled border externally so the scale
 *     animation on this block doesn't push the border off the screen.
 *
 * The default behaviour (no overrides) is the final state of the
 * celebration — "NEW ESTIMATED 1RM" + e1RM + comparison row.
 *
 * The comparison-row metrics ("Previous best", "Stronger by") use a
 * staggered `FadeInLeft` entry so they animate in left-to-right when
 * the row mounts rather than popping in.
 */
export type PrCelebrationNumbersProps = {
  e1RMDisplay: number;
  prevE1RMDisplay: number;
  e1RMDelta: number;
  unitGlyph: string;
  hasComparison: boolean;
  /** Override the eyebrow caption. */
  eyebrowOverride?: string;
  /** Override the formatted display value. */
  valueOverride?: string;
  /** Force-hide the comparison row even when `hasComparison` is true. */
  hideComparison?: boolean;
  /** Skip rendering the hairline above the eyebrow (caller renders it externally). */
  hideTopBorder?: boolean;
};

export const PR_CELEBRATION_FINAL_EYEBROW = 'NEW ESTIMATED 1RM';

export function PrCelebrationNumbers({
  e1RMDisplay,
  prevE1RMDisplay,
  e1RMDelta,
  unitGlyph,
  hasComparison,
  eyebrowOverride,
  valueOverride,
  hideComparison,
  hideTopBorder,
}: PrCelebrationNumbersProps) {
  const { colors, spacing, type } = useTheme();

  const eyebrow = eyebrowOverride ?? PR_CELEBRATION_FINAL_EYEBROW;
  const valueText = valueOverride ?? formatWeight(e1RMDisplay);
  const showComparison = hasComparison && !hideComparison;

  return (
    <>
      <View
        style={{
          paddingTop: spacing.lg,
          ...(hideTopBorder
            ? null
            : {
                marginTop: spacing.xl,
                borderTopWidth: 1,
                borderTopColor: PAPER_28,
              }),
        }}
        testID="pr-celebration-numbers"
      >
        <RNText
          style={{
            fontFamily: `${type.mono}-Medium`,
            fontSize: 10,
            lineHeight: 14,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: PAPER_55,
          }}
          testID="pr-celebration-eyebrow"
        >
          {eyebrow.length > 0 ? eyebrow : ' '}
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
            {valueText}
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
      </View>

      {showComparison ? (
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
          <Animated.View entering={FadeInLeft.duration(360).easing(Easing.out(Easing.cubic))}>
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
          <Animated.View
            style={{ alignItems: 'flex-end' }}
            entering={FadeInLeft.duration(360).delay(140).easing(Easing.out(Easing.cubic))}
          >
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
      ) : null}
    </>
  );
}
