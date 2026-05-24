import { goTo } from '@/app/routes';
import { useLatestTms } from '@/data/queries/useLatestTm';
import { usePrs } from '@/data/queries/usePrs';
import { useSettings } from '@/data/queries/useSettings';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Masthead } from '@/design/primitives/Masthead';
import { Skeleton } from '@/design/primitives/Skeleton';
import { useTheme } from '@/design/theme';
import { dateLabel } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
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
  FlatList,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { LiftPage } from './components/LiftPage';
import { LiftTabs } from './components/LiftTabs';
import { useHomeScreenState } from './hooks/useHomeScreenState';

export function HomeScreen() {
  const router = useRouter();
  const settings = useSettings();
  const tms = useLatestTms();
  const prs = usePrs();

  const enabledLifts = useMemo<Lift[]>(
    () => settings.data?.enabledLifts ?? [],
    [settings.data?.enabledLifts],
  );
  const firstLift: Lift = enabledLifts[0] ?? 'squat';
  const { selectedLift, setSelectedLift, inProgressLift } = useHomeScreenState(
    firstLift,
    enabledLifts,
  );

  const listRef = useRef<FlatList<Lift>>(null);
  // Live width — rotates with the device so carousel page math, item
  // layout, and momentum-end index calculation stay correct under
  // orientation change.
  const { width: screenWidth } = useWindowDimensions();

  // If onboarding has not produced an enabled-lifts set, redirect.
  useEffect(() => {
    if (settings.data && settings.data.enabledLifts.length === 0) {
      goTo.onboarding(router);
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
    (lift: Lift) => {
      // Single-session invariant (§4): if another lift is mid-session, do not
      // start a second one. Navigate to that lift instead.
      // Session creation itself happens in TodayScreen (preview mode) so we
      // don't insert a row that an unrelated tap-back leaves orphaned.
      const target = inProgressLift && inProgressLift !== lift ? inProgressLift : lift;
      goTo.today(router, target);
    },
    [inProgressLift, router],
  );

  // Resume and "See full session" both land on the same Today route — they
  // diverge in the LiftPage's CTA copy, not in the destination. One handler.
  const handleOpenToday = useCallback(
    (lift: Lift) => {
      goTo.today(router, lift);
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
            onResume={() => handleOpenToday(lift)}
            onOpenPlan={() => handleOpenToday(lift)}
          />
        </View>
      );
    },
    [settingsData, tmsData, prsData, inProgressLift, screenWidth, handleBegin, handleOpenToday],
  );

  const combined = combineQueries(settings, tms, prs);
  // Errors keep the QueryShell's retry surface — that's still the right
  // recovery. The loading branch swaps to a paper-themed skeleton so the
  // first paint feels intentional instead of flashing blank.
  if (combined.isError) {
    return (
      <Container>
        <QueryShell query={combined}>{null}</QueryShell>
      </Container>
    );
  }
  if (combined.isLoading || !settings.data || enabledLifts.length === 0) {
    return (
      <Container>
        <HomeSkeleton />
      </Container>
    );
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

function HomeSkeleton() {
  return (
    <View
      style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 14 }}
      testID="home-skeleton"
    >
      <Skeleton width={84} height={10} />
      <Skeleton width="60%" height={42} tone="lineStrong" />
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 18 }}>
        <Skeleton width={44} height={10} />
        <Skeleton width={44} height={10} />
        <Skeleton width={44} height={10} />
        <Skeleton width={44} height={10} />
      </View>
      <Skeleton width="100%" height={120} style={{ marginTop: 18 }} />
      <Skeleton width="100%" height={56} style={{ marginTop: 18 }} />
      <Skeleton width="100%" height={56} />
    </View>
  );
}

function DateBadge({ label }: { label: string }) {
  // Slightly tighter letter-spacing than the default 2.2 to match the PWA's
  // 0.18em-on-10px right-slot caps treatment for dates specifically.
  return <CapsLabel style={{ letterSpacing: 1.8 }}>{label}</CapsLabel>;
}
