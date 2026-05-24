import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle, View } from 'react-native';
import { CycleGridFrame } from './CycleGridFrame';

export type CycleGridProps = {
  cycle: number;
  completedThisCycle: number;
  sessionsInCycle: number;
};

/**
 * Cycle № NN header + visual 16-cell (or 4n-cell) grid showing position
 * within the current cycle. The visual grid is `CycleGridFrame`; this
 * shell adds the `Cycle № NN · N of M` header row above it.
 */
export function CycleGrid({ cycle, completedThisCycle, sessionsInCycle }: CycleGridProps) {
  const { colors, layout, type } = useTheme();

  const headerLabel: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };
  const headerHint: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink3,
  };

  return (
    <View style={{ paddingTop: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 8, paddingHorizontal: layout.gutter }}>
        <RNText style={headerLabel}>{`Cycle № ${String(cycle ?? 1).padStart(2, '0')}`}</RNText>
        <RNText style={headerHint}>{`${completedThisCycle} of ${sessionsInCycle}`}</RNText>
      </Row>
      <CycleGridFrame completedThisCycle={completedThisCycle} sessionsInCycle={sessionsInCycle} />
    </View>
  );
}
