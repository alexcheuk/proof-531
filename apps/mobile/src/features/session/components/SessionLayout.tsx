import { useTheme } from '@/design/theme';
/**
 * Session chrome — paper-bg flex column with a safe-area top inset.
 *
 * Layout responsibility is intentionally minimal: it
 * supplies the paper canvas + top safe-area padding, and renders its children
 * as a column. The screen (Today) is responsible for placing the sticky top
 * bar, scrollable body, and sticky CTA in the right order.
 */
import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

export type SessionLayoutProps = {
  children?: ReactNode;
  testID?: string;
};

export function SessionLayout({ children, testID }: SessionLayoutProps) {
  const { colors } = useTheme();
  // Top safe-area inset is applied globally by the root layout's SafeTopFrame;
  // don't double-pad here.
  const rootStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };

  return (
    <View testID={testID} style={rootStyle}>
      {children}
    </View>
  );
}
