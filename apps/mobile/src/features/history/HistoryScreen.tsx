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
 */
import { usePrs } from '@/data/queries/usePrs';
import { useSessionPrIds } from '@/data/queries/useSessionPrIds';
import { useSessions } from '@/data/queries/useSessions';
import { useSettings } from '@/data/queries/useSettings';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Masthead } from '@/design/primitives/Masthead';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View, type ViewStyle } from 'react-native';
import { computeHistoryStats } from './achievements';
import {
  currentStreakDays,
  daysSinceFirstSession,
  firstSessionDate,
  longestStreakDays,
  recentActivity,
} from './activity';
import { pickBestLift } from './bestLift';
import { AchievementStrip } from './components/AchievementStrip';
import { CycleSection } from './components/CycleSection';
import { FilterChips } from './components/FilterChips';
import { HistoryEmptyState } from './components/HistoryEmptyState';
import { HistoryFilterEmptyState } from './components/HistoryFilterEmptyState';
import { HistorySkeleton } from './components/HistorySkeleton';
import { type HistoryFilter, applyHistoryFilter } from './filter';
import { groupByCycle } from './grouping';

const DEFAULT_LIFTS: ReadonlyArray<Lift> = ['squat', 'bench', 'deadlift', 'press'];

export function HistoryScreen() {
  const { colors } = useTheme();
  const sessions = useSessions();
  const prIdsQuery = useSessionPrIds();
  const prsQuery = usePrs();
  const settingsQuery = useSettings();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>({ kind: 'all' });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch every source the strip + list read from. Missing prsQuery or
      // settingsQuery here would leave the best-lift chip stale after a pull.
      await Promise.all([
        sessions.refetch(),
        prIdsQuery.refetch(),
        prsQuery.refetch(),
        settingsQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [sessions, prIdsQuery, prsQuery, settingsQuery]);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };

  const rows = sessions.data ?? [];
  const prIds = prIdsQuery.data ?? new Set<number>();
  const enabledLifts = settingsQuery.data?.enabledLifts ?? DEFAULT_LIFTS;
  // Stats + activity always reflect the FULL history (lifetime totals,
  // not the filtered view) so the achievement strip stays anchored as the
  // user explores filters.
  const stats = useMemo(() => computeHistoryStats(rows, prIds), [rows, prIds]);
  const activity = useMemo(() => recentActivity(rows), [rows]);
  const longestStreak = useMemo(() => longestStreakDays(rows), [rows]);
  const currentStreak = useMemo(() => currentStreakDays(rows), [rows]);
  const trainingSince = useMemo(() => firstSessionDate(rows), [rows]);
  const totalTrainingDays = useMemo(() => daysSinceFirstSession(rows), [rows]);
  const bestLift = useMemo(() => {
    const storageUnit = settingsQuery.data?.storageUnit ?? 'lbs';
    const displayUnit = settingsQuery.data?.displayUnit ?? storageUnit;
    return pickBestLift(prsQuery.data ?? [], storageUnit, displayUnit);
  }, [prsQuery.data, settingsQuery.data]);
  const filteredRows = useMemo(
    () => applyHistoryFilter(rows, filter, prIds),
    [rows, filter, prIds],
  );
  const grouped = useMemo(() => groupByCycle(filteredRows), [filteredRows]);

  const combined = combineQueries(sessions, prIdsQuery);

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
      <Masthead rightSlot={<CapsLabel>history</CapsLabel>} />
      <ScrollView
        testID="history-scroll"
        contentContainerStyle={{ paddingBottom: 24 }}
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
