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
import { useSessions } from '@/data/queries/useSessions';
import { Masthead } from '@/design/primitives/Masthead';
import { Text } from '@/design/primitives/Text';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { QueryShell } from '@/features/shared/QueryShell';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View, type ViewStyle } from 'react-native';
import { SessionListRow } from './components/SessionListRow';

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

  if (sessions.isLoading || sessions.isError) {
    return (
      <View style={containerStyle} testID="history-screen">
        <Masthead
          rightSlot={
            <Text
              variant="mono"
              weight="medium"
              size={10}
              color="ink2"
              style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
            >
              history
            </Text>
          }
        />
        <QueryShell query={sessions}>{null}</QueryShell>
      </View>
    );
  }

  return (
    <View style={containerStyle} testID="history-screen">
      <Masthead
        rightSlot={
          <Text
            variant="mono"
            weight="medium"
            size={10}
            color="ink2"
            style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
          >
            history
          </Text>
        }
      />
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
            <Text
              variant="mono"
              weight="medium"
              size={10}
              color="ink2"
              style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
            >
              FINISH A SESSION TO SEE IT HERE
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 24 }}>
            {rows.map((s, i) => (
              <SessionListRow key={s.id} session={s} first={i === 0} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
