import { DbProvider } from '@/data/DbProvider';
import { db, expoDb } from '@/data/drizzle/client';
import { runMigrations } from '@/data/drizzle/runMigrations';
import { useAppFonts } from '@/design/fonts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
    <QueryClientProvider client={queryClient}>
      <DbProvider db={db}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0B0C0E' }}>
          <Slot />
        </GestureHandlerRootView>
      </DbProvider>
    </QueryClientProvider>
  );
}
