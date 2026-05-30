import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Pressable } from 'react-native';

export function GoalPanelStepper({
  glyph,
  size,
  onPress,
  disabled,
  testID,
}: {
  glyph: '−' | '+';
  size: 'lg' | 'sm';
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}) {
  const { colors } = useTheme();
  const dim = size === 'lg' ? 44 : 28;
  const fontSize = size === 'lg' ? 20 : 14;
  const isDisabled = disabled ?? false;
  const label =
    glyph === '+'
      ? size === 'lg'
        ? 'Increase goal'
        : 'Increase days per week'
      : size === 'lg'
        ? 'Decrease goal'
        : 'Decrease days per week';
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={isDisabled ? { disabled: true } : undefined}
      style={{
        width: dim,
        height: dim,
        borderWidth: 1,
        borderColor: isDisabled ? colors.line : colors.ink0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg0,
      }}
    >
      <Text
        variant="mono"
        weight="bold"
        size={fontSize}
        color={isDisabled ? 'ink3' : 'ink0'}
        style={{ lineHeight: fontSize }}
      >
        {glyph}
      </Text>
    </Pressable>
  );
}
