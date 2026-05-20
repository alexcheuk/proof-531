import { View, type ViewProps, type ViewStyle } from 'react-native';
import { type Colors, type Shape, colors, shape } from '../tokens';

type ShapeKey = keyof Shape;
type ColorKey = keyof Colors;

export type BoxProps = ViewProps & {
  padding?: ShapeKey;
  margin?: ShapeKey;
  gap?: ShapeKey;
  radius?: ShapeKey;
  bg?: ColorKey;
  borderColor?: ColorKey;
};

export function Box({ padding, margin, gap, radius, bg, borderColor, style, ...rest }: BoxProps) {
  const computed: ViewStyle = {};
  if (padding !== undefined) computed.padding = shape[padding];
  if (margin !== undefined) computed.margin = shape[margin];
  if (gap !== undefined) computed.gap = shape[gap];
  if (radius !== undefined) computed.borderRadius = shape[radius];
  if (bg !== undefined) computed.backgroundColor = colors[bg];
  if (borderColor !== undefined) {
    computed.borderColor = colors[borderColor];
    computed.borderWidth = 1;
  }

  // Merge passed-through style on top so callers can override.
  const merged: ViewStyle = style ? { ...computed, ...(style as ViewStyle) } : computed;
  return <View style={merged} {...rest} />;
}
