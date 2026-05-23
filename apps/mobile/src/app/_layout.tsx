import { expoDb } from '@/data/drizzle/client';
import { runMigrations } from '@/data/drizzle/runMigrations';
import { useAppFonts } from '@/design/fonts';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0B0C0E' }}>
      <Slot />
    </GestureHandlerRootView>
  );
}
