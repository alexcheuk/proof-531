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
 * cluster: 9px glyph, 1px vertical + 6px horizontal padding.
 * `size="md"` is the standalone masthead chip: 10px glyph, 4px vertical +
 * 8px horizontal padding.
 *
 * Letter spacing follows the PWA's `tracking-[0.22em]` — 22% of font size,
 * hardcoded per size to avoid runtime math on a constant.
 *
 * `lineHeight === fontSize` collapses the line-box to the glyph height so
 * the chip's baseline aligns with display numerics in the same row.
 */

type MonoBadgeSize = 'sm' | 'md';

type SizeStyle = {
  fontSize: number;
  letterSpacing: number;
  paddingVertical: number;
  paddingHorizontal: number;
};

const SIZE_STYLES: Record<MonoBadgeSize, SizeStyle> = {
  sm: {
    fontSize: 9,
    letterSpacing: 1.98, // 0.22em × 9
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  md: {
    fontSize: 10,
    letterSpacing: 2.2, // 0.22em × 10
    paddingVertical: 4,
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
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.ink0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    paddingVertical: sizing.paddingVertical,
    paddingHorizontal: sizing.paddingHorizontal,
  };

  const textStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Bold',
    fontSize: sizing.fontSize,
    lineHeight: sizing.fontSize,
    letterSpacing: sizing.letterSpacing,
    color: colors.ink0,
    textTransform: 'uppercase',
  };

  return (
    <View testID={testID} style={[containerStyle, style]}>
      <RNText style={textStyle}>{children}</RNText>
    </View>
  );
}
