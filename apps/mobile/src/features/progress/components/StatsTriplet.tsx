import { useTheme } from '@/design/theme';
import { Text as RNText, View, type ViewStyle } from 'react-native';

/**
 * 3-column stats strip — Training Max · Best e1RM · Cycle. Matches the
 * canonical `StatsTripletV3`. Hairline left border between columns, bottom
 * hairline rule under the whole strip. Lives in `features/progress/` since
 * it's progression-screen-specific.
 */
export type StatsTripletProps = {
  tm: number;
  /** Best lifetime e1RM in display units. 0/null renders as `—` with no unit suffix. */
  bestE1RM: number | null;
  cycle: number;
  unitGlyph: 'lb' | 'kg';
  testID?: string;
};

export function StatsTriplet({ tm, bestE1RM, cycle, unitGlyph, testID }: StatsTripletProps) {
  const { colors, layout, type } = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    paddingHorizontal: layout.gutter,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  };

  const e1rmHas = !!bestE1RM && bestE1RM > 0;

  const cells: Array<{ label: string; value: string; suffix: string | null }> = [
    { label: 'Training max', value: String(tm), suffix: unitGlyph },
    {
      label: 'Best e1rm',
      value: e1rmHas ? String(bestE1RM) : '—',
      suffix: e1rmHas ? unitGlyph : null,
    },
    { label: 'Cycle', value: `C${cycle}`, suffix: null },
  ];

  return (
    <View style={containerStyle} testID={testID}>
      {cells.map((c, i) => (
        <View
          key={c.label}
          style={{
            flex: 1,
            paddingVertical: 16,
            paddingLeft: i > 0 ? 14 : 0,
            borderLeftWidth: i > 0 ? 1 : 0,
            borderLeftColor: colors.line,
          }}
        >
          <RNText
            style={{
              fontFamily: `${type.mono}-SemiBold`,
              fontSize: 9,
              letterSpacing: 1.98,
              textTransform: 'uppercase',
              color: colors.ink2,
              marginBottom: 4,
            }}
          >
            {c.label}
          </RNText>
          <RNText
            style={{
              fontFamily: `${type.sans}-Bold`,
              fontSize: 26,
              color: colors.ink0,
              letterSpacing: -0.78,
              // rn-line-height-ok: tabular numeric stats only
              lineHeight: 26,
              fontVariant: ['tabular-nums', 'lining-nums'],
            }}
          >
            {c.value}
            {c.suffix ? (
              <RNText
                style={{
                  fontFamily: `${type.mono}-SemiBold`,
                  fontSize: 11,
                  letterSpacing: 1.98,
                  color: colors.ink3,
                }}
              >
                {' '}
                {c.suffix}
              </RNText>
            ) : null}
          </RNText>
        </View>
      ))}
    </View>
  );
}
