import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

/**
 * Right-side value cell inside a `LedgerRow`. Sans bold value + optional
 * caps-mono sub line. `numeric` swaps in tabular + lining numerals for
 * weight / count readouts. `tone="muted"` drops the value color to ink3
 * for placeholder rows.
 */
export type LedgerRowValueProps = {
  value: string;
  sub?: string;
  numeric?: boolean;
  tone?: 'default' | 'muted';
};

export function LedgerRowValue({
  value,
  sub,
  numeric = false,
  tone = 'default',
}: LedgerRowValueProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    alignItems: 'flex-end',
  };

  const valueStyle: TextStyle = {
    fontFamily: type.sans,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.32,
    color: tone === 'muted' ? colors.ink3 : colors.ink0,
    ...(numeric ? { fontVariant: ['tabular-nums', 'lining-nums'] } : null),
  };

  const subStyle: TextStyle = {
    fontFamily: type.mono,
    fontWeight: '500',
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginTop: 2,
  };

  return (
    <View style={containerStyle}>
      <RNText style={valueStyle}>{value}</RNText>
      {sub ? <RNText style={subStyle}>{sub}</RNText> : null}
    </View>
  );
}
