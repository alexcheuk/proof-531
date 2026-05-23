import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { ColorToken, RadiusToken, SpacingToken } from '../tokens';

type BoxProps = {
  bg?: ColorToken;
  p?: SpacingToken;
  px?: SpacingToken;
  py?: SpacingToken;
  m?: SpacingToken;
  mx?: SpacingToken;
  my?: SpacingToken;
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  testID?: string;
};

export function Box({ bg, p, px, py, m, mx, my, radius, style, children, testID }: BoxProps) {
  const { colors, spacing, radii } = useTheme();
  const resolved: ViewStyle = {};
  if (bg) resolved.backgroundColor = colors[bg];
  if (p) resolved.padding = spacing[p];
  if (px) resolved.paddingHorizontal = spacing[px];
  if (py) resolved.paddingVertical = spacing[py];
  if (m) resolved.margin = spacing[m];
  if (mx) resolved.marginHorizontal = spacing[mx];
  if (my) resolved.marginVertical = spacing[my];
  if (radius) resolved.borderRadius = radii[radius];
  return (
    <View testID={testID} style={[resolved, style]}>
      {children}
    </View>
  );
}
