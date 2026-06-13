// Renders as Pressable when onPress is provided  -  so non-pressable rows don't advertise a tap target to a11y tooling.
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export type LedgerRowProps = {
  first?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  /** Composed accessibility label  -  overrides the auto-derived label. */
  accessibilityLabel?: string;
};

export function LedgerRow({
  first = false,
  disabled = false,
  onPress,
  children,
  testID,
  style,
  accessibilityLabel,
}: LedgerRowProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    paddingVertical: 14,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: first ? colors.lineStrong : colors.line,
  };

  if (onPress && !disabled) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        hitSlop={4}
        {...(accessibilityLabel !== undefined ? { accessibilityLabel } : {})}
        style={[containerStyle, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      accessibilityState={disabled ? { disabled: true } : undefined}
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : {})}
      style={[containerStyle, style]}
    >
      {children}
    </View>
  );
}
