import { Text as RNText, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Right-column TM cell for the Progress grid. Three variants matching the
 * canonical design (`canonical-progress-v3.jsx::TMCellV3`):
 *
 *   - `current` — current cycle's TM. Bold display 18, color `ink0`, with
 *                 a `bg2` cell background (subtle ink-on-paper highlight).
 *   - `past`    — past cycle TM. Display 18 semibold, color `ink1`.
 *   - `future`  — projected TM. Display 18 semibold, color `ink3`.
 *
 * The per-row unit glyph was removed in loop-024 — the column header
 * already carries `→ TM lb` / `kg` so per-row duplication was just noise.
 */
export type TmCellProps = {
  /** TM value in display units, plate-snapped. */
  tm: number;
  variant: 'past' | 'current' | 'future';
  accessibilityLabel?: string;
  testID?: string;
};

export function TmCell({ tm, variant, accessibilityLabel, testID }: TmCellProps) {
  const { colors, type } = useTheme();

  const isCurrent = variant === 'current';

  const containerStyle: ViewStyle = {
    flex: 1,
    minHeight: 64,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isCurrent ? colors.bg2 : 'transparent',
  };

  const valueColor =
    variant === 'current' ? colors.ink0 : variant === 'past' ? colors.ink1 : colors.ink3;
  const valueWeight = isCurrent ? `${type.sans}-Bold` : `${type.sans}-SemiBold`;

  return (
    <View
      testID={testID}
      style={containerStyle}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      <RNText
        style={{
          fontFamily: valueWeight,
          fontSize: 18,
          color: valueColor,
          letterSpacing: -0.54,
          lineHeight: 18,
          fontVariant: ['tabular-nums', 'lining-nums'],
        }}
      >
        {tm > 0 ? String(tm) : '·'}
      </RNText>
    </View>
  );
}
