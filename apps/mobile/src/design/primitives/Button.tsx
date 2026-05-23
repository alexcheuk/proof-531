import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import type { Colors } from '../tokens';

export type ButtonVariant = 'default' | 'outline' | 'ghost';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

type ButtonProps = {
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children?: ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const buildVariantStyle = (variant: ButtonVariant, colors: Colors): ViewStyle => {
  const variants: Record<ButtonVariant, ViewStyle> = {
    default: { backgroundColor: colors.primary },
    outline: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: { backgroundColor: 'transparent' },
  };
  return variants[variant];
};

const buildSizeStyle = (size: ButtonSize): ViewStyle => {
  const sizes: Record<ButtonSize, ViewStyle> = {
    default: { height: 40, paddingHorizontal: 16, paddingVertical: 8 },
    sm: { height: 36, paddingHorizontal: 12 },
    lg: { height: 44, paddingHorizontal: 32 },
    icon: { height: 40, width: 40 },
  };
  return sizes[size];
};

export function Button({
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  children,
  testID,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const { colors, radii } = useTheme();
  const base: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    opacity: disabled ? 0.5 : 1,
  };
  const variantStyle = buildVariantStyle(variant, colors);
  const sizeStyle = buildSizeStyle(size);
  const labelColor = variant === 'default' ? colors.primaryForeground : colors.foreground;
  const labelStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: labelColor,
  };
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[base, variantStyle, sizeStyle, style]}
    >
      {typeof children === 'string' ? <RNText style={labelStyle}>{children}</RNText> : children}
    </Pressable>
  );
}
