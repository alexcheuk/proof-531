import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { Text as RNText, View } from 'react-native';
import { PAPER_28, PAPER_55 } from '../PRCertificate/paperTints';

/**
 * The "eyebrow + e1RM number + unit" block on the PR celebration
 * screen.
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
 *   - `hideTopBorder` — skip rendering the hairline above the eyebrow.
 *     The screen renders a non-scaled border externally so the scale
 *     animation on this block doesn't push the border off the screen.
 *
 * The comparison row ("Previous best · Stronger by +X") moved to its
 * own component (`PrCelebrationComparison`) so it can live outside
 * the scaled wrapper.
 */
export type PrCelebrationNumbersProps = {
  e1RMDisplay: number;
  unitGlyph: string;
  /** Override the eyebrow caption. */
  eyebrowOverride?: string;
  /** Override the formatted display value. */
  valueOverride?: string;
  /** Skip rendering the hairline above the eyebrow (caller renders it externally). */
  hideTopBorder?: boolean;
};

export const PR_CELEBRATION_FINAL_EYEBROW = 'NEW ESTIMATED 1RM';

export function PrCelebrationNumbers({
  e1RMDisplay,
  unitGlyph,
  eyebrowOverride,
  valueOverride,
  hideTopBorder,
}: PrCelebrationNumbersProps) {
  const { colors, spacing, type } = useTheme();

  const eyebrow = eyebrowOverride ?? PR_CELEBRATION_FINAL_EYEBROW;
  const valueText = valueOverride ?? formatWeight(e1RMDisplay);

  return (
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
            // rn-line-height-ok: numeric e1RM display only
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
  );
}
