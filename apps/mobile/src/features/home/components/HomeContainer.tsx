import { useTheme } from '@/design/theme';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

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
