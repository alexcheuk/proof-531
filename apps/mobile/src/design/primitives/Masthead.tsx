import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { CapsLabel } from './CapsLabel';
import { Text } from './Text';

type MastheadProps = {
  rightSlot?: ReactNode;
  underline?: 'hairline' | 'none';
  /**
   * When true, paint a subtle drop shadow under the masthead  -  used by
   * screens that pair with a scrollable body to signal "there is content
   * above the visible area". Pair with `useScrolledPast()` to flip on/off
   * based on the body's scroll position.
   */
  elevated?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Minimal masthead  -  wordmark `531. ledger` on the left, caller-supplied
 * right slot (date label / cycle marker / "settings" caps) on the right.
 *
 * Ported from the PWA `masthead.tsx`. Purely presentational; no collapse,
 * no display title, no context. The title block (eyebrow + h1) lives in
 * the screen body below the masthead.
 *
 * `underline="hairline"` adds a 1px bottom rule (used on Today). Home and
 * Settings keep the masthead un-ruled  -  the underline appears below the
 * title block instead.
 *
 * Note: React Native does not support `alignItems: 'baseline'`, so the
 * wordmark cluster uses `'center'` instead.
 */
export function Masthead({
  rightSlot,
  underline = 'none',
  elevated = false,
  testID,
  style,
}: MastheadProps) {
  const { colors, layout } = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: layout.gutter,
    paddingTop: 12,
    // Background is opaque so the elevated shadow has something to cast
    // from. Non-elevated rendering looks identical to the previous
    // transparent treatment  -  every consumer's parent paints bg0.
    backgroundColor: colors.bg0,
    ...(underline === 'hairline' ? { borderBottomWidth: 1, borderBottomColor: colors.line } : null),
    // zIndex keeps the (elevated) masthead above the scrollable body
    // so the shadow doesn't get clipped by sibling content.
    zIndex: 1,
    ...(elevated
      ? {
          // Subtle drop shadow under the masthead while content scrolls
          // beneath it. The numbers are deliberately small  -  anything
          // heavier reads as a Material elevation, which is wrong for an
          // e-ink-paper aesthetic. Shadow extends outside the box so the
          // box geometry stays identical between elevated/non-elevated.
          shadowColor: colors.ink0,
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }
      : null),
  };

  return (
    <View testID={testID} style={[containerStyle, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          variant="mono"
          weight="bold"
          size={14}
          color="ink0"
          style={{ lineHeight: 14, letterSpacing: 1.96, textTransform: 'uppercase' }}
        >
          531
        </Text>
        <Text variant="mono" weight="bold" size={14} color="ink3" style={{ letterSpacing: 0 }}>
          .
        </Text>
        <CapsLabel color="ink3" style={{ marginLeft: 10 }}>
          ledger
        </CapsLabel>
      </View>
      {rightSlot ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>{rightSlot}</View>
      ) : null}
    </View>
  );
}
