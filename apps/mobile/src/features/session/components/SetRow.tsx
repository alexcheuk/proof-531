import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * One working-set row on Today.
 *
 * Built on `LedgerRow`-shaped chrome: hairline top border (strong on the first
 * row of the section), label cluster on the left, weight × reps cluster on
 * the right. Behaves like the PWA `~/Development/531-pwa/src/features/session/
 * components/SetRow.tsx`, but uses the mobile design primitives.
 *
 * Today's working-set rows are NEVER interactive (Rev 3, 2026-05-22). Entry
 * into Live happens exclusively via the bottom `Start/Resume working set N`
 * CTA. The row visually marks state with `done` and `next` props.
 */
import { Text as RNText, type TextStyle, type ViewStyle } from 'react-native';

export type SetRowProps = {
  index: 1 | 2 | 3;
  isLast: boolean;
  weight: number;
  unit: Unit;
  reps: number;
  amrap: boolean;
  pct: number;
  done?: boolean;
  next?: boolean;
  testID?: string;
};

export function SetRow({
  index,
  isLast,
  weight,
  unit,
  reps,
  amrap,
  pct,
  done = false,
  next = false,
  testID,
}: SetRowProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: index === 1 ? colors.lineStrong : colors.line,
    ...(isLast ? { borderBottomWidth: 1, borderBottomColor: colors.lineStrong } : null),
    opacity: done ? 0.45 : 1,
  };

  const indexStyle: TextStyle = {
    width: 20,
    fontFamily: `${type.mono}-Bold`,
    fontSize: 11,
    letterSpacing: 0.44,
    color: next ? colors.ink0 : colors.ink3,
  };

  const weightStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 26,
    lineHeight: 26,
    letterSpacing: -0.78,
    color: colors.ink0,
    ...(done ? { textDecorationLine: 'line-through' as const } : null),
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const capsStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink2,
  };

  const repsStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 18,
    letterSpacing: -0.36,
    color: colors.ink1,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const pctStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 11,
    letterSpacing: 0.22,
    color: colors.ink2,
  };

  return (
    <Row {...(testID !== undefined ? { testID } : {})} style={containerStyle} gap="md">
      <RNText style={indexStyle}>{done ? '✓' : String(index).padStart(2, '0')}</RNText>
      <Row style={{ flex: 1 }} gap="sm" wrap>
        <Row align="baseline" gap="xs">
          <RNText style={weightStyle}>{weight}</RNText>
          <RNText style={capsStyle}>{displayUnit(unit)}</RNText>
        </Row>

        <RNText style={repsStyle}>
          × {reps}
          {amrap ? '+' : ''}
        </RNText>
        {amrap ? <MonoBadge>AMRAP</MonoBadge> : null}
      </Row>

      <Row gap="sm">
        {next ? <MonoBadge>UP NEXT</MonoBadge> : null}
        <RNText style={pctStyle}>{Math.round(pct * 100)}%</RNText>
      </Row>
    </Row>
  );
}
