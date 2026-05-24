import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

/**
 * Sticky bottom CTA strip ported from the PWA's `cta-bar.tsx`. Houses a
 * primary action element passed as `children` on Today, Live,
 * SessionComplete, and onboarding screens.
 *
 * Surface: `colors.bg0`. No border — separation from scrolled content comes
 * from a fade above the strip on the PWA. Mobile defers the gradient until
 * `expo-linear-gradient` is added to deps; until then `gradient` is a no-op.
 *
 * Safe-area: bottom padding combines a 16px gutter with the device's bottom
 * inset (read via `useSafeAreaInsets`) so the home indicator never sits over
 * the button.
 *
 * Positioning is intentionally NOT owned here — the caller decides whether to
 * place CtaBar at the bottom via `position: 'absolute'`, `mt-auto`-style flex,
 * or as the last child of a column. This avoids fights with ScrollView
 * contexts the PWA's `sticky` CSS does not have to worry about.
 */
export type CtaBarProps = {
  children: ReactNode;
  /** Fade-from-paper above the bar. No-op on mobile until expo-linear-gradient lands. */
  gradient?: boolean;
  /** Bottom safe-area-inset padding. Defaults to true. */
  safeArea?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function CtaBar({
  children,
  // gradient is intentionally accepted but unused — see component docs.
  gradient: _gradient = false,
  safeArea = true,
  testID,
  style,
}: CtaBarProps) {
  const { colors, layout } = useTheme();
  const insets = useSafeAreaInsets();

  const resolved: ViewStyle = {
    backgroundColor: colors.bg0,
    paddingHorizontal: layout.gutter,
    paddingTop: 16,
    paddingBottom: safeArea ? Math.max(insets.bottom, 0) + 16 : 16,
  };

  return (
    <View testID={testID} style={[resolved, style]}>
      {children}
    </View>
  );
}
