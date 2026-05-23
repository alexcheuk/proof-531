import { DbProvider } from '@/data/DbProvider';
import { db, expoDb } from '@/data/drizzle/client';
import { runMigrations } from '@/data/drizzle/runMigrations';
import { useAppFonts } from '@/design/fonts';
import { ThemeProvider } from '@/design/theme';
import { colors } from '@/design/tokens';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Single QueryClient for the app's lifetime. Created at module scope so we
 * don't churn the cache across remounts of <RootLayout>.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes — settings / TMs / PRs change rarely; the rest is driven by
      // explicit `queryClient.invalidateQueries` from mutation handlers.
      staleTime: 5 * 60 * 1000,
    },
  },
});

/**
 * Pushes the rendered slot below the status bar / notch with a paper-colored
 * top stripe of `insets.top` height. The status bar itself is set to `dark`
 * (ink glyphs on the paper bg), so the stripe + glyphs blend into one strip.
 *
 * Per-screen bottom safe-area is handled by CtaBar / the tab bar, not here —
 * forcing a global paddingBottom would fight those components.
 */
function SafeTopFrame() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.bg0 }}>
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  const { fontsLoaded, fontError } = useAppFonts();
  const [migrationsReady, setMigrationsReady] = useState(false);
  const [migrationError, setMigrationError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      runMigrations(expoDb);
      setMigrationsReady(true);
    } catch (err) {
      setMigrationError(err as Error);
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  if (!migrationsReady && !migrationError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <DbProvider db={db}>
          <ThemeProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg0 }}>
              <StatusBar style="dark" />
              <SafeTopFrame />
            </GestureHandlerRootView>
          </ThemeProvider>
        </DbProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
