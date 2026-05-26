/**
 * Progress tab — horizontal carousel where each page is one lift's
 * `ProgressLiftPage`. Layout mirrors HomeScreen: Masthead + LiftTabs are
 * fixed at the top; per-lift content scrolls inside its own FlatList page.
 *
 * Tokens / hex / px literals stay in `src/design/`.
 */
import { useLatestTms } from '@/data/queries/useLatestTm';
import { usePrs } from '@/data/queries/usePrs';
import { useSettings } from '@/data/queries/useSettings';
import { Masthead } from '@/design/primitives/Masthead';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { LiftTabs } from '@/features/home/components/LiftTabs';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  type ListRenderItem,
  Text as RNText,
  View,
  useWindowDimensions,
} from 'react-native';
import { ProgressLiftPage } from './components/ProgressLiftPage';
import { ProgressSkeleton } from './components/ProgressSkeleton';
import { useProgressCarouselSync } from './hooks/useProgressCarouselSync';

export type ProgressScreenProps = {
  lift: Lift;
};

export function ProgressScreen({ lift }: ProgressScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const settings = useSettings();
  const tms = useLatestTms();
  const prs = usePrs();

  const enabledLifts = useMemo<Lift[]>(
    () => settings.data?.enabledLifts ?? ['squat', 'bench', 'deadlift', 'press'],
    [settings.data?.enabledLifts],
  );

  const [selectedLift, setSelectedLift] = useState<Lift>(lift);
  useEffect(() => {
    setSelectedLift(lift);
  }, [lift]);

  const updateRouteParam = useCallback(
    (next: Lift) => {
      setSelectedLift(next);
      router.setParams({ lift: next });
    },
    [router],
  );

  const { listRef, onMomentumScrollEnd } = useProgressCarouselSync({
    selectedLift,
    enabledLifts,
    screenWidth,
    setSelectedLift: updateRouteParam,
  });

  const renderItem = useCallback<ListRenderItem<Lift>>(
    ({ item }) => (
      <View style={{ width: screenWidth }}>
        <ProgressLiftPage lift={item} />
      </View>
    ),
    [screenWidth],
  );

  const combined = combineQueries(settings, tms, prs);
  if (combined.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
        <Masthead rightSlot={<CapsRight>projection</CapsRight>} />
        <QueryShell query={combined}>{null}</QueryShell>
      </View>
    );
  }

  const selectedIndex = Math.max(0, enabledLifts.indexOf(selectedLift));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }} testID="progress-screen">
      <Masthead rightSlot={<CapsRight>projection</CapsRight>} />
      {combined.isLoading || !settings.data ? (
        <ProgressSkeleton />
      ) : (
        <>
          {enabledLifts.length > 1 ? (
            <LiftTabs
              enabled={enabledLifts}
              selected={selectedLift}
              inProgressLift={null}
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

function CapsRight({ children }: { children: string }) {
  const { colors, type } = useTheme();
  return (
    <RNText
      style={{
        fontFamily: `${type.mono}-Medium`,
        fontSize: 10,
        letterSpacing: 2.2,
        textTransform: 'uppercase',
        color: colors.ink2,
      }}
    >
      {children}
    </RNText>
  );
}
