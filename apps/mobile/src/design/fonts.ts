import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

void SplashScreen.preventAutoHideAsync();

const fontMap = {
  'IBMPlexSans-Regular': require('@/assets/fonts/IBMPlexSans-Regular.ttf'),
  'IBMPlexSans-Medium': require('@/assets/fonts/IBMPlexSans-Medium.ttf'),
  'IBMPlexSans-SemiBold': require('@/assets/fonts/IBMPlexSans-SemiBold.ttf'),
  'IBMPlexSans-Bold': require('@/assets/fonts/IBMPlexSans-Bold.ttf'),
  'IBMPlexMono-Regular': require('@/assets/fonts/IBMPlexMono-Regular.ttf'),
  'IBMPlexMono-Medium': require('@/assets/fonts/IBMPlexMono-Medium.ttf'),
  'IBMPlexMono-SemiBold': require('@/assets/fonts/IBMPlexMono-SemiBold.ttf'),
  'IBMPlexMono-Bold': require('@/assets/fonts/IBMPlexMono-Bold.ttf'),
  'IBMPlexSansCondensed-Regular': require('@/assets/fonts/IBMPlexSansCondensed-Regular.ttf'),
  'IBMPlexSansCondensed-Medium': require('@/assets/fonts/IBMPlexSansCondensed-Medium.ttf'),
  'IBMPlexSansCondensed-SemiBold': require('@/assets/fonts/IBMPlexSansCondensed-SemiBold.ttf'),
  'IBMPlexSansCondensed-Bold': require('@/assets/fonts/IBMPlexSansCondensed-Bold.ttf'),
};

export function useAppFonts(): {
  fontsLoaded: boolean;
  fontError: Error | null;
} {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);
  return { fontsLoaded, fontError };
}
