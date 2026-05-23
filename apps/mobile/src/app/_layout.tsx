import { useAppFonts } from '@/design/fonts';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const { fontsLoaded, fontError } = useAppFonts();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0B0C0E' }}>
      <Slot />
    </GestureHandlerRootView>
  );
}
