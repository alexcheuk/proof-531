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

/**
 * Standalone visual grid — frame + per-day cells + week-label row. Used
 * by SessionComplete (under the `CycleGrid` header) — the Settings
 * surface that used to host this no longer makes sense now that each
 * lift runs its own cycle.
 */
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
      {/* Each label gets equal `flex: 1` width + the SAME `gap="xs"` as the
       * cells row above. That makes each label's column align exactly with
       * its group of `sessionsInCycle / 4` cells — without the gap match the
       * label centers drift by `3 * xs / 8` from the cell-group centers. */}
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
