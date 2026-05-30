import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Divider } from '@/design/primitives/Divider';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { View } from 'react-native';
import { LiveHeader } from './LiveHeader';

export type SetPhaseProps = {
  setIndex: 0 | 1 | 2;
  isAmrap: boolean;
  /**
   * True when the current set is the Week-4 TM Test set. Drives the live
   * eyebrow copy (`TM TEST · TARGET 3–5`) and the rep glyph (range
   * "3–5" instead of a single number with a trailing "+").
   */
  isTmTest?: boolean;
  liftLabel: string;
  elapsedSeconds: number;
  /** Top-set weight already converted into the display unit. */
  weight: number;
  reps: number;
  pct: number;
  unit: Unit;
  perSide: ReadonlyArray<number>;
  /**
   * Optional caps caption — e.g. "+10 lb per side vs set 1". Shown below
   * the PlateBar when the user is on set 2 or 3. Omit on set 1 (no prior
   * set to compare).
   */
  plateChangeHint?: string;
};

export function SetPhase({
  setIndex,
  isAmrap,
  isTmTest = false,
  liftLabel,
  elapsedSeconds,
  weight,
  reps,
  pct,
  unit,
  perSide,
  plateChangeHint,
}: SetPhaseProps) {
  const { spacing, layout } = useTheme();

  const eyebrow = isTmTest ? 'On the bar · 100% TM' : `On the bar · ${Math.round(pct * 100)}% TM`;

  return (
    <>
      <LiveHeader
        setIndex={setIndex}
        isAmrap={isAmrap}
        isTmTest={isTmTest}
        testID="live-header"
        lift={liftLabel}
        elapsedSeconds={elapsedSeconds}
      />

      <Divider />

      <View style={{ paddingHorizontal: layout.gutter, paddingVertical: spacing.lg }}>
        <TopSetBlock
          eyebrow={eyebrow}
          weight={weight}
          unitGlyph={displayUnitGlyph(unit)}
          reps={reps}
          amrap={isAmrap && !isTmTest}
          {...(isTmTest ? { repsRange: [3, 5] as const } : {})}
          perSide={perSide}
          plateVariant="full"
          bordered={false}
          testID="live-bigweight"
        />
        {plateChangeHint ? (
          <CapsLabel
            size="xs"
            color="ink3"
            style={{ marginTop: spacing.md }}
            testID="live-plate-change-hint"
          >
            {plateChangeHint}
          </CapsLabel>
        ) : null}
      </View>

      <Divider />
    </>
  );
}
