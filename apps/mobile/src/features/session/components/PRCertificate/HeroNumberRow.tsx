import { Heading } from '@/design/primitives/Heading';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { Text as RNText, View } from 'react-native';
import { PAPER_28, PAPER_55 } from './paperTints';

export type HeroNumberRowProps = {
  e1RM: number;
  unit: 'lb' | 'kg';
  testID?: string;
};

/** The big new-1RM number + unit + caption. */
export function HeroNumberRow({ e1RM, unit, testID }: HeroNumberRowProps) {
  const { colors, type } = useTheme();
  return (
    <Row
      align="baseline"
      gap="md"
      style={{ paddingTop: 14, borderTopWidth: 1, borderTopColor: PAPER_28 }}
    >
      <Heading size="huge" color="bg0" numeric {...(testID !== undefined ? { testID } : {})}>
        {formatWeight(e1RM)}
      </Heading>
      <View style={{ gap: 4 }}>
        <RNText
          style={{
            fontFamily: `${type.mono}-Bold`,
            fontSize: 13,
            letterSpacing: 2.6,
            textTransform: 'uppercase',
            color: colors.bg0,
          }}
        >
          {unit}
        </RNText>
        <RNText
          style={{
            fontFamily: `${type.mono}-Medium`,
            fontSize: 9,
            letterSpacing: 1.62,
            textTransform: 'uppercase',
            color: PAPER_55,
          }}
        >
          est. 1rm
        </RNText>
      </View>
    </Row>
  );
}
