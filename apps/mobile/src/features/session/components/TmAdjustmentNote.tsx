import { useTheme } from '@/design/theme';
import type { TmAdjustmentSuggestion } from '@/domain/progression';
import type { Unit } from '@/domain/types';
import { displayUnit, round } from '@/domain/units';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type TmAdjustmentNoteProps = {
  /** The suggestion derived from `tmAdjustmentSuggestion(reps, lift, unit)`. */
  suggestion: TmAdjustmentSuggestion;
  /** Current TM in display units — drives the reset target on the reset variant. */
  tmDisplay: number;
  unit: Unit;
  onPress: () => void;
  testID?: string;
};

/**
 * "Suggested TM · next cycle" pressable note shown on Week-4 Session Complete
 * in place of the AMRAP-week `AdjustTmCta`. Same visual chassis (bordered
 * Pressable, ink/paper, no color); three content variants:
 *
 *   increment → "+5 lb"                     (delta in lift's unit)
 *   hold      → "Hold"
 *   reset     → "−10% · reset to <Y> <unit>"
 *
 * Critical: this never auto-applies the change. The brief is emphatic that
 * the lifter is the decision-maker. The Pressable routes to Settings →
 * Training Max so the user types the new value themselves.
 */
export function TmAdjustmentNote({
  suggestion,
  tmDisplay,
  unit,
  onPress,
  testID = 'session-complete-tm-adjustment',
}: TmAdjustmentNoteProps) {
  const { colors, spacing, type } = useTheme();

  const ctaStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md + 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const eyebrowStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: 4,
  };
  const valueStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 17,
    letterSpacing: -0.34,
    color: colors.ink0,
  };
  const captionStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginTop: 4,
  };
  const chevronStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 16,
    color: colors.ink0,
  };

  const u = displayUnit(unit);
  const { value, a11yValue } = (() => {
    if (suggestion.kind === 'increment') {
      const label = `+${suggestion.delta} ${u}`;
      return { value: label, a11yValue: `Increase by ${suggestion.delta} ${u}` };
    }
    if (suggestion.kind === 'hold') {
      return { value: 'Hold', a11yValue: 'Hold the current training max' };
    }
    const resetTm = round(tmDisplay * suggestion.resetPct, unit);
    return {
      value: `−10% · reset to ${resetTm} ${u}`,
      a11yValue: `Reset by 10 percent to ${resetTm} ${u}`,
    };
  })();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Suggested training max change: ${a11yValue}. Tap to open settings.`}
      accessibilityHint="Opens the training max section of settings."
      onPress={onPress}
      style={({ pressed }) => [ctaStyle, pressed ? { opacity: 0.6 } : null]}
    >
      <View>
        <RNText style={eyebrowStyle}>Suggested TM · next cycle</RNText>
        <RNText style={valueStyle} testID="tm-adjustment-value">
          {value}
        </RNText>
        <RNText style={captionStyle}>Your call — open settings to apply</RNText>
      </View>
      <RNText style={chevronStyle}>›</RNText>
    </Pressable>
  );
}
