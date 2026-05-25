import { useTheme } from '@/design/theme';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type AdjustTmCtaProps = {
  /** e1RM delta over the previous best, in display unit (e.g. 12). */
  delta: number;
  /** Display unit glyph — "lb" or "kg". */
  unitGlyph: 'lb' | 'kg';
  onPress: () => void;
  testID?: string;
};

/**
 * "Adjust training max →" CTA shown beneath the PR certificate on the
 * Session Complete screen. Nudges the user to bump their TM when the new
 * estimated 1RM jumped significantly over the previous best.
 */
export function AdjustTmCta({
  delta,
  unitGlyph,
  onPress,
  testID = 'session-complete-adjust-tm',
}: AdjustTmCtaProps) {
  const { colors, spacing, type } = useTheme();

  const ctaStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md + 2,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const labelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink0,
  };
  const subStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginTop: 2,
  };
  const chevronStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 16,
    color: colors.ink0,
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Adjust training max in settings"
      accessibilityHint="Opens settings on the training max section"
      onPress={onPress}
      style={({ pressed }) => [ctaStyle, pressed ? { opacity: 0.6 } : null]}
    >
      <View>
        <RNText style={labelStyle}>Adjust training max</RNText>
        <RNText style={subStyle}>
          e1rm jumped {delta} {unitGlyph} — consider a bump
        </RNText>
      </View>
      <RNText style={chevronStyle}>›</RNText>
    </Pressable>
  );
}
