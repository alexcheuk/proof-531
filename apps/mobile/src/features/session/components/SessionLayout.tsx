import { useTheme } from '@/design/theme';
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
