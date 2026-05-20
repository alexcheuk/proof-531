import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { colors, type } from '../tokens';

export type WeightNumSize = 'sm' | 'md' | 'lg';

export type WeightNumProps = {
  value: number | string;
  size?: WeightNumSize;
  style?: StyleProp<TextStyle>;
};

const SIZES: Record<WeightNumSize, number> = {
  sm: 14,
  md: 22,
  lg: 36,
};

export function WeightNum({ value, size = 'md', style }: WeightNumProps) {
  const fontSize = SIZES[size];
  const base: TextStyle = {
    fontFamily: type.mono,
    fontWeight: '500',
    fontSize,
    letterSpacing: -fontSize * 0.04,
    color: colors.ink0,
    fontVariant: ['tabular-nums'],
  };
  const merged: TextStyle = style ? { ...base, ...(style as TextStyle) } : base;
  return <RNText style={merged}>{String(value)}</RNText>;
}
