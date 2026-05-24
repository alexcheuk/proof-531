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
import type { Session } from '@/data/accessors/session';
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
import { Pressable, RefreshControl, ScrollView, View, type ViewStyle } from 'react-native';
import { computeHistoryStats } from './achievements';
import { recentActivity } from './activity';
import { pickBestLift } from './bestLift';
import { AchievementStrip } from './components/AchievementStrip';
import { CycleSection } from './components/CycleSection';
import { FilterChips } from './components/FilterChips';
import { HistorySkeleton } from './components/HistorySkeleton';
import { type HistoryFilter, applyHistoryFilter } from './filter';

const DEFAULT_LIFTS: ReadonlyArray<Lift> = ['squat', 'bench', 'deadlift', 'press'];

function groupByCycle(
  sessions: ReadonlyArray<Session>,
): Array<{ cycle: number; sessions: Session[] }> {
  const order: number[] = [];
  const byCycle = new Map<number, Session[]>();
  for (const s of sessions) {
    const cycle = s.cycle ?? 1;
    const bucket = byCycle.get(cycle);
    if (bucket) {
      bucket.push(s);
    } else {
      byCycle.set(cycle, [s]);
      order.push(cycle);
    }
  }
  return order.map((cycle) => ({
    cycle,
    sessions: byCycle.get(cycle) ?? [],
  }));
}

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
      await Promise.all([sessions.refetch(), prIdsQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [sessions, prIdsQuery]);

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
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }} testID="history-empty">
            <CapsLabel style={{ letterSpacing: 1.8 }}>FINISH A SESSION TO SEE IT HERE</CapsLabel>
          </View>
        ) : filteredRows.length === 0 ? (
          <View
            style={{ paddingHorizontal: 24, paddingTop: 24, alignItems: 'flex-start', gap: 12 }}
            testID="history-filter-empty"
          >
            <CapsLabel color="ink3">No sessions match this filter.</CapsLabel>
            <Pressable
              onPress={() => setFilter({ kind: 'all' })}
              accessibilityRole="button"
              accessibilityLabel="Show all sessions"
              testID="history-filter-empty-show-all"
              style={({ pressed }) => [
                {
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: colors.ink0,
                },
                pressed ? { opacity: 0.7 } : null,
              ]}
            >
              <CapsLabel weight="semibold" color="ink0">
                Show all sessions
              </CapsLabel>
            </Pressable>
          </View>
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
