import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
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
 * Read-only — warmups are prescribed by `WARMUPS` from `domain/schemes`
 * and are the same on every session. The band lets a lifter see the
 * ramp + know what plates to start with without doing the percent math
 * in their head between sets.
 *
 * Warmups are NOT tracked in `set_logs` (kind: 'warmup' is reserved in
 * the schema but not yet written by any code path) — the band is a
 * cheat sheet, not a checkbox. If users start asking to check them off,
 * we revisit.
 *
 * Collapsed by default (Discord 1508998906): the band's three rows
 * sit between the masthead and the working-set ladder, which pushes
 * the actual work below the fold for taller phones. Tap the header
 * to expand; expansion state is per-mount (the user re-collapses by
 * leaving the screen) so the default stays "out of the way".
 */
export function WarmupsBand({ tm, storageUnit, renderUnit, unitGlyph }: WarmupsBandProps) {
  const { colors, layout, spacing } = useTheme();
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
        hitSlop={{ top: 6, bottom: 6, left: 0, right: 0 }}
      >
        <Row justify="space-between" align="center" style={{ marginBottom: 6 }}>
          <Row align="center" style={{ gap: 8 }}>
            <CapsLabel>WARMUPS</CapsLabel>
            <CapsLabel size="xs" testID="warmups-chevron" style={{ color: colors.ink1 }}>
              {expanded ? '▾' : '▸'}
            </CapsLabel>
          </Row>
          <CapsLabel size="xs" color="ink3">
            40 · 50 · 60% TM
          </CapsLabel>
        </Row>
      </Pressable>
      {expanded ? (
        <>
          <View>
            {WARMUPS.map((s, i) => {
              const wStorage = round(tm * s.pct, storageUnit);
              const w = displayWeight(wStorage, storageUnit, renderUnit);
              // (pct, reps) is stable per warmup index — fine as a key.
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
          {/* Single-line note about the unit so the user doesn't have to
              guess what the SetRow weights are denominated in (matches
              WorkingSetsBand's "TM N lb" eyebrow on the right). */}
          <CapsLabel size="xs" color="ink3" style={{ marginTop: 4 }}>
            {`Same bar · ${unitGlyph}`}
          </CapsLabel>
        </>
      ) : null}
    </View>
  );
}
