import * as Haptics from 'expo-haptics';
import { type ReactNode, useCallback } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useDebouncedPress } from '../hooks/useDebouncedPress';
import { useTheme } from '../theme';
import { Text } from './Text';

type PrimaryPillButtonProps = {
  onPress: () => void;
  /** Right-side glyph; pass `null` to omit. Defaults to '→'. */
  glyph?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryPillButton({
  onPress,
  glyph = '→',
  disabled = false,
  children,
  testID,
  accessibilityLabel,
  style,
}: PrimaryPillButtonProps) {
  const { colors } = useTheme();
  // Compose haptic + caller's onPress so the debounce wraps both. Stable per
  // (disabled, onPress)  -  the hook resets its gate when this identity swaps,
  // which matches the LiveScreen CTA-position-reuse case.
  const onPressWithHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);
  const handlePress = useDebouncedPress(onPressWithHaptic, { disabled });

  const container: ViewStyle = {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: disabled ? colors.ink3 : colors.ink0,
    borderRadius: 0,
  };
  const showGlyph = glyph !== undefined && glyph !== null;
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[container, style]}
    >
      <Text
        variant="sans"
        weight="semibold"
        size={15}
        color="bg0"
        style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
      >
        {children}
      </Text>
      {showGlyph ? (
        <Text variant="mono" weight="bold" size={13} color="bg0">
          {glyph}
        </Text>
      ) : null}
    </Pressable>
  );
}
