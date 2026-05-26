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
 * Unit glyph (`lb` / `kg`) rendered underneath in caps mono 8.
 */
export type TmCellProps = {
  /** TM value in display units, plate-snapped. */
  tm: number;
  variant: 'past' | 'current' | 'future';
  unitGlyph: 'lb' | 'kg';
  accessibilityLabel?: string;
  testID?: string;
};

export function TmCell({ tm, variant, unitGlyph, accessibilityLabel, testID }: TmCellProps) {
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
      <RNText
        style={{
          fontFamily: `${type.mono}-SemiBold`,
          fontSize: 8,
          color: colors.ink3,
          letterSpacing: 1.44,
          textTransform: 'uppercase',
          marginTop: 2,
        }}
      >
        {unitGlyph}
      </RNText>
    </View>
  );
}
