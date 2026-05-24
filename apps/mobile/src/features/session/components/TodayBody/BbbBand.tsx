import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Heading } from '@/design/primitives/Heading';
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
  /** Optional rest-target hint shown next to the eyebrow ("REST 1:30 BETWEEN SETS"). */
  restTargetSeconds?: number;
};

function formatRestHint(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * "BORING BUT BIG" 5×10 @ 50% TM summary band — read-only, numeric only.
 *
 * When `restTargetSeconds` is supplied, the eyebrow row also shows a small
 * `REST 1:30 BETWEEN SETS` chip on the right so the user sees their
 * configured pace before starting (and remembers what Settings is set to).
 */
export function BbbBand({
  tm,
  storageUnit,
  renderUnit,
  unitGlyph,
  restTargetSeconds,
}: BbbBandProps) {
  const { colors, layout, type } = useTheme();
  const bbbWeightStorage = round(tm * 0.5, storageUnit);
  const bbbWeight = displayWeight(bbbWeightStorage, storageUnit, renderUnit);

  const countStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 16,
    letterSpacing: -0.16,
    color: colors.ink1,
  };

  return (
    <View style={{ paddingHorizontal: layout.gutter, paddingTop: 24 }}>
      <Row justify="space-between" align="baseline" style={{ marginBottom: 6 }}>
        <CapsLabel>BORING BUT BIG</CapsLabel>
        {restTargetSeconds !== undefined ? (
          <CapsLabel size="xs" color="ink3" testID="today-bbb-rest-hint">
            {`REST ${formatRestHint(restTargetSeconds)} BETWEEN SETS`}
          </CapsLabel>
        ) : null}
      </Row>
      <SectionBand padding="tight" testID="today-bbb-band">
        <Row justify="space-between">
          <RNText style={countStyle}>5 sets of 10</RNText>
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
