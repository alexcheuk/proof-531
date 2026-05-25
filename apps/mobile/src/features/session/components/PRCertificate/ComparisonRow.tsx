import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { Text as RNText, View } from 'react-native';
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
  const { colors, type } = useTheme();

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
        <RNText
          style={{
            fontFamily: `${type.display}-Medium`,
            fontSize: 22,
            color: PAPER_45,
            letterSpacing: -0.44,
            lineHeight: 22,
            textDecorationLine: 'line-through',
            textDecorationColor: PAPER_45,
          }}
        >
          {`${formatWeight(prevE1RM)} `}
          <RNText
            style={{
              fontFamily: `${type.mono}-Medium`,
              fontSize: 10,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: PAPER_45,
              textDecorationLine: 'none',
            }}
          >
            {unit}
          </RNText>
        </RNText>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <PaperCapsText variant="label" style={{ marginBottom: 4 }}>
          Stronger by
        </PaperCapsText>
        <Row align="baseline" gap="xs">
          <RNText
            testID={testID}
            style={{
              fontFamily: `${type.display}-Bold`,
              fontSize: 32,
              lineHeight: 32,
              letterSpacing: -0.96,
              color: colors.bg0,
            }}
          >
            {`+${formatWeight(delta)}`}
          </RNText>
          <PaperCapsText variant="unit" tone="paper" style={{ fontSize: 11, letterSpacing: 2.2 }}>
            {unit}
          </PaperCapsText>
        </Row>
      </View>
    </Row>
  );
}
