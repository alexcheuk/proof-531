import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

/**
 * `╌╌╌ GOAL {N} {unit} ╌╌╌` divider rendered between the two cycle rows
 * whose projected e1RMs straddle the user's goal. Lives in
 * `features/progress/components/` because it is progression-screen-
 * specific — generalising it into a design primitive would be premature.
 *
 * Dashed rule on top + bottom matches the GoalStrip's visual language so
 * the two "goal" surfaces (header strip + mid-grid rule) feel related.
 */
export type GoalRuleRowProps = {
  goalValue: number;
  unit: 'lb' | 'kg';
  testID?: string;
};

const RULE_HEIGHT = 18;

export function GoalRuleRow({ goalValue, unit, testID }: GoalRuleRowProps) {
  const { colors, type, spacing } = useTheme();

  const wrap: ViewStyle = {
    height: RULE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  };

  const ruleStyle: ViewStyle = {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: colors.lineStrong,
  };

  const labelStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  return (
    <View
      testID={testID}
      style={wrap}
      accessibilityLabel={`Goal line, ${goalValue} ${unit}`}
      accessibilityRole="text"
    >
      <View style={ruleStyle} />
      <RNText style={labelStyle}>{`GOAL ${goalValue} ${unit}`}</RNText>
      <View style={ruleStyle} />
    </View>
  );
}
