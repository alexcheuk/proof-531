import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { ColorToken, SpacingToken } from '../tokens';

/**
 * Bordered container primitive  -  replaces the recurring `borderWidth: 1,
 * borderColor: colors.line, padding...` blobs scattered across feature
 * components.
 *
 * `tone` controls border palette:
 *   - `default`  hairline (the `line` token)
 *   - `strong`   heavier hairline (the `lineStrong` token)
 *   - `dashed`   Polaroid-style dashed border (used in callouts)
 *
 * `borders` controls which sides get a 1px stroke:
 *   - `all`        all four sides (default  -  typical card)
 *   - `topBottom`  band-style stroke top + bottom
 *   - `bottom`     hairline bottom only (anchors under an existing top border)
 */
export type CardProps = {
  children?: ReactNode;
  /** Border palette. Defaults to `'default'`. */
  tone?: 'default' | 'strong' | 'dashed';
  /** Which sides get a 1px stroke. Defaults to `'all'`. */
  borders?: 'all' | 'topBottom' | 'bottom';
  /** Padding token applied uniformly. Use `px`/`py` to override per-axis. */
  padding?: SpacingToken;
  px?: SpacingToken;
  py?: SpacingToken;
  /** Background color. Defaults to transparent (paper canvas shows through). */
  bg?: ColorToken;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Card({
  children,
  tone = 'default',
  borders = 'all',
  padding,
  px,
  py,
  bg,
  style,
  testID,
}: CardProps) {
  const { colors, spacing } = useTheme();
  const borderColor =
    tone === 'strong' ? colors.lineStrong : tone === 'dashed' ? colors.lineStrong : colors.line;
  const cardStyle: ViewStyle = {};
  if (borders === 'all') {
    cardStyle.borderWidth = 1;
    cardStyle.borderColor = borderColor;
  } else if (borders === 'topBottom') {
    cardStyle.borderTopWidth = 1;
    cardStyle.borderBottomWidth = 1;
    cardStyle.borderColor = borderColor;
  } else {
    // bottom  -  hairline anchor below the card, no top/sides. Use this
    // when the card sits directly under another border (e.g. a TitleBlock)
    // and a top hairline would double the line.
    cardStyle.borderBottomWidth = 1;
    cardStyle.borderBottomColor = borderColor;
  }
  if (tone === 'dashed') {
    cardStyle.borderStyle = 'dashed';
  }
  if (padding !== undefined) cardStyle.padding = spacing[padding];
  if (px !== undefined) cardStyle.paddingHorizontal = spacing[px];
  if (py !== undefined) cardStyle.paddingVertical = spacing[py];
  if (bg !== undefined) cardStyle.backgroundColor = colors[bg];
  return (
    <View testID={testID} style={[cardStyle, style]}>
      {children}
    </View>
  );
}
