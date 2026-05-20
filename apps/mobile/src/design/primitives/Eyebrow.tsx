import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, type } from '../tokens';

export type EyebrowProps = RNTextProps;

const STYLE: TextStyle = {
  fontFamily: type.mono,
  fontSize: 11,
  fontWeight: '500',
  letterSpacing: 1.76,
  textTransform: 'uppercase',
  color: colors.ink2,
};

export function Eyebrow({ style, ...rest }: EyebrowProps) {
  const merged: TextStyle = style ? { ...STYLE, ...(style as TextStyle) } : STYLE;
  return <RNText style={merged} {...rest} />;
}
