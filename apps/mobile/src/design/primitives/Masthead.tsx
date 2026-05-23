import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

type MastheadProps = {
  rightSlot?: ReactNode;
  underline?: 'hairline' | 'none';
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Minimal masthead — wordmark `531. ledger` on the left, caller-supplied
 * right slot (date label / cycle marker / "settings" caps) on the right.
 *
 * Ported from the PWA `masthead.tsx`. Purely presentational; no collapse,
 * no display title, no context. The title block (eyebrow + h1) lives in
 * the screen body below the masthead.
 *
 * `underline="hairline"` adds a 1px bottom rule (used on Today). Home and
 * Settings keep the masthead un-ruled — the underline appears below the
 * title block instead.
 *
 * Note: React Native does not support `alignItems: 'baseline'`, so the
 * wordmark cluster uses `'center'` instead.
 */
export function Masthead({ rightSlot, underline = 'none', testID, style }: MastheadProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    ...(underline === 'hairline' ? { borderBottomWidth: 1, borderBottomColor: colors.line } : null),
  };

  return (
    <View testID={testID} style={[containerStyle, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <RNText
          style={{
            fontFamily: `${type.mono}-Bold`,
            fontSize: 14,
            lineHeight: 14,
            letterSpacing: 1.96,
            textTransform: 'uppercase',
            color: colors.ink0,
          }}
        >
          531
        </RNText>
        <RNText
          style={{
            fontFamily: `${type.mono}-Bold`,
            fontSize: 14,
            letterSpacing: 0,
            color: colors.ink3,
          }}
        >
          .
        </RNText>
        <RNText
          style={{
            fontFamily: `${type.mono}-Medium`,
            fontSize: 10,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            color: colors.ink3,
            marginLeft: 10,
          }}
        >
          ledger
        </RNText>
      </View>
      {rightSlot ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>{rightSlot}</View>
      ) : null}
    </View>
  );
}
