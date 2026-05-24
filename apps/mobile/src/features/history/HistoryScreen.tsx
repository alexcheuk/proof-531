/**
 * History screen — composes Masthead + TitleBlock + an achievement strip +
 * a cycle-grouped list of past sessions, all inside a pull-to-refresh
 * ScrollView.
 *
 * Ported from `~/Development/531-pwa/src/features/history/HistoryScreen.tsx`.
 * The mobile port adds PR markers (`★ PR` chip on rows) + a lifetime stats
 * strip ("N sessions filed · M PRs") so the page rewards consistency, not
 * just records completed work.
 */
import type { Session } from '@/data/accessors/session';
import { useSessionPrIds } from '@/data/queries/useSessionPrIds';
import { useSessions } from '@/data/queries/useSessions';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Masthead } from '@/design/primitives/Masthead';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View, type ViewStyle } from 'react-native';
import { computeHistoryStats } from './achievements';
import { recentActivity } from './activity';
import { AchievementStrip } from './components/AchievementStrip';
import { CycleSection } from './components/CycleSection';
import { HistorySkeleton } from './components/HistorySkeleton';

/**
 * Bucket sessions into cycle groups in their existing order. `useSessions`
 * returns rows newest-first; we preserve that order both at the group level
 * (newest cycle on top) and within each group (newest session on top).
 */
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
  const [refreshing, setRefreshing] = useState(false);

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
  const grouped = useMemo(() => groupByCycle(rows), [rows]);
  const stats = useMemo(() => computeHistoryStats(rows, prIds), [rows, prIds]);
  const activity = useMemo(() => recentActivity(rows), [rows]);

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
        <AchievementStrip filed={stats.filed} prs={stats.prs} activity={activity} />
        {rows.length === 0 ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }} testID="history-empty">
            <CapsLabel style={{ letterSpacing: 1.8 }}>FINISH A SESSION TO SEE IT HERE</CapsLabel>
          </View>
        ) : (
          grouped.map((group) => (
            <CycleSection
              key={group.cycle}
              cycle={group.cycle}
              sessions={group.sessions}
              prSessionIds={prIds}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
