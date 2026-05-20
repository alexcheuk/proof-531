import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme';

export type TextVariant =
  | 'default'
  | 'title'
  | 'subtitle'
  | 'small'
  | 'smallBold'
  | 'caption'
  | 'hero' // 64 / 0.95 / -0.035em — split-line lift name
  | 'display' // 44 / 0.98 / -0.025em — secondary hero
  | 'logo' // 22 / 1 / 0 — the "531." brand mark
  | 'bigWeight' // 48 / 1 / -0.02em — top-set weight number
  | 'monoLg'; // 18 mono uppercase 0.08em

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
  hero: { fontSize: 64, fontWeight: '400', letterSpacing: -2.25, lineHeight: 64 * 0.95 },
  display: { fontSize: 44, fontWeight: '400', letterSpacing: -1.1, lineHeight: 44 * 0.98 },
  logo: { fontSize: 22, fontWeight: '600', letterSpacing: 0 },
  bigWeight: { fontSize: 48, fontWeight: '600', letterSpacing: -1, lineHeight: 48 },
  monoLg: { fontSize: 18, fontWeight: '500', letterSpacing: 1.4, textTransform: 'uppercase' },
};

const DISPLAY_VARIANTS: ReadonlySet<TextVariant> = new Set([
  'hero',
  'display',
  'logo',
  'bigWeight',
]);

export function Text({ variant = 'default', tone = 'ink0', style, ...rest }: TextProps) {
  const theme = useTheme();
  const fontFamily = DISPLAY_VARIANTS.has(variant)
    ? theme.type.display
    : variant === 'monoLg'
      ? theme.type.mono
      : theme.type.sans;
  const base: TextStyle = {
    fontFamily,
    color: theme.colors[tone],
    ...VARIANT_STYLES[variant],
  };
  const merged: TextStyle = style ? { ...base, ...(style as TextStyle) } : base;
  return <RNText style={merged} {...rest} />;
}
