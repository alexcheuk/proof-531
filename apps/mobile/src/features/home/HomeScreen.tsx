import { useDb } from '@/data/DbProvider';
import { createSession } from '@/data/accessors/session';
import { useLatestTms } from '@/data/queries/useLatestTm';
import { usePrs } from '@/data/queries/usePrs';
import { useSettings } from '@/data/queries/useSettings';
import { Masthead } from '@/design/primitives/Masthead';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { dateLabel } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import { useQueryClient } from '@tanstack/react-query';
/**
 * Home screen — composes Masthead + LiftTabs + a horizontal swipe carousel of
 * `LiftPage`s, one page per enabled lift.
 *
 * Ported from `~/Development/531-pwa/src/features/home/HomeScreen.tsx`. The
 * PWA uses a CSS-snap horizontal scroll container; the RN port uses a
 * `pagingEnabled` horizontal `FlatList` keyed on the lift, with
 * `onMomentumScrollEnd` driving `setSelectedLift` and a `scrollToIndex`
 * effect that re-syncs when the selected lift changes externally (e.g. via
 * a LiftTab tap).
 *
 * Boundary: this file lives under `features/` and composes design
 * primitives + data queries — it never imports drizzle hex directly.
 * The single `createSession` call below is the one allowed exception
 * (accessors are explicitly safe to call from features per §3 of the
 * boundary rules — only the raw drizzle handle is forbidden).
 */
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
  type ViewStyle,
} from 'react-native';
import { LiftPage } from './components/LiftPage';
import { LiftTabs } from './components/LiftTabs';
import { useHomeScreenState } from './hooks/useHomeScreenState';

export function HomeScreen() {
  const router = useRouter();
  const settings = useSettings();
  const tms = useLatestTms();
  const prs = usePrs();
  const db = useDb();
  const queryClient = useQueryClient();

  const enabledLifts = useMemo<Lift[]>(
    () => settings.data?.enabledLifts ?? [],
    [settings.data?.enabledLifts],
  );
  const firstLift: Lift = enabledLifts[0] ?? 'squat';
  const { selectedLift, setSelectedLift, inProgressLift } = useHomeScreenState(firstLift);

  const listRef = useRef<FlatList<Lift>>(null);
  const screenWidth = Dimensions.get('window').width;

  // If onboarding has not produced an enabled-lifts set, redirect.
  useEffect(() => {
    if (settings.data && settings.data.enabledLifts.length === 0) {
      router.replace('/onboarding');
    }
  }, [settings.data, router]);

  // Sync the carousel position when selectedLift changes externally
  // (e.g. via tab tap or settings edit). Guarded against out-of-range.
  useEffect(() => {
    const idx = enabledLifts.indexOf(selectedLift);
    if (idx >= 0 && listRef.current) {
      // Defer to next tick so initial mount has a layout to scroll within.
      // `scrollToIndex` is a no-op if the list isn't rendered yet, but on
      // Expo SDK 55 a microtask is enough for the initial layout pass.
      try {
        listRef.current.scrollToIndex({ index: idx, animated: true });
      } catch {
        // scrollToIndex can throw before initial layout; ignore.
      }
    }
  }, [selectedLift, enabledLifts]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
      const lift = enabledLifts[idx];
      if (lift && lift !== selectedLift) {
        setSelectedLift(lift);
      }
    },
    [enabledLifts, selectedLift, screenWidth, setSelectedLift],
  );

  const handleBegin = useCallback(
    async (lift: Lift) => {
      // Single-session invariant (§4): if another lift is mid-session, do not
      // start a second one. Navigate to that lift instead.
      if (inProgressLift && inProgressLift !== lift) {
        // typedRoutes is disabled (PF-05); cast the params object.
        router.push({
          pathname: '/session/today',
          params: { lift: inProgressLift },
        } as never);
        return;
      }
      try {
        await createSession(db, lift);
        await queryClient.invalidateQueries({ queryKey: ['activeSession'] });
        await queryClient.invalidateQueries({ queryKey: ['sessions'] });
      } catch (err) {
        console.error('HomeScreen.handleBegin createSession failed', err);
      }
      router.push({ pathname: '/session/today', params: { lift } } as never);
    },
    [db, inProgressLift, queryClient, router],
  );

  const handleResume = useCallback(
    (lift: Lift) => {
      router.push({ pathname: '/session/today', params: { lift } } as never);
    },
    [router],
  );

  const handleOpenPlan = useCallback(
    (lift: Lift) => {
      router.push({ pathname: '/session/today', params: { lift } } as never);
    },
    [router],
  );

  const settingsData = settings.data;
  const tmsData = tms.data;
  const prsData = prs.data;

  const renderItem = useCallback<ListRenderItem<Lift>>(
    ({ item: lift }) => {
      if (!settingsData) return null;
      const tmRow = tmsData?.find((t) => t.lift === lift);
      const pr = prsData?.find((p) => p.lift === lift);
      const storageUnit = tmRow?.unit ?? settingsData.storageUnit;
      const displayUnit = settingsData.displayUnit ?? settingsData.storageUnit;
      return (
        <View style={{ width: screenWidth }}>
          <LiftPage
            lift={lift}
            week={settingsData.week}
            cycle={settingsData.currentCycle}
            storageUnit={storageUnit}
            displayUnit={displayUnit}
            plateSet={settingsData.plateSet}
            tm={tmRow?.value ?? null}
            bestE1RM={pr?.bestE1RM ?? null}
            isInProgress={lift === inProgressLift}
            onBegin={() => handleBegin(lift)}
            onResume={() => handleResume(lift)}
            onOpenPlan={() => handleOpenPlan(lift)}
          />
        </View>
      );
    },
    [
      settingsData,
      tmsData,
      prsData,
      inProgressLift,
      screenWidth,
      handleBegin,
      handleResume,
      handleOpenPlan,
    ],
  );

  const combined = combineQueries(settings, tms, prs);
  if (combined.isLoading || combined.isError) {
    return (
      <Container>
        <QueryShell query={combined}>{null}</QueryShell>
      </Container>
    );
  }
  if (!settings.data || enabledLifts.length === 0) {
    return null;
  }

  // If the selected lift is no longer enabled (e.g. settings edit), snap
  // back to the first enabled lift.
  const selectedToRender = enabledLifts.includes(selectedLift) ? selectedLift : firstLift;
  const initialIdx = Math.max(0, enabledLifts.indexOf(selectedToRender));

  return (
    <Container>
      <Masthead rightSlot={<DateBadge label={dateLabel(new Date())} />} />
      <LiftTabs
        enabled={enabledLifts}
        selected={selectedToRender}
        inProgressLift={inProgressLift}
        onSelect={setSelectedLift}
      />
      <FlatList
        ref={listRef}
        testID="home-lift-carousel"
        data={enabledLifts}
        keyExtractor={(l) => l}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, i) => ({
          length: screenWidth,
          offset: screenWidth * i,
          index: i,
        })}
        initialScrollIndex={initialIdx}
        initialNumToRender={enabledLifts.length}
        windowSize={enabledLifts.length || 1}
      />
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
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

function DateBadge({ label }: { label: string }) {
  return (
    <Text
      variant="mono"
      weight="medium"
      size={10}
      color="ink2"
      style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
    >
      {label}
    </Text>
  );
}
