import { useTheme } from '@/design/theme';
import type { TmAdjustmentSuggestion } from '@/domain/progression';
import type { Unit } from '@/domain/types';
import { displayUnit, round } from '@/domain/units';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type TmAdjustmentNoteProps = {
  suggestion: TmAdjustmentSuggestion;
  /** Current TM in display units — drives the reset target on the reset variant. */
  tmDisplay: number;
  unit: Unit;
  onPress: () => void;
  testID?: string;
};

export function TmAdjustmentNote({
  suggestion,
  tmDisplay,
  unit,
  onPress,
  testID = 'session-complete-tm-adjustment',
}: TmAdjustmentNoteProps) {
  const { colors, spacing, type } = useTheme();

  const isInverted = suggestion.kind === 'increment';
  const isAmber = suggestion.kind === 'reset';
  const hasDarkBg = isInverted || isAmber;

  const bgColor = isInverted ? colors.ink0 : isAmber ? colors.amber : undefined;
  const borderColor = hasDarkBg ? 'transparent' : colors.lineStrong;
  const eyebrowColor = hasDarkBg ? colors.paperMuted : colors.ink2;
  const valueColor = hasDarkBg ? colors.paper : colors.ink0;
  const captionColor = hasDarkBg ? colors.paperMuted : colors.ink3;
  const chevronColor = hasDarkBg ? colors.paper : colors.ink0;

  const ctaStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md + 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor,
    backgroundColor: bgColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const eyebrowStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: eyebrowColor,
    marginBottom: 4,
  };
  const valueStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 17,
    letterSpacing: -0.34,
    color: valueColor,
  };
  const captionStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: captionColor,
    marginTop: 4,
  };
  const chevronStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 16,
    color: chevronColor,
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
      accessibilityLabel={`Suggested training max change: ${a11yValue}. Tap to apply.`}
      accessibilityHint="Opens a sheet to apply or dismiss this suggestion."
      onPress={onPress}
      style={({ pressed }) => [ctaStyle, pressed ? { opacity: 0.7 } : null]}
    >
      <View>
        <RNText style={eyebrowStyle}>Suggested TM · next cycle</RNText>
        <RNText style={valueStyle} testID="tm-adjustment-value">
          {value}
        </RNText>
        <RNText style={captionStyle}>Tap to apply</RNText>
      </View>
      <RNText style={chevronStyle}>›</RNText>
    </Pressable>
  );
}
