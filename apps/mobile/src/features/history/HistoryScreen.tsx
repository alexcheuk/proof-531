/**
 * History screen — composes Masthead + TitleBlock + an achievement strip +
 * a chip-row filter + a cycle-grouped list of past sessions, all inside a
 * pull-to-refresh ScrollView.
 *
 * Ported from `~/Development/531-pwa/src/features/history/HistoryScreen.tsx`.
 * The mobile port adds PR markers (`★ PR` chip on rows) + a lifetime stats
 * strip ("N sessions filed · M PRs") + a 14-day activity sparkline + an
 * "All / PRs / per-lift" filter so the page rewards consistency, not just
 * records completed work.
 *
 * Derived/memoized data + the four query reads live in `useHistoryScreenData`
 * — this file is composition + filter UI state only.
 */
import { useScrolledPast } from '@/design/hooks/useScrolledPast';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Masthead } from '@/design/primitives/Masthead';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { QueryShell } from '@/features/shared/QueryShell';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View, type ViewStyle } from 'react-native';
import { AchievementStrip } from './components/AchievementStrip';
import { CycleSection } from './components/CycleSection';
import { FilterChips } from './components/FilterChips';
import { HistoryEmptyState } from './components/HistoryEmptyState';
import { HistoryFilterEmptyState } from './components/HistoryFilterEmptyState';
import { HistorySkeleton } from './components/HistorySkeleton';
import type { HistoryFilter } from './filter';
import { useHistoryScreenData } from './hooks/useHistoryScreenData';

export function HistoryScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>({ kind: 'all' });
  const {
    rows,
    prIds,
    enabledLifts,
    stats,
    activity,
    longestStreak,
    currentStreak,
    trainingSince,
    totalTrainingDays,
    bestLift,
    lifetimeVolume,
    displayUnit,
    sessionsThisWeek,
    filteredRows,
    grouped,
    combined,
    onRefresh: refetchAll,
  } = useHistoryScreenData(filter);

  const { scrolled, onScroll, scrollEventThrottle } = useScrolledPast();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll]);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };

  if (combined.isError) {
    return (
      <View style={containerStyle} testID="history-screen">
        <StatusBar style="dark" />
        <Masthead rightSlot={<CapsLabel>history</CapsLabel>} />
        <QueryShell query={combined}>{null}</QueryShell>
      </View>
    );
  }

  if (combined.isLoading) {
    return (
      <View style={containerStyle} testID="history-screen">
        <StatusBar style="dark" />
        <Masthead rightSlot={<CapsLabel>history</CapsLabel>} />
        <HistorySkeleton />
      </View>
    );
  }

  return (
    <View style={containerStyle} testID="history-screen">
      <StatusBar style="dark" />
      <Masthead rightSlot={<CapsLabel>history</CapsLabel>} elevated={scrolled} />
      <ScrollView
        testID="history-scroll"
        contentContainerStyle={{ paddingBottom: 24 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} testID="history-refresh" />
        }
      >
        <TitleBlock eyebrow="The record" title="History." />
        <AchievementStrip
          filed={stats.filed}
          prs={stats.prs}
          activity={activity}
          bestLift={bestLift}
          longestStreak={longestStreak}
          currentStreak={currentStreak}
          trainingSince={trainingSince}
          totalTrainingDays={totalTrainingDays}
          lifetimeVolume={lifetimeVolume}
          unit={displayUnit}
          sessionsThisWeek={sessionsThisWeek}
        />
        {rows.length > 0 ? (
          <FilterChips
            enabledLifts={enabledLifts}
            active={filter}
            onChange={setFilter}
            hidePrChip={stats.prs === 0}
          />
        ) : null}
        {rows.length === 0 ? (
          <HistoryEmptyState />
        ) : filteredRows.length === 0 ? (
          <HistoryFilterEmptyState onClearFilter={() => setFilter({ kind: 'all' })} />
        ) : (
          grouped.map((group) => (
            <CycleSection
              key={group.cycle}
              cycle={group.cycle}
              sessions={group.sessions}
              prSessionIds={prIds}
              onPressPr={(lift) => setFilter({ kind: 'lift', lift })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
