import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Heading } from '@/design/primitives/Heading';
import { Row } from '@/design/primitives/Row';
import { SectionBand } from '@/design/primitives/SectionBand';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { BBB_REPS, BBB_SETS, bbbWeightFromTm } from '@/domain/bbb';
import { formatMmSs } from '@/domain/time';
import type { Unit } from '@/domain/types';
import { displayWeight } from '@/domain/units';
import { View } from 'react-native';

export type BbbBandProps = {
  tm: number;
  storageUnit: Unit;
  renderUnit: Unit;
  unitGlyph: 'lb' | 'kg';
  // Uses settings.bbbRestTargetSeconds (not restTargetSeconds) — BBB rest is shorter by design.
  bbbRestTargetSeconds?: number;
};

export function BbbBand({
  tm,
  storageUnit,
  renderUnit,
  unitGlyph,
  bbbRestTargetSeconds,
}: BbbBandProps) {
  const { layout, spacing } = useTheme();
  const bbbWeightStorage = bbbWeightFromTm(tm, storageUnit);
  const bbbWeight = displayWeight(bbbWeightStorage, storageUnit, renderUnit);

  return (
    <View style={{ paddingHorizontal: layout.gutter, paddingTop: spacing.xl }}>
      <Row justify="space-between" align="baseline" style={{ marginBottom: 6 }}>
        <CapsLabel>BORING BUT BIG</CapsLabel>
        {bbbRestTargetSeconds !== undefined ? (
          <CapsLabel size="xs" color="ink3" testID="today-bbb-rest-hint">
            {`REST ${formatMmSs(bbbRestTargetSeconds)} BETWEEN SETS`}
          </CapsLabel>
        ) : null}
      </Row>
      <SectionBand padding="tight" testID="today-bbb-band">
        <Row justify="space-between">
          <Text
            variant="sans"
            weight="medium"
            size={16}
            color="ink1"
            style={{ letterSpacing: -0.16 }}
          >
            {`${BBB_SETS} sets of ${BBB_REPS}`}
          </Text>
          <Row align="flex-end" gap="xs">
            <Heading size="m" lineHeight={26} numeric>
              {bbbWeight}
            </Heading>
            <CapsLabel>{`${unitGlyph} · 50%`}</CapsLabel>
          </Row>
        </Row>
      </SectionBand>
    </View>
  );
}
