import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle, type ViewStyle } from 'react-native';

/**
 * The "531 . ledger" wordmark + Filed chip header that crowns the session
 * receipt. Visually distinct from the app-wide `Masthead` (which uses the
 * mark-and-rightSlot pattern) — the receipt masthead is purpose-built and
 * needs slightly tighter spacing.
 */
export function SessionCompleteMasthead() {
  const { colors, layout, type } = useTheme();

  const wrap: ViewStyle = {
    paddingTop: 54,
    paddingHorizontal: layout.gutter,
    paddingBottom: 14,
  };

  const wordmark531: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 13,
    lineHeight: 13,
    letterSpacing: 1.82,
    textTransform: 'uppercase',
    color: colors.ink0,
  };
  const wordmarkDot: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 13,
    color: colors.ink3,
  };
  const wordmarkLedger: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginLeft: 10,
  };

  return (
    <Row justify="space-between" style={wrap} testID="session-complete-masthead">
      <Row>
        <RNText style={wordmark531}>531</RNText>
        <RNText style={wordmarkDot}>.</RNText>
        <RNText style={wordmarkLedger}>ledger</RNText>
      </Row>
      <MonoBadge size="md">Filed</MonoBadge>
    </Row>
  );
}
