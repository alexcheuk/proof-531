import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

export type LadderRowProps = {
  index: number; // 1-based; rendered as "1", "2", "3" (mono)
  weight: number; // display-unit, plate-snapped (band computes it)
  unitGlyph: 'lb' | 'kg';
  reps: number;
  repsRange?: readonly [number, number]; // week-4 TM test → "3–5"
  amrap: boolean; // inline "+" only when true and no range
  pct: number; // → "65%"
  emphasised: boolean; // top set / TM-test row → ink0; else ink3
  isFirst: boolean; // lineStrong top hairline
  isLast: boolean; // lineStrong bottom hairline
  testID?: string; // e.g. `home-ladder-row-0`
};

/**
 * Compact, read-only working-set row for the Home ladder. Mono numerals,
 * hairline rows, no plate viz / badges / done-dimming. Quieter and denser
 * than `SetRow` (the interactive Today row). Emphasised rows (the AMRAP top
 * set, or the week-4 TM test) ink in `ink0`; the rest are muted.
 */
export function LadderRow({
  index,
  weight,
  unitGlyph,
  reps,
  repsRange,
  amrap,
  pct,
  emphasised,
  isFirst,
  isLast,
  testID,
}: LadderRowProps) {
  const { colors, spacing } = useTheme();

  const containerStyle: ViewStyle = {
    // 12pt — tighter than SetRow's 14 so the ladder reads denser/quieter.
    paddingVertical: spacing.sm + spacing.xs,
    borderTopWidth: 1,
    borderTopColor: isFirst ? colors.lineStrong : colors.line,
    ...(isLast ? { borderBottomWidth: 1, borderBottomColor: colors.lineStrong } : null),
  };

  const repsText = `× ${repsRange ? `${repsRange[0]}–${repsRange[1]}` : reps}${
    amrap && !repsRange ? '+' : ''
  }`;

  // Compose a single accessible label so the row reads as one chunk and is
  // NOT announced as a control (it is informational, not tappable).
  let setLabel = `Set ${index}`;
  if (repsRange) setLabel = 'TM test';
  else if (emphasised) setLabel = 'Top set';
  const repsSpoken = repsRange
    ? `${repsRange[0]} to ${repsRange[1]} reps`
    : `${reps} reps${amrap ? ', AMRAP' : ''}`;
  const a11yLabel = [
    setLabel,
    `${weight} ${unitGlyph} × ${repsSpoken}`,
    `${Math.round(pct * 100)} percent of training max`,
  ].join('. ');

  return (
    <View accessible accessibilityLabel={a11yLabel}>
      <Row {...(testID !== undefined ? { testID } : {})} style={containerStyle} gap="md">
        <Text
          variant="mono"
          weight="semibold"
          size={11}
          color={emphasised ? 'ink0' : 'ink3'}
          style={{ width: 20, letterSpacing: 0.44 }}
        >
          {String(index)}
        </Text>
        <Row style={{ flex: 1 }} gap="sm">
          <Row align="baseline" gap="xs">
            <Text
              variant="mono"
              numeric
              weight={emphasised ? 'bold' : 'medium'}
              size={15}
              color={emphasised ? 'ink0' : 'ink2'}
            >
              {weight}
            </Text>
            <CapsLabel size="xs">{unitGlyph}</CapsLabel>
          </Row>
          <Text
            variant="mono"
            numeric
            weight="medium"
            size={13}
            color={emphasised ? 'ink1' : 'ink3'}
          >
            {repsText}
          </Text>
        </Row>
        <Text
          variant="mono"
          weight="medium"
          size={11}
          color={emphasised ? 'ink2' : 'ink3'}
          style={{ letterSpacing: 0.22 }}
        >
          {`${Math.round(pct * 100)}%`}
        </Text>
      </Row>
    </View>
  );
}
