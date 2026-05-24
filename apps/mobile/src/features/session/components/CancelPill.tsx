import { useTheme } from '@/design/theme';
import { Pressable, Text as RNText, type TextStyle, type ViewStyle } from 'react-native';

export type CancelPillProps = {
  onPress: () => void;
};

/**
 * Outlined "Cancel" pill rendered as the right-side action on session
 * top-bars. Splits out of `SessionTopBar` so the bar's render reads as
 * a composition of named pills.
 */
export function CancelPill({ onPress }: CancelPillProps) {
  const { colors, type } = useTheme();
  const pillStyle: ViewStyle = {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 28,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const textStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    color: colors.ink0,
    textTransform: 'uppercase',
  };
  return (
    <Pressable
      testID="session-cancel"
      accessibilityRole="button"
      accessibilityLabel="Cancel session"
      onPress={onPress}
      style={pillStyle}
    >
      <RNText style={textStyle}>Cancel</RNText>
    </Pressable>
  );
}
