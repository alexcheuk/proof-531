import { Caps } from '@/design/primitives/Caps';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PressButton } from '@/design/primitives/PressButton';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import { useEffect, useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import type { TodaySession } from './LiveScreen';

export type LiftingPhaseProps = {
  set: TodaySession['sets'][number];
  unit: 'lbs' | 'kg';
  onComplete: (actualReps: number) => void;
};

const CONTAINER: ViewStyle = {
  flex: 1,
  backgroundColor: colors.bg0,
  padding: shape.rLg,
  alignItems: 'center',
  justifyContent: 'center',
  gap: shape.rLg,
};

const ROW: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'baseline',
  gap: shape.rSm,
};

// Stepper bounds: 0 is allowed because an AMRAP set can fail at 0 reps; the
// upper bound is high enough that the user will never naturally hit it.
const REPS_MIN = 0;
const REPS_MAX = 99;
const REPS_STEP = 1;

export function LiftingPhase({ set, unit, onComplete }: LiftingPhaseProps) {
  const [actualReps, setActualReps] = useState(set.prescribedReps);

  useEffect(() => {
    setActualReps(set.prescribedReps);
  }, [set.prescribedReps]);

  return (
    <View style={CONTAINER} testID="lifting-phase">
      <Caps>{set.amrap ? 'AMRAP set' : `Set ${set.index + 1}`}</Caps>
      <View style={ROW}>
        <WeightNum value={set.prescribedWeight} size="lg" />
        <Caps>{unit}</Caps>
      </View>
      <NumberStepper
        value={actualReps}
        min={REPS_MIN}
        max={REPS_MAX}
        step={REPS_STEP}
        onChange={setActualReps}
        unit="reps"
        testID="actual-reps-stepper"
      />
      <PressButton onPress={() => onComplete(actualReps)} variant="ember" size="lg">
        Complete
      </PressButton>
    </View>
  );
}
