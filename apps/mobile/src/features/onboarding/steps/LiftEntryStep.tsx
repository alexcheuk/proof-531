import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { Eyebrow } from '@/design/primitives/Eyebrow';
import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PressButton } from '@/design/primitives/PressButton';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import { ScrollView, View } from 'react-native';
import { OnboardingShell } from '../OnboardingShell';
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
    <OnboardingShell
      footer={
        <View style={{ flexDirection: 'row', gap: shape.rSm }}>
          <View style={{ flex: 1 }}>
            <PressButton size="lg" variant="ghost" onPress={onPrev} testID="entry-prev">
              Back
            </PressButton>
          </View>
          <View style={{ flex: 2 }}>
            <PressButton size="lg" variant="ember" onPress={onNext} testID="entry-next">
              Next →
            </PressButton>
          </View>
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: shape.rLg }}
        showsVerticalScrollIndicator={false}
      >
        <Caps testID="entry-counter">{`step ${entryIndex + 1} of ${totalEnabled}`}</Caps>
        <Text variant="display" accessibilityRole="header" style={{ marginTop: shape.rSm }}>
          {LIFT_META[lift].label}
        </Text>
        <Eyebrow style={{ marginTop: shape.rSm }}>Your best recent set</Eyebrow>

        <View style={{ marginTop: shape.rLg, gap: shape.rSm }}>
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

        <View style={{ marginTop: shape.rLg, gap: shape.rSm }}>
          <Caps>Reps</Caps>
          <View accessibilityLabel="Reps">
            <NumberStepper
              value={reps}
              min={1}
              max={20}
              step={1}
              onChange={(next) => onChange(weight, next)}
              unit="reps"
              testID={`reps-stepper-${lift}`}
            />
          </View>
        </View>

        <View style={{ marginTop: shape.rLg }}>
          <Card padded>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <View style={{ flex: 1 }}>
                <Caps testID={`entry-e1rm-${lift}`}>Estimated 1RM</Caps>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    gap: shape.rXs,
                    marginTop: shape.rXs,
                  }}
                >
                  <WeightNum value={oneRm} size="lg" />
                  <Caps>{unit}</Caps>
                </View>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Caps testID={`entry-tm-${lift}`}>Training max (90%)</Caps>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    gap: shape.rXs,
                    marginTop: shape.rXs,
                  }}
                >
                  <WeightNum value={tm} size="lg" style={{ color: colors.hot }} />
                  <Caps>{unit}</Caps>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

export default LiftEntryStep;
