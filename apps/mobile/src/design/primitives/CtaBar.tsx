import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

// Positioning is intentionally NOT owned here: the caller decides whether to place CtaBar at
// the bottom via `position: 'absolute'`, flex, or as the last child of a column.
// Safe-area: bottom padding combines a 16px gutter with the device's bottom inset so the
// home indicator never sits over the button.
export type CtaBarProps = {
  children: ReactNode;
  /** Bottom safe-area-inset padding. Defaults to true. */
  safeArea?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function CtaBar({ children, safeArea = true, testID, style }: CtaBarProps) {
  const { colors, layout } = useTheme();
  const insets = useSafeAreaInsets();

  const resolved: ViewStyle = {
    backgroundColor: colors.bg0,
    paddingHorizontal: layout.gutter,
    paddingTop: 16,
    paddingBottom: safeArea ? insets.bottom + 16 : 16,
  };

  return (
    <View testID={testID} style={[resolved, style]}>
      {children}
    </View>
  );
}
