import '@/lib/registerRestBackgroundHandler';
import { DbProvider } from '@/data/DbProvider';
import { db, expoDb } from '@/data/drizzle/client';
import { runMigrations } from '@/data/drizzle/runMigrations';
import { useAppFonts } from '@/design/fonts';
import { ErrorBoundary } from '@/design/primitives/ErrorBoundary';
import { useStatusBarTintValue } from '@/design/statusBarTint';
import { ThemeProvider } from '@/design/theme';
import { colors } from '@/design/tokens';
import { BootSplash } from '@/features/shared/BootSplash';
import { OtaUpdateBanner } from '@/features/shared/OtaUpdateBanner';
import { goTo } from '@/lib/routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Text as RNText, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Single QueryClient for the app's lifetime. Created at module scope so we
 * don't churn the cache across remounts of <RootLayout>.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes  -  settings / TMs / PRs change rarely; the rest is driven by
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
 * Per-screen bottom safe-area is handled by CtaBar / the tab bar, not here  -
 * forcing a global paddingBottom would fight those components.
 */
function SafeTopFrame() {
  const insets = useSafeAreaInsets();
  const tint = useStatusBarTintValue();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.bg0 }}>
      <OtaUpdateBanner />
      <Slot />
      {/* Full-bleed status-bar overlay. Painted LAST so it sits on top
       * of the SafeTopFrame's paper bg in the safe-area strip. Screens
       * push a color via `useStatusBarTint(color)`; null = no override.
       * Needed because the native-stack card clips per-screen
       * negative-margin escapes (see src/design/statusBarTint.ts). */}
      {tint ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: tint,
          }}
        />
      ) : null}
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

  // Open the live session when a rest notification is tapped  -  on cold start
  // (getInitialNotification) and while running (foreground press). Android only;
  // the native module is lazy-required so iOS / jest never load it.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const mod = require('react-native-notify-kit') as typeof import('react-native-notify-kit');
    const routeFromData = (data: Record<string, string | number | object> | undefined) => {
      const sessionId = data?.sessionId;
      if (typeof sessionId === 'string') goTo.live(router, sessionId);
    };
    let cancelled = false;
    mod.default.getInitialNotification().then((initial) => {
      if (!cancelled && initial) routeFromData(initial.notification?.data);
    });
    const unsubscribe = mod.default.onForegroundEvent(({ type, detail }) => {
      if (type === mod.EventType.PRESS) routeFromData(detail.notification?.data);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  if (!migrationsReady && !migrationError) {
    // Fonts are ready but the SQLite migrations haven't completed yet  -
    // paint the branded boot splash (paper bg + 531 wordmark) so the
    // handoff from OS splash to first screen never flashes blank.
    return (
      <ThemeProvider>
        <BootSplash />
      </ThemeProvider>
    );
  }

  if (migrationError) {
    // DB migration failed  -  the app cannot function. Show a blocking error
    // so the user knows to force-quit and try again (usually fixes it) or
    // reinstall if the DB is corrupt.
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg0,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <RNText style={{ color: colors.ink0, fontSize: 13, letterSpacing: 1.5 }}>
          DB INIT FAILED
        </RNText>
        <RNText
          style={{
            color: colors.ink0,
            fontSize: 11,
            marginTop: 12,
            textAlign: 'center',
            opacity: 0.6,
          }}
        >
          Force-quit and reopen the app. If this persists, reinstall.
        </RNText>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <DbProvider db={db}>
          <ThemeProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg0 }}>
              <StatusBar style="dark" />
              {/*
               * The boundary sits inside ThemeProvider/DbProvider/QueryClient
               * so the default fallback can read tokens and a reset can keep
               * the data/query layer warm  -  only the feature subtree remounts.
               */}
              <ErrorBoundary scope="root">
                <SafeTopFrame />
              </ErrorBoundary>
            </GestureHandlerRootView>
          </ThemeProvider>
        </DbProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
