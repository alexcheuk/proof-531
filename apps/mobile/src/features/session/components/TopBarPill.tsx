import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import { Pressable, Text as RNText, type TextStyle, type ViewStyle } from 'react-native';

export type TopBarPillVariant = 'outlined' | 'filled';

export type TopBarPillProps = {
  label: string;
  /** Optional leading glyph rendered tight against the label. */
  glyph?: string | undefined;
  variant?: TopBarPillVariant;
  onPress: () => void;
  testID: string;
  accessibilityLabel: string;
  /** Optional screen-reader hint describing what tapping the pill does. */
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
  const { colors, type } = useTheme();
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
  const textStyle: TextStyle = {
    fontFamily: `${type.mono}-${filled ? 'Bold' : 'SemiBold'}`,
    fontSize: 10,
    letterSpacing: 2.2,
    color: filled ? colors.bg0 : colors.ink0,
    textTransform: 'uppercase',
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
      <RNText style={textStyle}>{glyph ? `${glyph} ${label}` : label}</RNText>
    </Pressable>
  );
}
