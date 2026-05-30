import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';
import { CycleGridCell } from './CycleGridCell';

const DAY_LABELS = ['D1', 'D2', 'D3', 'D4'] as const;

export type CycleGridFrameProps = {
  completedThisCycle: number;
  sessionsInCycle: number;
  testID?: string;
};

export function CycleGridFrame({
  completedThisCycle,
  sessionsInCycle,
  testID,
}: CycleGridFrameProps) {
  const { colors, layout } = useTheme();

  const frame: ViewStyle = {
    marginHorizontal: layout.gutter,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  };
  return (
    <View style={frame}>
      <Row gap="xs" {...(testID !== undefined ? { testID } : { testID: 'cycle-grid' })}>
        {Array.from({ length: sessionsInCycle }).map((_, i) => (
          <CycleGridCell
            // biome-ignore lint/suspicious/noArrayIndexKey: positional grid cell
            key={`cell-${i}`}
            done={i < completedThisCycle}
            justNow={i === completedThisCycle - 1}
          />
        ))}
      </Row>
      {/* gap="xs" must match the cells row above — otherwise label columns drift from their cell groups */}
      <Row gap="xs" style={{ marginTop: 10 }}>
        {DAY_LABELS.map((d) => (
          <CapsLabel key={d} size="xs" color="ink3" style={{ flex: 1, textAlign: 'center' }}>
            {d}
          </CapsLabel>
        ))}
      </Row>
    </View>
  );
}
