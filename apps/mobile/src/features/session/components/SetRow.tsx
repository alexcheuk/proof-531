import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Heading } from '@/design/primitives/Heading';
import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
// Never interactive — entry into Live happens only via the bottom "Start/Resume working set N" CTA.
import { View, type ViewStyle } from 'react-native';

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
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: index === 1 ? colors.lineStrong : colors.line,
    ...(isLast ? { borderBottomWidth: 1, borderBottomColor: colors.lineStrong } : null),
    opacity: done ? 0.45 : 1,
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
        <Text
          variant="mono"
          weight="bold"
          size={11}
          color={next ? 'ink0' : 'ink3'}
          style={{ width: 20, letterSpacing: 0.44 }}
        >
          {done ? '✓' : String(index).padStart(2, '0')}
        </Text>
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
            <CapsLabel size="xs">{displayUnit(unit)}</CapsLabel>
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
          <Text
            variant="mono"
            weight="medium"
            size={11}
            color="ink2"
            style={{ letterSpacing: 0.22 }}
          >
            {Math.round(pct * 100)}%
          </Text>
        </Row>
      </Row>
    </View>
  );
}
