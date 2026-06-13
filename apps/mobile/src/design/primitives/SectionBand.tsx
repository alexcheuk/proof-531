import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

type Padding = 'default' | 'tight' | 'none';
type Tone = 'default' | 'strong' | 'faint';

type SectionBandProps = {
  children: ReactNode;
  padding?: Padding;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const PADDING_MAP: Record<Padding, number> = {
  default: 20,
  tight: 14,
  none: 0,
};

/**
 * Horizontal LEDGER band  -  top + bottom hairlines around children.
 * Horizontal layout is intentionally NOT owned here; pass margins or
 * padding via `style`.
 */
export function SectionBand({
  children,
  padding = 'default',
  tone = 'default',
  style,
  testID,
}: SectionBandProps) {
  const { colors } = useTheme();

  const TOP_COLOR_MAP: Record<Tone, string> = {
    default: colors.lineStrong,
    strong: colors.lineStrong,
    faint: colors.line,
  };
  const BOTTOM_COLOR_MAP: Record<Tone, string> = {
    default: colors.line,
    strong: colors.lineStrong,
    faint: colors.line,
  };

  const resolved: ViewStyle = {
    paddingVertical: PADDING_MAP[padding],
    borderTopWidth: 1,
    borderTopColor: TOP_COLOR_MAP[tone],
    borderBottomWidth: 1,
    borderBottomColor: BOTTOM_COLOR_MAP[tone],
    backgroundColor: 'transparent',
  };

  return (
    <View testID={testID} style={[resolved, style]}>
      {children}
    </View>
  );
}
