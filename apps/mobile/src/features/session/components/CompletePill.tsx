import { useTheme } from '@/design/theme';
import { Pressable, Text as RNText, type TextStyle, type ViewStyle } from 'react-native';

export type CompletePillProps = {
  onPress: () => void;
};

/**
 * Filled "Complete session" pill rendered as the right-side action on
 * session top-bars. Reverse-contrast vs. `CancelPill`: ink-0 fill with
 * paper text.
 */
export function CompletePill({ onPress }: CompletePillProps) {
  const { colors, type } = useTheme();
  const pillStyle: ViewStyle = {
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 28,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.ink0,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const textStyle: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 10,
    letterSpacing: 2.2,
    color: colors.bg0,
    textTransform: 'uppercase',
  };
  return (
    <Pressable
      testID="session-complete"
      accessibilityRole="button"
      accessibilityLabel="Complete session"
      onPress={onPress}
      style={pillStyle}
    >
      <RNText style={textStyle}>Complete session</RNText>
    </Pressable>
  );
}
