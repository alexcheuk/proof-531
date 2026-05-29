import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

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
  const { colors } = useTheme();

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
          <CapsLabel weight="bold" color="ink0">
            {`Goal · ${kind === 'tm' ? 'training max' : '1rm'} ${value}${unitGlyph}`}
          </CapsLabel>
        </View>
        {kind === '1rm' ? (
          <CapsLabel size="xs" weight="semibold">
            {`tm ≈ ${targetTm}${unitGlyph}`}
          </CapsLabel>
        ) : null}
      </View>
    </View>
  );
}
