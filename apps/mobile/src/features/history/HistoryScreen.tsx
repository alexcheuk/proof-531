import { Caps } from '@/design/primitives/Caps';
import { SegRail } from '@/design/primitives/SegRail';
import { Text } from '@/design/primitives/Text';
import { colors, shape } from '@/design/tokens';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { type HistorySession, HistorySessionRow } from './HistorySessionRow';

export type HistoryLift = {
  id: string;
  label: string;
};

export type HistoryScreenProps = {
  history: HistorySession[];
  unit: 'lbs' | 'kg';
  enabledLifts: HistoryLift[];
};

export function HistoryScreen({ history, unit, enabledLifts }: HistoryScreenProps) {
  const [filter, setFilter] = useState<string>('all');

  const options = [
    { value: 'all', label: 'All' },
    ...enabledLifts.map((l) => ({ value: l.id, label: l.label })),
  ];

  const filtered = filter === 'all' ? history : history.filter((s) => s.liftId === filter);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ padding: shape.rLg, gap: shape.rLg }}
      testID="history-screen"
    >
      <View style={{ gap: shape.rXs }}>
        <Caps>your record</Caps>
        <Text variant="title">History</Text>
      </View>

      <SegRail testID="history-filter" options={options} value={filter} onChange={setFilter} />

      <View style={{ gap: shape.rSm }}>
        {filtered.map((session) => (
          <HistorySessionRow key={session.id} session={session} unit={unit} />
        ))}
      </View>
    </ScrollView>
  );
}

export default HistoryScreen;
