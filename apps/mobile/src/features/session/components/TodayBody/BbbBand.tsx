import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { SectionBand } from '@/design/primitives/SectionBand';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayWeight, round } from '@/domain/units';
import { Text as RNText, type TextStyle, View } from 'react-native';

export type BbbBandProps = {
  tm: number;
  storageUnit: Unit;
  renderUnit: Unit;
  unitGlyph: 'lb' | 'kg';
};

/**
 * "BORING BUT BIG" 5×10 @ 50% TM summary band — read-only, numeric only.
 */
export function BbbBand({ tm, storageUnit, renderUnit, unitGlyph }: BbbBandProps) {
  const { colors, type } = useTheme();
  const bbbWeightStorage = round(tm * 0.5, storageUnit);
  const bbbWeight = displayWeight(bbbWeightStorage, storageUnit, renderUnit);

  const countStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 16,
    letterSpacing: -0.16,
    color: colors.ink1,
  };
  const weightStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 26,
    lineHeight: 26,
    letterSpacing: -0.78,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 6 }}>
        <CapsLabel>BORING BUT BIG</CapsLabel>
      </Row>
      <SectionBand padding="tight" testID="today-bbb-band">
        <Row justify="space-between">
          <RNText style={countStyle}>5 sets of 10</RNText>
          <Row align="flex-end" gap="xs">
            <RNText style={weightStyle}>{bbbWeight}</RNText>
            <CapsLabel>{`${unitGlyph} · 50%`}</CapsLabel>
          </Row>
        </Row>
      </SectionBand>
    </View>
  );
}
