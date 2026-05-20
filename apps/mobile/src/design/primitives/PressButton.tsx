import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useMemo } from 'react';
import { Pressable, type PressableProps, type TextStyle, type ViewStyle } from 'react-native';
import { type Theme, useTheme } from '../theme';
import { shape } from '../tokens';
import { Text } from './Text';

export type PressButtonVariant = 'ember' | 'inverse' | 'ghost';
export type PressButtonSize = 'sm' | 'md' | 'lg';

export type PressButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  variant?: PressButtonVariant;
  size?: PressButtonSize;
  disabled?: boolean;
  onPress?: () => void;
};

const SIZE_STYLES: Record<
  PressButtonSize,
  { paddingVertical: number; paddingHorizontal: number; fontSize: number }
> = {
  sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
  md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15 },
  lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 17 },
};

const DISABLED_OPACITY = 0.5;

function buildVariantStyles(
  theme: Theme,
): Record<PressButtonVariant, { container: ViewStyle; label: TextStyle }> {
  return {
    ember: {
      container: { backgroundColor: theme.colors.hot },
      label: { color: theme.colors.ink0 },
    },
    inverse: {
      container: { backgroundColor: theme.colors.ink0 },
      label: { color: theme.colors.bg0 },
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.hot,
      },
      label: { color: theme.colors.hot },
    },
  };
}

export function PressButton({
  children,
  variant = 'ember',
  size = 'md',
  disabled = false,
  onPress,
  ...rest
}: PressButtonProps) {
  const theme = useTheme();
  const variants = useMemo(() => buildVariantStyles(theme), [theme]);
  const sizeStyle = SIZE_STYLES[size];
  const variantStyle = variants[variant];

  const containerStyle: ViewStyle = {
    paddingVertical: sizeStyle.paddingVertical,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    borderRadius: shape.rMd,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? DISABLED_OPACITY : 1,
    ...variantStyle.container,
  };

  const labelStyle: TextStyle = {
    fontSize: sizeStyle.fontSize,
    fontWeight: '600',
    ...variantStyle.label,
  };

  const handlePress = () => {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={containerStyle}
      {...rest}
    >
      <Text style={labelStyle}>{children as React.ReactNode}</Text>
    </Pressable>
  );
}

export default PressButton;
