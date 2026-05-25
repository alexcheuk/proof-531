import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Right-column e1RM cell for the Progress grid row. Two variants:
 *
 *   - `past`      — actual best e1RM for the cycle (computed from AMRAP
 *                   rows). Color `ink0`.
 *   - `projected` — future projection. Color `ink2` so the past column
 *                   reads as "what really happened" vs. "what's coming".
 *
 * Optional trailing `★` for the first projected cycle whose e1RM ≥ the
 * user's goal. Pure presentation — the row decides whether to render the
 * achievement marker.
 */
export type E1rmCellProps = {
  value: number;
  variant: 'past' | 'projected';
  showAchievement?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

const VALUE_FONT_SIZE = 16;
const STAR_FONT_SIZE = 14;
const CELL_HEIGHT = 56;
const COLUMN_FLEX = 0.8;

export function E1rmCell({
  value,
  variant,
  showAchievement,
  accessibilityLabel,
  testID,
}: E1rmCellProps) {
  const { colors, type, spacing } = useTheme();

  const containerStyle: ViewStyle = {
    flex: COLUMN_FLEX,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  };

  const valueStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: VALUE_FONT_SIZE,
    color: variant === 'past' ? colors.ink0 : colors.ink2,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const starStyle: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: STAR_FONT_SIZE,
    color: colors.ink0,
  };

  return (
    <View
      testID={testID}
      style={containerStyle}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      <RNText style={valueStyle}>{value > 0 ? String(value) : '·'}</RNText>
      {showAchievement ? <RNText style={starStyle}>★</RNText> : null}
    </View>
  );
}

export const E1RM_COLUMN_FLEX = COLUMN_FLEX;
