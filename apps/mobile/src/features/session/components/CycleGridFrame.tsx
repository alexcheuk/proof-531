import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { CycleGridCell } from './CycleGridCell';

const DAY_LABELS = ['D1', 'D2', 'D3', 'D4'] as const;

export type CycleGridFrameProps = {
  completedThisCycle: number;
  sessionsInCycle: number;
  testID?: string;
};

/**
 * Standalone visual grid — frame + per-day cells + week-label row. Used
 * by SessionComplete (under the `CycleGrid` header) and by Settings
 * (under the `CycleProgressSection` row) so both surfaces share one
 * visual treatment.
 */
export function CycleGridFrame({
  completedThisCycle,
  sessionsInCycle,
  testID,
}: CycleGridFrameProps) {
  const { colors, layout, type } = useTheme();

  const frame: ViewStyle = {
    marginHorizontal: layout.gutter,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  };
  const weekLabel: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink3,
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
      {/* Each label gets equal `flex: 1` width + text-centered so it sits
       * under the centre of its group of `sessionsInCycle / 4` cells,
       * not snapped to the row edges (the old `space-between` layout). */}
      <Row style={{ marginTop: 10 }}>
        {DAY_LABELS.map((d) => (
          <RNText key={d} style={[weekLabel, { flex: 1, textAlign: 'center' }]}>
            {d}
          </RNText>
        ))}
      </Row>
    </View>
  );
}
