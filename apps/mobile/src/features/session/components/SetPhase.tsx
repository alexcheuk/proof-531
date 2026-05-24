import { Divider } from '@/design/primitives/Divider';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { View } from 'react-native';
import { LiveHeader } from './LiveHeader';

/**
 * The "live, mid-set" surface on the Live screen — the LiveHeader (caps
 * eyebrow + lift headline + AMRAP chip + elapsed clock) over a TopSetBlock
 * showing the bar, weight, plate decomposition, and rep prescription.
 *
 * Pure presentational composition; parent owns all data + CTA wiring.
 */
export type SetPhaseProps = {
  setIndex: 0 | 1 | 2;
  isAmrap: boolean;
  liftLabel: string;
  elapsedSeconds: number;
  /** Top-set weight already converted into the display unit. */
  weight: number;
  reps: number;
  pct: number;
  unit: Unit;
  perSide: ReadonlyArray<number>;
};

export function SetPhase({
  setIndex,
  isAmrap,
  liftLabel,
  elapsedSeconds,
  weight,
  reps,
  pct,
  unit,
  perSide,
}: SetPhaseProps) {
  const { spacing } = useTheme();

  return (
    <>
      <LiveHeader
        setIndex={setIndex}
        isAmrap={isAmrap}
        testID="live-header"
        lift={liftLabel}
        elapsedSeconds={elapsedSeconds}
      />

      <Divider />

      <View style={{ paddingHorizontal: 24, paddingVertical: spacing.lg }}>
        <TopSetBlock
          eyebrow={`On the bar · ${Math.round(pct * 100)}% TM`}
          weight={weight}
          unitGlyph={displayUnitGlyph(unit)}
          reps={reps}
          amrap={isAmrap}
          perSide={perSide}
          plateVariant="full"
          bordered={false}
          testID="live-bigweight"
        />
      </View>

      <Divider />
    </>
  );
}
