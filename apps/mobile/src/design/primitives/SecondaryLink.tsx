import type { ReactNode } from 'react';
import {
  type AccessibilityProps,
  Pressable,
  type PressableStateCallbackType,
  Text as RNText,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

/**
 * Secondary, low-emphasis text-link button. Used wherever the design calls
 * for a centered, mono-uppercase, ink-3 / ink-2 action under a primary CTA —
 * "SKIP · CLOSE THE DAY", "SEE FULL RECORD →", "MAYBE LATER".
 *
 * The primitive bundles the four bits that every site was re-implementing
 * by hand (mono semibold, letter-spacing, paddingVertical, pressed-opacity)
 * so site-level code can stop nudging individual numbers.
 */
export type SecondaryLinkProps = {
  children: ReactNode;
  onPress: () => void;
  /** Use 'inverse' on dark surfaces (PR celebration). Default 'paper'. */
  surface?: 'paper' | 'inverse';
  /** Override the default centered alignment. */
  align?: 'center' | 'flex-start';
  testID?: string;
  /** Override pressable container style for one-off margins. */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: AccessibilityProps['accessibilityLabel'];
};

export function SecondaryLink({
  children,
  onPress,
  surface = 'paper',
  align = 'center',
  testID,
  style,
  accessibilityLabel,
}: SecondaryLinkProps) {
  const { colors, spacing, type } = useTheme();

  const labelStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: surface === 'inverse' ? colors.bg0 : colors.ink3,
    opacity: surface === 'inverse' ? 0.85 : 1,
  };

  const baseStyle: ViewStyle = {
    alignSelf: align,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
      style={(state: PressableStateCallbackType) => [
        baseStyle,
        state.pressed ? { opacity: 0.5 } : null,
        style,
      ]}
    >
      <RNText style={labelStyle}>{children}</RNText>
    </Pressable>
  );
}
