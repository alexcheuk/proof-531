import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { WARMUPS } from '@/domain/schemes';
import type { Unit } from '@/domain/types';
import { displayWeight, round } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SetRow } from '../SetRow';

export type WarmupsBandProps = {
  tm: number;
  storageUnit: Unit;
  renderUnit: Unit;
  unitGlyph: 'lb' | 'kg';
};

/**
 * "WARMUPS · 40/50/60% × 5/5/3" preview band above the working sets.
 *
 * Collapsed by default (Discord 1508998906). Tap the header to expand.
 * When collapsed, the right side reads "TAP TO OPEN" (Discord 1509060717).
 */
export function WarmupsBand({ tm, storageUnit, renderUnit, unitGlyph }: WarmupsBandProps) {
  const { layout, spacing } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    void Haptics.selectionAsync();
    setExpanded((prev) => !prev);
  };

  return (
    <View style={{ paddingHorizontal: layout.gutter, paddingTop: spacing.lg + 4 }}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse warmup sets' : 'Expand warmup sets'}
        accessibilityState={{ expanded }}
        testID="warmups-toggle"
        hitSlop={{ top: 8, bottom: 8, left: 0, right: 0 }}
      >
        <Row justify="space-between" align="center" style={{ marginBottom: 6 }}>
          <Row align="center" style={{ gap: 10 }}>
            <CapsLabel>WARMUPS</CapsLabel>
            {/* Larger chevron so the affordance is visually obvious */}
            <Text testID="warmups-chevron" variant="mono" weight="regular" size={14} color="ink1">
              {expanded ? '▾' : '▸'}
            </Text>
          </Row>
          <CapsLabel size="xs" color="ink3">
            {expanded ? '40 · 50 · 60% TM' : 'TAP TO OPEN'}
          </CapsLabel>
        </Row>
      </Pressable>
      {expanded ? (
        <>
          <View>
            {WARMUPS.map((s, i) => {
              const wStorage = round(tm * s.pct, storageUnit);
              const w = displayWeight(wStorage, storageUnit, renderUnit);
              const key = `warmup-${s.pct}-${s.reps}`;
              return (
                <SetRow
                  key={key}
                  index={(i + 1) as 1 | 2 | 3}
                  isLast={i === WARMUPS.length - 1}
                  weight={w}
                  unit={renderUnit}
                  reps={s.reps}
                  amrap={false}
                  pct={s.pct}
                  testID={`warmup-row-${i}`}
                />
              );
            })}
          </View>
          <CapsLabel size="xs" color="ink3" style={{ marginTop: 4 }}>
            {`Same bar · ${unitGlyph}`}
          </CapsLabel>
        </>
      ) : null}
    </View>
  );
}
