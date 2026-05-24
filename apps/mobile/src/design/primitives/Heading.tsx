import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { ColorToken } from '../tokens';

/**
 * Display / hero heading primitive. The codebase has many hand-rolled
 * `fontFamily: ${type.sans}-Bold + fontSize: N + letterSpacing: -(N*0.03)`
 * blobs — `<Heading>` consolidates those into four named variants.
 *
 * Variants (size · letter-spacing · default line-height):
 *   - `s`        — 22 · -0.66 · 26  (compact editor titles, "Stronger")
 *   - `m`        — 26 · -0.78 · 30  (sheet display titles, "Reset everything?")
 *   - `l`        — 40 · -1.4  · 46  (onboarding section titles, "Back squat.")
 *   - `xl`       — 64 · -2.88 · 60  (screen masthead, "In the / book")
 *   - `huge`     — 92 · -4.6  · 90  (PR cert hero number, RestPhase clock)
 *
 * Default weight is `bold`; pass `weight="medium"` for the lighter masthead
 * accent (e.g. SessionComplete's eyebrow). Letter-spacing follows the PWA
 * tracking ratio (~-0.045em).
 */
export type HeadingProps = {
  children: ReactNode;
  /** Size variant — see component docstring. Defaults to `m`. */
  size?: 's' | 'm' | 'l' | 'xl' | 'huge';
  /** Weight token. Defaults to `bold`. */
  weight?: 'medium' | 'bold';
  /** Color token. Defaults to `ink0`. */
  color?: ColorToken;
  /** Optional line-height override. Defaults are tuned per variant. */
  lineHeight?: number;
  /** Use tabular numerals — useful for huge weight readouts that re-flow as values change. */
  numeric?: boolean;
  style?: StyleProp<TextStyle>;
  testID?: string;
  numberOfLines?: number;
};

const SIZES: Record<NonNullable<HeadingProps['size']>, { size: number; ls: number; lh: number }> = {
  s: { size: 22, ls: -0.66, lh: 26 },
  m: { size: 26, ls: -0.78, lh: 30 },
  l: { size: 40, ls: -1.4, lh: 46 },
  xl: { size: 64, ls: -2.88, lh: 60 },
  huge: { size: 92, ls: -4.6, lh: 90 },
};

export function Heading({
  children,
  size = 'm',
  weight = 'bold',
  color = 'ink0',
  lineHeight,
  numeric,
  style,
  testID,
  numberOfLines,
}: HeadingProps) {
  const { colors, type } = useTheme();
  const variant = SIZES[size];
  const fontFamily = `${type.sans}-${weight === 'medium' ? 'Medium' : 'Bold'}`;
  const resolved: TextStyle = {
    fontFamily,
    fontSize: variant.size,
    letterSpacing: variant.ls,
    lineHeight: lineHeight ?? variant.lh,
    color: colors[color],
  };
  if (numeric) {
    resolved.fontVariant = ['tabular-nums', 'lining-nums'];
  }
  return (
    <RNText
      {...(testID !== undefined ? { testID } : {})}
      {...(numberOfLines !== undefined ? { numberOfLines } : {})}
      style={[resolved, style]}
    >
      {children}
    </RNText>
  );
}
