import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Heading } from '@/design/primitives/Heading';
import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * One working-set row on Today.
 *
 * Built on `LedgerRow`-shaped chrome: hairline top border (strong on the first
 * row of the section), label cluster on the left, weight × reps cluster on
 * the right.
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

  const pctStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 11,
    letterSpacing: 0.22,
    color: colors.ink2,
  };

  // Compose an accessibility label so a screen reader announces the
  // whole row as one chunk instead of scrubbing through "01", "120",
  // "lb", "× 5" individually. Index + state, then weight + reps, then
  // any flags. Plain words; the existing test IDs stay for behavioural
  // assertions.
  const stateLabel = done ? 'done' : next ? 'up next' : '';
  const repsLabel = `${reps} reps${amrap ? ', AMRAP' : ''}`;
  const pctLabel = `${Math.round(pct * 100)} percent of training max`;
  const a11yLabel = [
    `Set ${index}${stateLabel ? `, ${stateLabel}` : ''}`,
    `${weight} ${displayUnit(unit)} × ${repsLabel}`,
    pctLabel,
  ].join('. ');

  // Wrap the Row in a View just so we can attach `accessible` +
  // `accessibilityLabel` — Row's API stays minimal (intentional). The
  // Row keeps the layout + testID (existing tests query
  // `getByTestId(...).props.style` for borderBottomWidth assertions);
  // the View is purely the a11y handle.
  return (
    <View accessible accessibilityLabel={a11yLabel}>
      <Row {...(testID !== undefined ? { testID } : {})} style={containerStyle} gap="md">
        <RNText style={indexStyle}>{done ? '✓' : String(index).padStart(2, '0')}</RNText>
        <Row style={{ flex: 1 }} gap="sm" wrap>
          <Row align="baseline" gap="xs">
            <Heading
              size="m"
              lineHeight={26}
              numeric
              style={done ? { textDecorationLine: 'line-through' } : undefined}
            >
              {weight}
            </Heading>
            <CapsLabel size="xs" style={{ letterSpacing: 1.62 }}>
              {displayUnit(unit)}
            </CapsLabel>
          </Row>

          <Text
            variant="sans"
            weight="medium"
            size={18}
            color="ink1"
            numeric
            style={{ letterSpacing: -0.36 }}
          >
            × {reps}
            {amrap ? '+' : ''}
          </Text>
          {amrap ? <MonoBadge>AMRAP</MonoBadge> : null}
        </Row>

        <Row gap="sm">
          {next ? <MonoBadge>UP NEXT</MonoBadge> : null}
          <RNText style={pctStyle}>{Math.round(pct * 100)}%</RNText>
        </Row>
      </Row>
    </View>
  );
}
