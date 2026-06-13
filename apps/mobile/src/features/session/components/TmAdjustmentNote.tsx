import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { TmAdjustmentSuggestion } from '@/domain/progression';
import type { Unit } from '@/domain/types';
import { displayUnit, round } from '@/domain/units';
import { Pressable, View, type ViewStyle } from 'react-native';

export type TmAdjustmentNoteProps = {
  suggestion: TmAdjustmentSuggestion;
  /** Current TM in display units  -  drives the reset target on the reset variant. */
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
  const { colors, spacing } = useTheme();

  const isInverted = suggestion.kind === 'increment';
  const isAmber = suggestion.kind === 'reset';
  const hasDarkBg = isInverted || isAmber;

  const bgColor = isInverted ? colors.ink0 : isAmber ? colors.amber : undefined;
  const borderColor = hasDarkBg ? 'transparent' : colors.lineStrong;
  const contentColorToken = hasDarkBg ? ('paper' as const) : ('ink0' as const);

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
        <CapsLabel
          size="sm"
          weight="semibold"
          color={hasDarkBg ? 'paperMuted' : 'ink2'}
          style={{ marginBottom: 4 }}
        >
          Suggested TM · next cycle
        </CapsLabel>
        <Text
          variant="sans"
          weight="bold"
          size={17}
          color={contentColorToken}
          style={{ letterSpacing: -0.34 }}
          testID="tm-adjustment-value"
        >
          {value}
        </Text>
        <CapsLabel size="xs" color={hasDarkBg ? 'paperMuted' : 'ink3'} style={{ marginTop: 4 }}>
          Tap to apply
        </CapsLabel>
      </View>
      <Text variant="mono" weight="semibold" size={16} color={contentColorToken}>
        ›
      </Text>
    </Pressable>
  );
}
