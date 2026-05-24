import { MonoBadge } from '@/design/primitives/MonoBadge';
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
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

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
  /**
   * Optional left-most label override. When provided, replaces the default
   * zero-padded index glyph (`01` / `02` / `03`) with this string —
   * typically `"W1"` / `"W2"` / `"W3"` for warmup-ramp rows.
   *
   * Used by Today's warmup ramp block (W1.2) so the same primitive can
   * render both the canonical working sets and the warmup ramp.
   */
  prefix?: string;
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
  prefix,
  testID,
}: SetRowProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
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

  const middleStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
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

  const rightStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  };

  const pctStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 11,
    letterSpacing: 0.22,
    color: colors.ink2,
  };

  return (
    <View testID={testID} style={containerStyle}>
      <RNText style={indexStyle}>{done ? '✓' : (prefix ?? String(index).padStart(2, '0'))}</RNText>
      <View style={middleStyle}>
        <RNText style={weightStyle}>{weight}</RNText>
        <RNText style={capsStyle}>{displayUnit(unit)}</RNText>
        <RNText style={repsStyle}>
          × {reps}
          {amrap ? '+' : ''}
        </RNText>
        {amrap ? <MonoBadge>AMRAP</MonoBadge> : null}
      </View>
      <View style={rightStyle}>
        {next ? <MonoBadge>UP NEXT</MonoBadge> : null}
        <RNText style={pctStyle}>{Math.round(pct * 100)}%</RNText>
      </View>
    </View>
  );
}
