import { useTheme } from '@/design/theme';
/**
 * Session chrome — paper-bg flex column with a safe-area top inset.
 *
 * Ported from the PWA `~/Development/531-pwa/src/features/session/components/
 * SessionLayout.tsx`. Layout responsibility is intentionally minimal: it
 * supplies the paper canvas + top safe-area padding, and renders its children
 * as a column. The screen (Today) is responsible for placing the sticky top
 * bar, scrollable body, and sticky CTA in the right order.
 *
 * The PWA hosts a cancel-confirm bottom sheet here as well — Today's PE-04
 * port surfaces the preview + Start CTA only; cancel/complete sheets follow
 * in later tasks.
 */
import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SessionLayoutProps = {
  children?: ReactNode;
  testID?: string;
};

export function SessionLayout({ children, testID }: SessionLayoutProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const rootStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
    paddingTop: insets.top,
  };

  return (
    <View testID={testID} style={rootStyle}>
      {children}
    </View>
  );
}
