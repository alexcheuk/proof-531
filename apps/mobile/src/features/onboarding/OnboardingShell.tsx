import { Text } from '@/design/primitives/Text';
import { colors, shape } from '@/design/tokens';
import type React from 'react';
import { View, type ViewStyle } from 'react-native';

export type OnboardingShellProps = {
  children: React.ReactNode;
  /**
   * Footer renders flush at the bottom (e.g. the primary `PressButton`).
   * Sits inside the same horizontal padding as the body so it lines up
   * visually with the wordmark.
   */
  footer?: React.ReactNode;
};

/**
 * Shared layout chrome for the onboarding flow. Every step gets the same
 * "531." wordmark in the top-left, the same horizontal gutter, and the
 * same bottom-safe area for its primary CTA. Mirrors the editorial
 * structure of `design-reference/screens-onboarding.jsx`.
 */
export function OnboardingShell({ children, footer }: OnboardingShellProps) {
  const container: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
    paddingTop: shape.rLg * 3,
    paddingBottom: shape.rLg,
  };
  const wordmarkRow: ViewStyle = {
    paddingHorizontal: shape.rLg,
    paddingBottom: shape.rLg,
  };
  const bodyStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: shape.rLg,
  };
  const footerStyle: ViewStyle = {
    paddingHorizontal: shape.rLg,
    paddingTop: shape.rMd,
  };
  return (
    <View style={container}>
      <View style={wordmarkRow}>
        <Text variant="logo">
          531
          <Text variant="logo" tone="hot">
            .
          </Text>
        </Text>
      </View>
      <View style={bodyStyle}>{children}</View>
      {footer ? <View style={footerStyle}>{footer}</View> : null}
    </View>
  );
}

export default OnboardingShell;
