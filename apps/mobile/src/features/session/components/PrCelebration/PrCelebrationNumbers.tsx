import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { Text as RNText, View } from 'react-native';
import { PAPER_28, PAPER_55 } from '../PRCertificate/paperTints';

export type PrCelebrationNumbersProps = {
  e1RMDisplay: number;
  unitGlyph: string;
  /** Overrides "NEW ESTIMATED 1RM" — used by the intro sequence for "PREVIOUS BEST" and the backspace→retype transition. */
  eyebrowOverride?: string;
  /** Overrides the formatted e1RM number — used for the prior-best and count-up values during intro. */
  valueOverride?: string;
  /** The caller renders the border externally so scale animation on this block doesn't push it off-screen. */
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
