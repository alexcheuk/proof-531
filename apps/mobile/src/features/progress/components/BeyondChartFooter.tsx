import { useTheme } from '@/design/theme';
import { Text as RNText, View, type ViewStyle } from 'react-native';

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
  const { colors, type } = useTheme();

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
      <RNText
        style={{
          fontFamily: `${type.mono}-Bold`,
          fontSize: 10,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          color: colors.ink2,
        }}
      >
        {`↓ Goal · ${cyclesBeyond} cycle${cyclesBeyond === 1 ? '' : 's'} beyond chart`}
      </RNText>
      <RNText
        style={{
          fontFamily: `${type.mono}-SemiBold`,
          fontSize: 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: colors.ink3,
        }}
      >
        {`${goalValue}${unitGlyph}`}
      </RNText>
    </View>
  );
}
