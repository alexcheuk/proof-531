import { ProgressRing } from '@/design/plates/ProgressRing';
import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { Text } from '@/design/primitives/Text';
import { colors, shape } from '@/design/tokens';
import { ScrollView, View } from 'react-native';
import { CycleCell, type CycleCellState } from './CycleCell';

export type CycleLift = { id: string; label: string; trainingMax: number };
export type CompletedSession = { week: 1 | 2 | 3 | 4; liftId: string };

export type CycleScreenProps = {
  cycleNumber: number;
  weekOfCycle: 1 | 2 | 3 | 4;
  lifts: CycleLift[];
  completedSessions: CompletedSession[];
  unit: 'lbs' | 'kg';
  onSelectDay?: (week: number, liftId: string) => void;
};

const WEEKS: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];

function cellState(
  week: 1 | 2 | 3 | 4,
  liftId: string,
  weekOfCycle: 1 | 2 | 3 | 4,
  completed: CompletedSession[],
): CycleCellState {
  if (completed.some((c) => c.week === week && c.liftId === liftId)) return 'done';
  if (week === 4) return 'deload';
  if (week === weekOfCycle) return 'current';
  return 'future';
}

export function CycleScreen({
  cycleNumber,
  weekOfCycle,
  lifts,
  completedSessions,
  unit,
  onSelectDay,
}: CycleScreenProps) {
  const total = WEEKS.length * lifts.length;
  const progress = total === 0 ? 0 : completedSessions.length / total;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ padding: shape.rLg, gap: shape.rLg }}
      testID="cycle-screen"
    >
      <View style={{ gap: shape.rXs }}>
        <Caps>cycle in progress</Caps>
        <Text variant="title">Cycle {cycleNumber}</Text>
      </View>

      <Card padded testID="cycle-progress-card">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: shape.rMd }}>
          <ProgressRing progress={progress} />
          <View style={{ flex: 1, gap: shape.rXs }}>
            <Caps>{`Week ${weekOfCycle} of 4`}</Caps>
            <Text variant="small" tone="ink2">
              {`${completedSessions.length} of ${total} sessions done`}
            </Text>
          </View>
        </View>
      </Card>

      <View testID="cycle-grid" style={{ gap: shape.rSm }}>
        <Caps>{`4 weeks · ${lifts.length} ${lifts.length === 1 ? 'lift' : 'lifts'}`}</Caps>
        {WEEKS.map((w) => (
          <View key={w} testID={`cycle-row-${w}`} style={{ flexDirection: 'row', gap: shape.rSm }}>
            <View style={{ width: shape.weekLabel, justifyContent: 'center' }}>
              <Text variant="smallBold">{`W${w}`}</Text>
              <Caps>{w === 4 ? 'deload' : w === 1 ? '5s' : w === 2 ? '3s' : '5/3/1'}</Caps>
            </View>
            {lifts.map((lift) => (
              <View key={lift.id} style={{ flex: 1 }}>
                <CycleCell
                  week={w}
                  liftId={lift.id}
                  liftLabel={lift.label}
                  trainingMax={lift.trainingMax}
                  unit={unit}
                  state={cellState(w, lift.id, weekOfCycle, completedSessions)}
                  onPress={() => onSelectDay?.(w, lift.id)}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default CycleScreen;
