import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, type } from '../tokens';

export type CapsProps = RNTextProps;

const STYLE: TextStyle = {
  fontFamily: type.mono,
  fontSize: 10,
  fontWeight: '600',
  letterSpacing: 1.8,
  textTransform: 'uppercase',
  color: colors.ink2,
};

export function Caps({ style, ...rest }: CapsProps) {
  const merged: TextStyle = style ? { ...STYLE, ...(style as TextStyle) } : STYLE;
  return <RNText style={merged} {...rest} />;
}
