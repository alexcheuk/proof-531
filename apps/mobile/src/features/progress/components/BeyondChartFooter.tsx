import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

/**
 * Dashed footer rendered below the grid when the goal lies past the last
 * rendered cycle (currentCycle + 6). Matches the canonical's beyond-chart
 * marker.
 */
export type BeyondChartFooterProps = {
  cyclesBeyond: number;
  goalValue: number;
  unitGlyph: 'lb' | 'kg';
  testID?: string;
};

export function BeyondChartFooter({
  cyclesBeyond,
  goalValue,
  unitGlyph,
  testID,
}: BeyondChartFooterProps) {
  const { colors } = useTheme();

  const wrap: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.ink0,
    borderStyle: 'dashed',
  };

  return (
    <View testID={testID} style={wrap}>
      <CapsLabel weight="bold">
        {`↓ Goal · ${cyclesBeyond} cycle${cyclesBeyond === 1 ? '' : 's'} beyond chart`}
      </CapsLabel>
      <CapsLabel weight="semibold" color="ink3" style={{ letterSpacing: 1.8 }}>
        {`${goalValue}${unitGlyph}`}
      </CapsLabel>
    </View>
  );
}
