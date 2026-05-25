import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

/**
 * Left-side label cell inside a `LedgerRow`. Sans bold primary line +
 * optional caps-mono secondary line. Flexes to consume remaining row
 * width so the right-side value cell can hug its content.
 */
export type LedgerRowLabelProps = {
  primary: string;
  secondary?: string;
};

export function LedgerRowLabel({ primary, secondary }: LedgerRowLabelProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    minWidth: 0,
  };

  const primaryStyle: TextStyle = {
    fontFamily: type.sans,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.225,
    color: colors.ink0,
  };

  const secondaryStyle: TextStyle = {
    fontFamily: type.mono,
    fontWeight: '500',
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginTop: 3,
  };

  return (
    <View style={containerStyle}>
      <RNText style={primaryStyle}>{primary}</RNText>
      {secondary ? <RNText style={secondaryStyle}>{secondary}</RNText> : null}
    </View>
  );
}
