import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme';

export type TextVariant = 'default' | 'title' | 'subtitle' | 'small' | 'smallBold' | 'caption';

export type TextTone = 'ink0' | 'ink1' | 'ink2' | 'ink3' | 'ink4' | 'hot' | 'lime';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  default: { fontSize: 15, fontWeight: '400' },
  title: { fontSize: 28, fontWeight: '600', letterSpacing: -0.5 },
  subtitle: { fontSize: 20, fontWeight: '500' },
  small: { fontSize: 13, fontWeight: '400' },
  smallBold: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 11, fontWeight: '400' },
};

export function Text({ variant = 'default', tone = 'ink0', style, ...rest }: TextProps) {
  const theme = useTheme();
  const base: TextStyle = {
    fontFamily: theme.type.sans,
    color: theme.colors[tone],
    ...VARIANT_STYLES[variant],
  };
  const merged: TextStyle = style ? { ...base, ...(style as TextStyle) } : base;
  return <RNText style={merged} {...rest} />;
}
