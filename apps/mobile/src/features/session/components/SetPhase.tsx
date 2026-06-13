import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Divider } from '@/design/primitives/Divider';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { pctToDisplay } from '@/lib/pct';
import { View } from 'react-native';
import { LiveHeader } from './LiveHeader';

export type SetPhaseProps = {
  setIndex: 0 | 1 | 2;
  isAmrap: boolean;
  // drives "TM TEST · TARGET 3–5" eyebrow and the "3–5" rep range glyph
  isTmTest?: boolean;
  liftLabel: string;
  elapsedSeconds: number;
  weight: number;
  reps: number;
  pct: number;
  unit: Unit;
  perSide: ReadonlyArray<number>;
  // "+N lb per side vs set 1" caption below PlateBar; omit on set 1 (no prior set)
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

  const eyebrow = isTmTest ? 'On the bar · 100% TM' : `On the bar · ${pctToDisplay(pct)}% TM`;

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
