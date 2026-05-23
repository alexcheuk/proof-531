/**
 * One record line within a LedgerSection. Behavioral port of the PWA
 * `LedgerRow` + helpers (src/components/ui/ledger-row.tsx).
 *
 * - Hairline top border: strong on first row of a section, faint otherwise.
 * - Renders as a Pressable when `onPress` is provided AND not `disabled`,
 *   otherwise renders as a non-interactive View. This mirrors the PWA's
 *   <button>-vs-<div> branching so non-pressable rows do not advertise a
 *   tap target to a11y tooling.
 */

import type { ReactNode } from 'react';
import {
  Pressable,
  Text as RNText,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

export type LedgerRowProps = {
  first?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function LedgerRow({
  first = false,
  disabled = false,
  onPress,
  children,
  testID,
  style,
}: LedgerRowProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    paddingVertical: 14,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: first ? colors.lineStrong : colors.line,
  };

  if (onPress && !disabled) {
    return (
      <Pressable testID={testID} onPress={onPress} style={[containerStyle, style]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      accessibilityState={disabled ? { disabled: true } : undefined}
      style={[containerStyle, style]}
    >
      {children}
    </View>
  );
}

export type LedgerRowLabelProps = {
  primary: string;
  secondary?: string;
};

export function LedgerRowLabel({ primary, secondary }: LedgerRowLabelProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    minWidth: 0,
  };

  const primaryStyle: TextStyle = {
    fontFamily: type.sans,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: -0.225,
    color: colors.ink0,
  };

  const secondaryStyle: TextStyle = {
    fontFamily: type.mono,
    fontWeight: '500',
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginTop: 3,
  };

  return (
    <View style={containerStyle}>
      <RNText style={primaryStyle}>{primary}</RNText>
      {secondary ? <RNText style={secondaryStyle}>{secondary}</RNText> : null}
    </View>
  );
}

export type LedgerRowValueProps = {
  value: string;
  sub?: string;
  numeric?: boolean;
  tone?: 'default' | 'muted';
};

export function LedgerRowValue({
  value,
  sub,
  numeric = false,
  tone = 'default',
}: LedgerRowValueProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    alignItems: 'flex-end',
  };

  const valueStyle: TextStyle = {
    fontFamily: type.sans,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.32,
    color: tone === 'muted' ? colors.ink3 : colors.ink0,
    ...(numeric ? { fontVariant: ['tabular-nums', 'lining-nums'] } : null),
  };

  const subStyle: TextStyle = {
    fontFamily: type.mono,
    fontWeight: '500',
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginTop: 2,
  };

  return (
    <View style={containerStyle}>
      <RNText style={valueStyle}>{value}</RNText>
      {sub ? <RNText style={subStyle}>{sub}</RNText> : null}
    </View>
  );
}
