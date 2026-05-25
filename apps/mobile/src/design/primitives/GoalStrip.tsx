import { Pressable, Text as RNText, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { CapsLabel } from './CapsLabel';

/**
 * Goal strip — full-width Pressable with dashed top and bottom rules and
 * a two-line interior. Two states:
 *
 *   - "no goal" — caps `SET AN e1RM GOAL`, mono small `TAP TO PICK A
 *     TARGET`.
 *   - "goal set" — caps `GOAL · e1RM {N} {unit}`, mono small `~{M}
 *     cycles to go` (or `already past — pick a higher target` if
 *     cyclesUntilGoal is 0).
 *
 * The dashed rules are drawn with `borderTopWidth: 1` + `borderStyle:
 * 'dashed'` on the outer container, with the same on `borderBottomWidth`.
 */
export type GoalStripProps =
  | { state: 'no-goal'; onPress: () => void; testID?: string }
  | {
      state: 'goal-set';
      onPress: () => void;
      goalValue: number;
      goalUnit: 'lb' | 'kg';
      cyclesUntilGoal: number | null;
      lift: string;
      testID?: string;
    };

const STRIP_PADDING_VERTICAL = 16;
const STRIP_GAP = 4;

export function GoalStrip(props: GoalStripProps) {
  const { colors, layout, type } = useTheme();

  const containerStyle: ViewStyle = {
    paddingVertical: STRIP_PADDING_VERTICAL,
    paddingHorizontal: layout.gutter,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: colors.lineStrong,
    borderBottomColor: colors.lineStrong,
    backgroundColor: colors.bg0,
    gap: STRIP_GAP,
  };

  const subStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 11,
    color: colors.ink3,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  if (props.state === 'no-goal') {
    return (
      <Pressable
        onPress={props.onPress}
        testID={props.testID}
        accessibilityRole="button"
        accessibilityLabel="Set an e1RM goal"
        accessibilityHint="Opens a sheet to pick a target"
        style={containerStyle}
      >
        <CapsLabel size="md" weight="medium" color="ink2">
          SET AN e1RM GOAL
        </CapsLabel>
        <RNText style={subStyle}>TAP TO PICK A TARGET</RNText>
      </Pressable>
    );
  }

  const cyclesLabel =
    props.cyclesUntilGoal === null
      ? null
      : props.cyclesUntilGoal === 0
        ? 'already past — pick a higher target'
        : `~${props.cyclesUntilGoal} cycle${props.cyclesUntilGoal === 1 ? '' : 's'} to go`;

  const a11y =
    props.cyclesUntilGoal === null
      ? `e1RM goal ${props.goalValue} ${props.goalUnit}`
      : `e1RM goal ${props.goalValue} ${props.goalUnit}, about ${props.cyclesUntilGoal} cycles to go`;

  return (
    <Pressable
      onPress={props.onPress}
      testID={props.testID}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityHint="Opens a sheet to edit the target"
      style={containerStyle}
    >
      <CapsLabel size="md" weight="medium" color="ink2">
        {`GOAL · e1RM ${props.goalValue} ${props.goalUnit}`}
      </CapsLabel>
      {cyclesLabel ? <RNText style={subStyle}>{cyclesLabel}</RNText> : null}
    </Pressable>
  );
}
