import { useLatestTms } from '@/data/queries/useLatestTm';
import { usePrs } from '@/data/queries/usePrs';
import { useSettings } from '@/data/queries/useSettings';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Masthead } from '@/design/primitives/Masthead';
import { useTheme } from '@/design/theme';
import { LIFTS } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { LiftTabs } from '@/features/shared/LiftTabs';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import { useLiftCarouselSync } from '@/features/shared/hooks/useLiftCarouselSync';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, type ListRenderItem, View, useWindowDimensions } from 'react-native';
import { ProgressLiftPage } from './components/ProgressLiftPage';
import { ProgressSkeleton } from './components/ProgressSkeleton';

export type ProgressScreenProps = {
  lift: Lift;
};

export function ProgressScreen({ lift }: ProgressScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const { justCompleted: justCompletedParam, lift: urlLift } = useLocalSearchParams<{
    justCompleted?: string;
    lift?: string;
  }>();
  const justCompletedSessionId = useMemo(() => {
    if (typeof justCompletedParam !== 'string') return undefined;
    const parsed = Number.parseInt(justCompletedParam, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [justCompletedParam]);

  const settings = useSettings();
  const tms = useLatestTms();
  const prs = usePrs();

  const enabledLifts = useMemo<Lift[]>(
    () => settings.data?.enabledLifts ?? [...LIFTS],
    [settings.data?.enabledLifts],
  );

  const [selectedLift, setSelectedLift] = useState<Lift>(lift);
  useEffect(() => {
    setSelectedLift(lift);
  }, [lift]);

  const [scrolledByLift, setScrolledByLift] = useState<Partial<Record<Lift, boolean>>>({});
  const reportScrolled = useCallback((reporting: Lift, scrolled: boolean) => {
    setScrolledByLift((prev) =>
      prev[reporting] === scrolled ? prev : { ...prev, [reporting]: scrolled },
    );
  }, []);
  const mastheadElevated = !!scrolledByLift[selectedLift];

  const updateRouteParam = useCallback(
    (next: Lift) => {
      setSelectedLift(next);
      router.setParams({ lift: next });
    },
    [router],
  );

  const { listRef, onMomentumScrollEnd } = useLiftCarouselSync({
    selectedLift,
    enabledLifts,
    screenWidth,
    setSelectedLift: updateRouteParam,
  });

  const renderItem = useCallback<ListRenderItem<Lift>>(
    ({ item }) => (
      <View style={{ width: screenWidth }}>
        <ProgressLiftPage
          lift={item}
          onScrolledChange={(scrolled) => reportScrolled(item, scrolled)}
          justCompletedSessionId={item === urlLift ? justCompletedSessionId : undefined}
        />
      </View>
    ),
    [screenWidth, reportScrolled, urlLift, justCompletedSessionId],
  );

  const combined = combineQueries(settings, tms, prs);
  if (combined.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
        <Masthead rightSlot={<CapsLabel>projection</CapsLabel>} elevated={mastheadElevated} />
        <QueryShell query={combined}>{null}</QueryShell>
      </View>
    );
  }

  const selectedIndex = Math.max(0, enabledLifts.indexOf(selectedLift));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }} testID="progress-screen">
      <Masthead rightSlot={<CapsLabel>projection</CapsLabel>} elevated={mastheadElevated} />
      {combined.isLoading || !settings.data ? (
        <ProgressSkeleton />
      ) : (
        <>
          {enabledLifts.length > 1 ? (
            <LiftTabs
              enabled={enabledLifts}
              selected={selectedLift}
              inProgressLift={null}
              elevated={mastheadElevated}
              onSelect={updateRouteParam}
            />
          ) : null}
          <FlatList
            ref={listRef}
            testID="progress-lift-carousel"
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
            initialScrollIndex={selectedIndex}
            initialNumToRender={enabledLifts.length}
            windowSize={enabledLifts.length || 1}
          />
        </>
      )}
    </View>
  );
}
