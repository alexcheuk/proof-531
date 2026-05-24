import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { ColorToken, SpacingToken } from '../tokens';

/**
 * Bordered container primitive — replaces the recurring `borderWidth: 1,
 * borderColor: colors.line, padding...` blobs scattered across feature
 * components (LiftPageEmpty, PickLifts callout, FilterChips wrapper, etc.).
 *
 * Borders inherit from the theme palette; pick `tone="strong"` for a
 * heavier hairline (lineStrong), or `tone="dashed"` for a Polaroid-style
 * dashed border used in callouts.
 */
export type CardProps = {
  children?: ReactNode;
  /** Border palette. Defaults to `'default'` (the line token). */
  tone?: 'default' | 'strong' | 'dashed';
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
  const cardStyle: ViewStyle = {
    borderWidth: 1,
    borderColor,
  };
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
