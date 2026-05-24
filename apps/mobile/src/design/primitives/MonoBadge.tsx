import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Outlined caps-mono chip — the LEDGER "badge" idiom. Ported from PWA
 * `src/components/ui/mono-badge.tsx`. Used inline next to numerics
 * (AMRAP / UP NEXT, the stamp column on ReceiptRow, "Filed" on
 * SessionCompleteScreen).
 *
 * `size="sm"` (default) is the inline chip baseline-aligned with a numeric
 * cluster: 9px glyph, ~11px total chip height.
 * `size="md"` is the standalone masthead chip: 10px glyph, ~18px total chip
 * height.
 *
 * Vertical centering: `lineHeight === fontSize` collapses the line-box to
 * the glyph height (keeps the chip's baseline aligned with display numerics
 * in the same row), but IBM Plex Mono Bold caps render in the top ~76% of
 * their em box — symmetric `paddingVertical` then makes the glyph appear
 * top-loaded inside the chip. We compensate by splitting the padding so
 * `paddingTop > paddingBottom` (one extra pixel above the line-box) which
 * nudges the visible glyph down to the optical center without changing the
 * chip's outer height.
 *
 * Letter spacing follows the PWA's `tracking-[0.22em]` — 22% of font size,
 * hardcoded per size to avoid runtime math on a constant.
 */

type MonoBadgeSize = 'sm' | 'md';

type SizeStyle = {
  fontSize: number;
  letterSpacing: number;
  paddingTop: number;
  paddingBottom: number;
  paddingHorizontal: number;
};

const SIZE_STYLES: Record<MonoBadgeSize, SizeStyle> = {
  sm: {
    fontSize: 9,
    letterSpacing: 1.98, // 0.22em × 9
    paddingTop: 2,
    paddingBottom: 2,
    paddingHorizontal: 6,
  },
  md: {
    fontSize: 10,
    letterSpacing: 2.2, // 0.22em × 10
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 8,
  },
};

export type MonoBadgeProps = {
  children: ReactNode;
  size?: MonoBadgeSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function MonoBadge({ children, size = 'sm', style, testID }: MonoBadgeProps) {
  const { colors } = useTheme();
  const sizing = SIZE_STYLES[size];

  const containerStyle: ViewStyle = {
    borderWidth: 1,
    borderColor: colors.ink0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    paddingTop: sizing.paddingTop,
    paddingBottom: sizing.paddingBottom,
    paddingHorizontal: sizing.paddingHorizontal,
  };

  const textStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Bold',
    fontSize: sizing.fontSize,
    lineHeight: sizing.fontSize,
    letterSpacing: sizing.letterSpacing,
    color: colors.ink0,
    textTransform: 'uppercase',
    textAlign: 'center',
    // Android: drop the font's internal padding around the line-box so the
    // glyph sits where our explicit padding puts it (iOS doesn't add this
    // padding so the prop is a no-op there).
    includeFontPadding: false,
    // letterSpacing adds trailing space after the last glyph, which makes the
    // text appear left-shifted inside a centered container. Pulling the right
    // edge back by `letterSpacing` re-centers the visible glyphs.
    marginRight: -sizing.letterSpacing,
  };

  return (
    <View testID={testID} style={[containerStyle, style]}>
      <RNText style={textStyle}>{children}</RNText>
    </View>
  );
}
