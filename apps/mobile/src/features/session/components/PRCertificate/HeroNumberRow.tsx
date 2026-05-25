import { Heading } from '@/design/primitives/Heading';
import { Row } from '@/design/primitives/Row';
import { formatWeight } from '@/domain/units';
import { View } from 'react-native';
import { PaperCapsText } from './PaperCapsText';
import { PAPER_28 } from './paperTints';

export type HeroNumberRowProps = {
  e1RM: number;
  unit: 'lb' | 'kg';
  testID?: string;
};

/** The big new-1RM number + unit + caption. */
export function HeroNumberRow({ e1RM, unit, testID }: HeroNumberRowProps) {
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
        <PaperCapsText variant="unit">{unit}</PaperCapsText>
        <PaperCapsText variant="caption">est. 1rm</PaperCapsText>
      </View>
    </Row>
  );
}
