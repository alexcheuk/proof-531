import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { View } from 'react-native';
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
  const { layout } = useTheme();

  return (
    <View style={{ paddingTop: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 8, paddingHorizontal: layout.gutter }}>
        <CapsLabel weight="semibold" color="ink2">
          {`Cycle № ${String(cycle ?? 1).padStart(2, '0')}`}
        </CapsLabel>
        <CapsLabel color="ink3" style={{ letterSpacing: 1.8 }}>
          {`${completedThisCycle} of ${sessionsInCycle}`}
        </CapsLabel>
      </Row>
      <CycleGridFrame completedThisCycle={completedThisCycle} sessionsInCycle={sessionsInCycle} />
    </View>
  );
}
