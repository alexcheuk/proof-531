/**
 * Section frame for the LEDGER register layout. Behavioral port of the PWA
 * `LedgerSection` (src/components/ui/ledger-section.tsx).
 *
 * Caps title on the left, optional caps hint on the right, hairline-bordered
 * rows below. Surface is transparent (inherits the paper canvas). The section
 * provides its own `pt-6 px-6` so consecutive sections read as one continuous
 * register.
 *
 * Note: the PWA uses `items-baseline` for the header row. React Native does
 * not support `'baseline'` for `alignItems`; we use `'center'` instead.
 */

import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export type LedgerSectionProps = {
  title: string;
  hint?: string;
  children: ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function LedgerSection({ title, hint, children, testID, style }: LedgerSectionProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    paddingTop: 24,
    paddingHorizontal: 24,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  };

  const titleStyle: TextStyle = {
    fontFamily: type.mono,
    fontWeight: '500',
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };

  const hintStyle: TextStyle = {
    fontFamily: type.mono,
    fontWeight: '500',
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink3,
  };

  return (
    <View testID={testID} style={[containerStyle, style]}>
      <View style={headerStyle}>
        <RNText style={titleStyle}>{title}</RNText>
        {hint ? <RNText style={hintStyle}>{hint}</RNText> : null}
      </View>
      {children}
    </View>
  );
}
