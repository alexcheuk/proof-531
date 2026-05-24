import { useTheme } from '@/design/theme';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

/**
 * Paper-themed root container for the Home tab. Owns the status bar style
 * + flex chrome so the screen and its skeleton render against the same
 * surface.
 */
export function HomeContainer({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const style: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };
  return (
    <View style={style}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
}
