import { useActiveSession } from '@/data/queries/useActiveSession';
import { useLatestTms } from '@/data/queries/useLatestTm';
import { useAllLiftProgress } from '@/data/queries/useLiftProgress';
import { usePrs } from '@/data/queries/usePrs';
import { useSetLogsForSession } from '@/data/queries/useSetLogsForSession';
import { useSettings } from '@/data/queries/useSettings';
import { Masthead } from '@/design/primitives/Masthead';
import { dateLabel } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { LiftTabs } from '@/features/shared/LiftTabs';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import { useLiftCarouselSync } from '@/features/shared/hooks/useLiftCarouselSync';
import { goTo } from '@/lib/routes';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { FlatList, type ListRenderItem, View, useWindowDimensions } from 'react-native';
import { DateBadge } from './components/DateBadge';
import { HomeContainer } from './components/HomeContainer';
import { HomeSkeleton } from './components/HomeSkeleton';
import { LiftPage } from './components/LiftPage/LiftPage';
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

  // Live width  -  rotates with the device so carousel page math, item
  // layout, and momentum-end index calculation stay correct under
  // orientation change.
  const { width: screenWidth } = useWindowDimensions();

  const { listRef, onMomentumScrollEnd } = useLiftCarouselSync({
    selectedLift,
    enabledLifts,
    screenWidth,
    setSelectedLift,
  });

  // If onboarding has not produced an enabled-lifts set, redirect.
  useEffect(() => {
    if (settings.data && settings.data.enabledLifts.length === 0) {
      goTo.onboarding(router);
    }
  }, [settings.data, router]);

  const handleBegin = useCallback(
    (lift: Lift) => {
      // Single-session invariant (§4): if another lift is mid-session, do not
      // start a second one. Navigate to that lift instead.
      // Session creation itself happens in TodayScreen (preview mode) so we
      // don't insert a row that an unrelated tap-back leaves orphaned.
      // Skip the redirect when the in-progress lift is no longer enabled  -
      // useToggleLift now cancels that session at toggle-time, but this is
      // belt-and-braces in case any future code path leaves a ghost.
      const shouldRedirect =
        inProgressLift && inProgressLift !== lift && enabledLifts.includes(inProgressLift);
      const target = shouldRedirect ? inProgressLift : lift;
      goTo.today(router, target);
    },
    [inProgressLift, enabledLifts, router],
  );

  const handleOpenToday = useCallback(
    (lift: Lift) => {
      goTo.today(router, lift);
    },
    [router],
  );

  const settingsData = settings.data;
  const tmsData = tms.data;
  const prsData = prs.data;
  const progress = useAllLiftProgress(enabledLifts);
  const progressByLift = useMemo(() => {
    const map = new Map<Lift, { currentCycle: number; week: 1 | 2 | 3 | 4 }>();
    for (const p of progress.data ?? []) {
      map.set(p.lift, { currentCycle: p.currentCycle, week: p.week });
    }
    return map;
  }, [progress.data]);
  // Set count for the in-progress session  -  drives the "Resume · set N of 3"
  // CTA copy on the LiftPage for the in-progress lift. Query is gated on
  // the session id so we don't fire it when there's nothing in flight.
  const activeSession = useActiveSession();
  const activeSessionId = activeSession.data?.id ?? null;
  const activeSetLogs = useSetLogsForSession(activeSessionId);
  const inProgressCompletedCount = useMemo(() => {
    if (activeSessionId === null) return 0;
    const logs = activeSetLogs.data ?? [];
    const completed = new Set(
      logs
        .filter((l) => l.kind === 'working' || l.kind === 'amrap' || l.kind === 'tm-test')
        .map((l) => l.index),
    );
    return completed.size;
  }, [activeSessionId, activeSetLogs.data]);
  const prLifts = useMemo<Set<Lift>>(
    () => new Set((prsData ?? []).map((p) => p.lift as Lift)),
    [prsData],
  );

  const renderItem = useCallback<ListRenderItem<Lift>>(
    ({ item: lift }) => {
      if (!settingsData) return null;
      const tmRow = tmsData?.find((t) => t.lift === lift);
      const pr = prsData?.find((p) => p.lift === lift);
      const storageUnit = tmRow?.unit ?? settingsData.storageUnit;
      const displayUnit = settingsData.displayUnit ?? settingsData.storageUnit;
      const liftProg = progressByLift.get(lift);
      // First-paint fallback (progress query still loading): legacy global
      // settings columns are the right seed, since the accessor uses them
      // to materialize the row anyway.
      const week = liftProg?.week ?? settingsData.week;
      const cycle = liftProg?.currentCycle ?? settingsData.currentCycle;
      return (
        <View style={{ width: screenWidth }}>
          <LiftPage
            lift={lift}
            week={week}
            cycle={cycle}
            storageUnit={storageUnit}
            displayUnit={displayUnit}
            plateSet={settingsData.plateSet}
            tm={tmRow?.value ?? null}
            bestE1RM={pr?.bestE1RM ?? null}
            isInProgress={lift === inProgressLift}
            completedCount={lift === inProgressLift ? inProgressCompletedCount : 0}
            onBegin={() => handleBegin(lift)}
            onResume={() => handleOpenToday(lift)}
          />
        </View>
      );
    },
    [
      settingsData,
      tmsData,
      prsData,
      progressByLift,
      inProgressLift,
      inProgressCompletedCount,
      screenWidth,
      handleBegin,
      handleOpenToday,
    ],
  );

  const combined = combineQueries(settings, tms, prs);
  // Errors keep the QueryShell's retry surface  -  that's still the right
  // recovery. The loading branch swaps to a paper-themed skeleton so the
  // first paint feels intentional instead of flashing blank.
  if (combined.isError) {
    return (
      <HomeContainer>
        <QueryShell query={combined}>{null}</QueryShell>
      </HomeContainer>
    );
  }
  if (combined.isLoading || !settings.data || enabledLifts.length === 0) {
    return (
      <HomeContainer>
        <HomeSkeleton />
      </HomeContainer>
    );
  }

  const selectedToRender = enabledLifts.includes(selectedLift) ? selectedLift : firstLift;
  const initialIdx = Math.max(0, enabledLifts.indexOf(selectedToRender));

  return (
    <HomeContainer>
      <Masthead rightSlot={<DateBadge label={dateLabel(new Date())} />} />
      <LiftTabs
        enabled={enabledLifts}
        selected={selectedToRender}
        inProgressLift={inProgressLift}
        prLifts={prLifts}
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
    </HomeContainer>
  );
}
