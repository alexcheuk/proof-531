/**
 * History screen — composes Masthead + TitleBlock + a list of completed
 * sessions inside a `ScrollView` with pull-to-refresh.
 *
 * Ported from `~/Development/531-pwa/src/features/history/HistoryScreen.tsx`,
 * which currently ships only the chrome and an empty-state caps line. This
 * port adds the list beneath the title block per the spec (PE-07).
 *
 * Pull-to-refresh wires the RN `RefreshControl` to the underlying
 * `useSessions()` query's `refetch()`. The local `refreshing` state is the
 * UX indicator — the query's own `isFetching` is decoupled from the
 * spinner so the indicator collapses as soon as `refetch()` resolves.
 *
 * Boundary: lives under `features/`, composes design primitives + a data
 * query — no drizzle, no hex literals.
 */
import type { Session } from '@/data/accessors/session';
import { useSessions } from '@/data/queries/useSessions';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Masthead } from '@/design/primitives/Masthead';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { QueryShell } from '@/features/shared/QueryShell';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View, type ViewStyle } from 'react-native';
import { SessionListRow } from './components/SessionListRow';

/**
 * Bucket sessions into cycle groups in their existing order. `useSessions`
 * returns rows newest-first; we preserve that order both at the group level
 * (newest cycle on top) and within each group (newest session on top).
 */
function groupByCycle(sessions: ReadonlyArray<Session>): Array<{
  cycle: number;
  sessions: Session[];
}> {
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
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await sessions.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [sessions]);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };

  const rows = sessions.data ?? [];
  const grouped = useMemo(() => groupByCycle(rows), [rows]);

  if (sessions.isLoading || sessions.isError) {
    return (
      <View style={containerStyle} testID="history-screen">
        <StatusBar style="dark" />
        <Masthead rightSlot={<CapsLabel>history</CapsLabel>} />
        <QueryShell query={sessions}>{null}</QueryShell>
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
        {rows.length === 0 ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }} testID="history-empty">
            <CapsLabel style={{ letterSpacing: 1.8 }}>FINISH A SESSION TO SEE IT HERE</CapsLabel>
          </View>
        ) : (
          grouped.map((group) => (
            <CycleSection key={group.cycle} cycle={group.cycle} sessions={group.sessions} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function CycleSection({
  cycle,
  sessions: cycleSessions,
}: {
  cycle: number;
  sessions: Session[];
}) {
  const completed = cycleSessions.filter((s) => s.status === 'completed').length;
  const total = cycleSessions.length;
  const hint =
    completed === total
      ? `${total} ${total === 1 ? 'session' : 'sessions'}`
      : `${completed} of ${total} done`;
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 24 }} testID={`history-cycle-${cycle}`}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 4,
        }}
      >
        <CapsLabel weight="semibold" color="ink1">
          {`Cycle ${String(cycle).padStart(2, '0')}`}
        </CapsLabel>
        <CapsLabel size="xs" color="ink3">
          {hint}
        </CapsLabel>
      </View>
      <View>
        {cycleSessions.map((s, i) => (
          <SessionListRow key={s.id} session={s} first={i === 0} />
        ))}
      </View>
    </View>
  );
}
