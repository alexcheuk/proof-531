import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import { Pressable, type ViewStyle } from 'react-native';

export type TopBarPillVariant = 'outlined' | 'filled';

export type TopBarPillProps = {
  label: string;
  glyph?: string | undefined;
  variant?: TopBarPillVariant;
  onPress: () => void;
  testID: string;
  accessibilityLabel: string;
  accessibilityHint?: string | undefined;
};

export function TopBarPill({
  label,
  glyph,
  variant = 'outlined',
  onPress,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: TopBarPillProps) {
  const { colors } = useTheme();
  const filled = variant === 'filled';
  const pillStyle: ViewStyle = {
    paddingHorizontal: filled ? 14 : 12,
    paddingVertical: 6,
    minHeight: 28,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: filled ? colors.ink0 : colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const handlePress = () => {
    // expo-haptics throws on unsupported platforms (e.g. web preview).
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // best-effort
    }
    onPress();
  };
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...(accessibilityHint ? { accessibilityHint } : {})}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      style={pillStyle}
    >
      <Text
        variant="mono"
        weight={filled ? 'bold' : 'semibold'}
        size={10}
        color={filled ? 'bg0' : 'ink0'}
        style={{ letterSpacing: 2.2, textTransform: 'uppercase' }}
      >
        {glyph ? `${glyph} ${label}` : label}
      </Text>
    </Pressable>
  );
}
