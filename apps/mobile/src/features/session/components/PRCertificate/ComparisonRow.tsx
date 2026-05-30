import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { formatWeight } from '@/domain/units';
import { View } from 'react-native';
import { PaperCapsText } from './PaperCapsText';
import { PAPER_28, PAPER_45 } from './paperTints';

export type ComparisonRowProps = {
  prevE1RM: number;
  delta: number;
  unit: 'lb' | 'kg';
  testID?: string;
};

/** "Previous best" struck-through + "Stronger by +N" delta column. */
export function ComparisonRow({ prevE1RM, delta, unit, testID }: ComparisonRowProps) {
  return (
    <Row
      justify="space-between"
      align="flex-end"
      gap="md"
      style={{
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: PAPER_28,
      }}
    >
      <View>
        <PaperCapsText variant="label" style={{ marginBottom: 4 }}>
          Previous best
        </PaperCapsText>
        <Text
          variant="sans"
          weight="medium"
          size={22}
          color="paperTint45"
          style={{
            letterSpacing: -0.44,
            lineHeight: 22,
            textDecorationLine: 'line-through',
            textDecorationColor: PAPER_45,
          }}
        >
          {`${formatWeight(prevE1RM)} `}
          <Text
            variant="mono"
            weight="medium"
            size={10}
            color="paperTint45"
            style={{
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              textDecorationLine: 'none',
            }}
          >
            {unit}
          </Text>
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <PaperCapsText variant="label" style={{ marginBottom: 4 }}>
          Stronger by
        </PaperCapsText>
        <Row align="baseline" gap="xs">
          <Text
            variant="sans"
            weight="bold"
            size={32}
            color="bg0"
            numeric
            style={{
              // rn-line-height-ok: numeric delta value only
              lineHeight: 32,
              letterSpacing: -0.96,
            }}
            {...(testID !== undefined ? { testID } : {})}
          >
            {`+${formatWeight(delta)}`}
          </Text>
          <PaperCapsText variant="unit" tone="paper" style={{ fontSize: 11, letterSpacing: 2.2 }}>
            {unit}
          </PaperCapsText>
        </Row>
      </View>
    </Row>
  );
}
