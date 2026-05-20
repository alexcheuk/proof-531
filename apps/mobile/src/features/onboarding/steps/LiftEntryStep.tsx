import { Caps } from '@/design/primitives/Caps';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PressButton } from '@/design/primitives/PressButton';
import { Text } from '@/design/primitives/Text';
import { shape } from '@/design/tokens';
import { View } from 'react-native';
import { LIFT_META, type LiftId, epley1RM, trainingMaxFrom1RM } from '../lift-meta';

export type LiftEntryStepProps = {
  lift: LiftId;
  entryIndex: number;
  totalEnabled: number;
  weight: number;
  reps: number;
  unit: 'lbs' | 'kg';
  onChange: (weight: number, reps: number) => void;
  onNext: () => void;
  onPrev: () => void;
};

export function LiftEntryStep({
  lift,
  entryIndex,
  totalEnabled,
  weight,
  reps,
  unit,
  onChange,
  onNext,
  onPrev,
}: LiftEntryStepProps) {
  const oneRm = epley1RM(weight, reps);
  const tm = trainingMaxFrom1RM(oneRm);
  return (
    <View style={{ gap: shape.rLg }}>
      <Caps testID="entry-counter">{`step ${entryIndex + 1} of ${totalEnabled}`}</Caps>
      <Text variant="title" accessibilityRole="header">
        {LIFT_META[lift].label}
      </Text>

      <View style={{ gap: shape.rSm }}>
        <Caps>Weight</Caps>
        <View accessibilityLabel="Weight">
          <NumberStepper
            value={weight}
            min={0}
            max={1000}
            step={5}
            onChange={(next) => onChange(next, reps)}
            unit={unit}
            testID={`weight-stepper-${lift}`}
          />
        </View>
      </View>

      <View style={{ gap: shape.rSm }}>
        <Caps>Reps</Caps>
        <View accessibilityLabel="Reps">
          <NumberStepper
            value={reps}
            min={1}
            max={20}
            step={1}
            onChange={(next) => onChange(weight, next)}
            testID={`reps-stepper-${lift}`}
          />
        </View>
      </View>

      <View style={{ gap: shape.rXs }}>
        <Caps testID={`entry-e1rm-${lift}`}>{`e1RM ${oneRm} ${unit}`}</Caps>
        <Caps testID={`entry-tm-${lift}`}>{`TM ${tm} ${unit}`}</Caps>
      </View>

      <View style={{ flexDirection: 'row', gap: shape.rSm }}>
        <View style={{ flex: 1 }}>
          <PressButton variant="ghost" onPress={onPrev} testID="entry-prev">
            Back
          </PressButton>
        </View>
        <View style={{ flex: 1 }}>
          <PressButton onPress={onNext} testID="entry-next">
            Next
          </PressButton>
        </View>
      </View>
    </View>
  );
}

export default LiftEntryStep;
