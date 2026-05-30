import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { View } from 'react-native';
import { PAPER_28 } from '../PRCertificate/paperTints';

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
  const { spacing } = useTheme();

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
      <Text
        variant="mono"
        weight="medium"
        size={10}
        color="paperTint55"
        style={{ lineHeight: 14, letterSpacing: 2, textTransform: 'uppercase' }}
        testID="pr-celebration-eyebrow"
      >
        {eyebrow.length > 0 ? eyebrow : ' '}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
        <Text
          variant="sans"
          weight="bold"
          size={64}
          color="bg0"
          numeric
          style={{
            // rn-line-height-ok: numeric e1RM display only
            lineHeight: 70,
            letterSpacing: -2.2,
          }}
          testID="pr-celebration-e1rm"
        >
          {valueText}
        </Text>
        <Text
          variant="mono"
          weight="bold"
          size={13}
          color="bg0"
          style={{ letterSpacing: 2.6, textTransform: 'uppercase', marginLeft: spacing.sm }}
        >
          {unitGlyph}
        </Text>
      </View>
    </View>
  );
}
