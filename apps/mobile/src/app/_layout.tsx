import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useMemo } from 'react';

import { DataProvider } from '@/data/context';
import { db, sqlite } from '@/data/db/client';
import migrations from '@/data/db/migrations';
import { ThemeProvider } from '@/design/theme';
import { initSentry } from '@/lib/sentry';

initSentry();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'SpaceGrotesk-Regular': require('../../assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('../../assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-SemiBold': require('../../assets/fonts/SpaceGrotesk-SemiBold.ttf'),
    'SpaceGrotesk-Bold': require('../../assets/fonts/SpaceGrotesk-Bold.ttf'),
    'JetBrainsMono-Regular': require('../../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-Medium': require('../../assets/fonts/JetBrainsMono-Medium.ttf'),
    'JetBrainsMono-SemiBold': require('../../assets/fonts/JetBrainsMono-SemiBold.ttf'),
    'JetBrainsMono-Bold': require('../../assets/fonts/JetBrainsMono-Bold.ttf'),
  });

  useDrizzleStudio(__DEV__ ? sqlite : null);

  // Run drizzle migrations on boot. With a properly wired drizzle-kit bundler
  // step this applies pending SQL migrations from `src/data/db/migrations/`.
  // Until that bundling lands, `migrations` is a no-op stub and the hook
  // immediately resolves `success: true`.
  const { success: migSuccess, error: migError } = useMigrations(db, migrations);

  // Singleton QueryClient — created once per app lifetime.
  const queryClient = useMemo(() => new QueryClient(), []);

  if (!loaded && !error) {
    return null;
  }
  if (!migSuccess && !migError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider db={db}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="live" options={{ presentation: 'modal' }} />
            <Stack.Screen name="pr" options={{ presentation: 'modal' }} />
            <Stack.Screen name="onboarding" />
          </Stack>
        </ThemeProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}
