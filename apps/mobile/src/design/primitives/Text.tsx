import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { ColorToken } from '../tokens';

const WEIGHT_SUFFIX = {
  regular: 'Regular',
  medium: 'Medium',
  semibold: 'SemiBold',
  bold: 'Bold',
} as const;

const FAMILY_KEY = {
  sans: 'sans',
  mono: 'mono',
  condensed: 'displayCond',
} as const;

type TextProps = {
  variant: 'sans' | 'mono' | 'condensed';
  weight: 'regular' | 'medium' | 'semibold' | 'bold';
  size: number;
  color?: ColorToken;
  /** Apply tabular + lining numerals  -  for weight / clock readouts. */
  numeric?: boolean;
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
  testID?: string;
  numberOfLines?: number;
};

export function Text({
  variant,
  weight,
  size,
  color,
  numeric,
  style,
  children,
  testID,
  numberOfLines,
}: TextProps) {
  const { type, colors } = useTheme();
  const baseFamily = type[FAMILY_KEY[variant]];
  const fontFamily = `${baseFamily}-${WEIGHT_SUFFIX[weight]}`;
  const resolved: TextStyle = {
    fontFamily,
    fontSize: size,
    color: colors[color ?? 'ink0'],
  };
  if (numeric) {
    resolved.fontVariant = ['tabular-nums', 'lining-nums'];
  }
  return (
    <RNText testID={testID} numberOfLines={numberOfLines} style={[resolved, style]}>
      {children}
    </RNText>
  );
}
