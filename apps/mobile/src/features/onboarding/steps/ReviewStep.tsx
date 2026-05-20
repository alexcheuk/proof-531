import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { PressButton } from '@/design/primitives/PressButton';
import { Text } from '@/design/primitives/Text';
import { shape } from '@/design/tokens';
import { View } from 'react-native';
import {
  LIFT_META,
  LIFT_ORDER,
  type LiftId,
  type OnboardingEntry,
  epley1RM,
  trainingMaxFrom1RM,
} from '../lift-meta';

export type ReviewStepProps = {
  unit: 'lbs' | 'kg';
  enabled: Record<LiftId, boolean>;
  entries: Record<LiftId, OnboardingEntry>;
  onDone: () => void;
};

export function ReviewStep({ unit, enabled, entries, onDone }: ReviewStepProps) {
  const rows = LIFT_ORDER.filter((l) => enabled[l]);
  return (
    <View style={{ gap: shape.rLg }}>
      <Text variant="title" accessibilityRole="header">
        Looks good?
      </Text>
      <Text tone="ink2">Your starting training maxes (90% of estimated 1RM):</Text>

      <View style={{ gap: shape.rSm }}>
        {rows.map((lift) => {
          const { weight, reps } = entries[lift];
          const tm = trainingMaxFrom1RM(epley1RM(weight, reps));
          return (
            <Card key={lift} padded testID={`review-row-${lift}`}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Caps>{LIFT_META[lift].label}</Caps>
                <Caps>{`${tm} ${unit}`}</Caps>
              </View>
            </Card>
          );
        })}
      </View>

      <PressButton onPress={onDone} testID="review-done">
        Done
      </PressButton>
    </View>
  );
}

export default ReviewStep;
