import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Paper-themed loading placeholder. Replaces the blank-canvas pattern that
 * screens used to flash before a query resolved (`return null`) with a
 * subtly-inked rectangle so the first paint feels intentional.
 *
 * Static (no pulse animation). The skeleton typically flashes for <300ms
 * before real content swaps in — a pulse over that window reads as visual
 * noise, not as motion. The fixed-opacity treatment also keeps the test
 * surface free of Reanimated runtime dependencies. Tone defaults to the
 * hairline `line` token so it disappears against the paper bg while still
 * hinting at structure.
 */
export type SkeletonProps = {
  /** Width — number (px) or percentage string. */
  width?: number | `${number}%`;
  /** Height in px. Defaults to 12. */
  height?: number;
  /** Visual tone — defaults to the hairline `line` token. */
  tone?: 'line' | 'lineStrong';
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = '100%',
  height = 12,
  tone = 'line',
  testID,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const base: ViewStyle = {
    width,
    height,
    backgroundColor: tone === 'lineStrong' ? colors.lineStrong : colors.line,
  };
  return <View testID={testID} style={[base, style]} />;
}
