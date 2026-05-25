import { useTheme } from '@/design/theme';
import { Pressable, Text as RNText, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Tiny outlined "↶ UNDO" pill rendered on the session top-bar during the
 * rest phase, so the user can roll back the most recent working set
 * without scrolling to find the undo affordance further down the screen.
 *
 * Visual contract mirrors `CancelPill` (same height + border treatment)
 * so the two pills sit cleanly side-by-side.
 */
export type UndoPillProps = {
  onPress: () => void;
};

export function UndoPill({ onPress }: UndoPillProps) {
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
      testID="session-undo"
      accessibilityRole="button"
      accessibilityLabel="Undo the most recent working set"
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      style={pillStyle}
    >
      <RNText style={textStyle}>↶ Undo</RNText>
    </Pressable>
  );
}
