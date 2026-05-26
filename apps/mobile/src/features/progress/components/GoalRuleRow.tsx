import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import { useTheme } from '@/design/theme';
import { Text as RNText, View, type ViewStyle } from 'react-native';

/**
 * Horizontal goal rule dropped INTO the grid between the two cycle rows
 * whose projected TMs straddle the goal. Per canonical: 2-px top border +
 * 1-px bottom border (both `ink0`), `bg2` background, left "Goal · {kind}
 * {value}{unit}" label and right "tm ≈ N {unit}" detail (1RM mode only).
 *
 * Spans the full grid width and aligns flush with the grid's outer borders
 * since it sits inside the same container as the rows.
 */
export type GoalRuleRowProps = {
  kind: LiftGoalKind;
  value: number;
  /** TM equivalent of the goal (shown on the right only for kind=1rm). */
  targetTm: number;
  unitGlyph: 'lb' | 'kg';
  testID?: string;
};

export function GoalRuleRow({ kind, value, targetTm, unitGlyph, testID }: GoalRuleRowProps) {
  const { colors, type } = useTheme();

  const wrap: ViewStyle = {
    borderTopWidth: 2,
    borderTopColor: colors.ink0,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink0,
    backgroundColor: colors.bg2,
  };

  return (
    <View testID={testID} style={wrap} accessibilityLabel={`Goal line, ${value} ${unitGlyph}`}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 14,
              height: 1,
              backgroundColor: colors.ink0,
            }}
          />
          <RNText
            style={{
              fontFamily: `${type.mono}-Bold`,
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: colors.ink0,
            }}
          >
            {`Goal · ${kind === 'tm' ? 'training max' : '1rm'} ${value}${unitGlyph}`}
          </RNText>
        </View>
        {kind === '1rm' ? (
          <RNText
            style={{
              fontFamily: `${type.mono}-SemiBold`,
              fontSize: 9,
              letterSpacing: 1.62,
              textTransform: 'uppercase',
              color: colors.ink2,
            }}
          >
            {`tm ≈ ${targetTm}${unitGlyph}`}
          </RNText>
        ) : null}
      </View>
    </View>
  );
}
