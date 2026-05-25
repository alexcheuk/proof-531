import { useTheme } from '@/design/theme';
import { Pressable, Text as RNText, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Outlined "Restart" pill on the session top bar. Distinct from Cancel
 * (which closes the session entirely) — Restart wipes the in-progress
 * session's set logs and drops the user back at set 1.
 *
 * Same visual mass as `CancelPill` / `UndoPill` so they line up.
 */
export type ResetPillProps = {
  onPress: () => void;
};

export function ResetPill({ onPress }: ResetPillProps) {
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
      testID="session-reset"
      accessibilityRole="button"
      accessibilityLabel="Restart session from set 1"
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      style={pillStyle}
    >
      <RNText style={textStyle}>↺ Restart</RNText>
    </Pressable>
  );
}
