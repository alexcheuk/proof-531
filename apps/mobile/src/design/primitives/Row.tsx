import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { SpacingToken } from '../tokens';

/**
 * Row primitive  -  the canonical horizontal flex container. Replaces the
 * dozens of inline `{ flexDirection: 'row', alignItems: 'center', gap: ... }`
 * style objects scattered across features.
 *
 * Defaults: `align="center"`, no gap. Pass `gap` as a spacing token (xs/sm/md/lg/xl/xxl/xxxl).
 */
export type RowProps = {
  children?: ReactNode;
  /** Cross-axis alignment. Defaults to `center`. */
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  /** Main-axis distribution. Defaults to `flex-start`. */
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  /** Gap between children  -  pass a spacing token. */
  gap?: SpacingToken;
  /** Allow wrapping when content exceeds row width. */
  wrap?: boolean;
  /** Escape hatch for one-off layout tweaks (margins, flex, etc). */
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Row({
  children,
  align = 'center',
  justify = 'flex-start',
  gap,
  wrap = false,
  style,
  testID,
}: RowProps) {
  const { spacing } = useTheme();
  const resolved: ViewStyle = {
    flexDirection: 'row',
    alignItems: align,
    justifyContent: justify,
  };
  if (gap) resolved.gap = spacing[gap];
  if (wrap) resolved.flexWrap = 'wrap';
  return (
    <View testID={testID} style={[resolved, style]}>
      {children}
    </View>
  );
}
