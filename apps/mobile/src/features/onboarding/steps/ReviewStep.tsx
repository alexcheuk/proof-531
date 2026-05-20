import { Caps } from '@/design/primitives/Caps';
import { Eyebrow } from '@/design/primitives/Eyebrow';
import { PressButton } from '@/design/primitives/PressButton';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { OnboardingShell } from '../OnboardingShell';
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
    <OnboardingShell
      footer={
        <PressButton size="lg" variant="ember" onPress={onDone} testID="review-done">
          Done →
        </PressButton>
      }
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: shape.rLg }}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow style={{ marginBottom: shape.rSm }}>Last step</Eyebrow>
        <Text variant="display" accessibilityRole="header">
          Looks good?
        </Text>
        <Text tone="ink1" style={{ marginTop: shape.rMd, lineHeight: shape.rLg + shape.rXs }}>
          Your training maxes. You can always adjust later in Settings.
        </Text>

        <View style={{ marginTop: shape.rLg }}>
          {rows.map((lift, i) => {
            const { weight, reps } = entries[lift];
            const tm = trainingMaxFrom1RM(epley1RM(weight, reps));
            const isLast = i === rows.length - 1;
            const rowStyle: ViewStyle = {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: shape.rMd,
              borderBottomWidth: isLast ? 0 : shape.hairline,
              borderBottomColor: colors.line,
            };
            return (
              <View key={lift} style={rowStyle} testID={`review-row-${lift}`}>
                <View>
                  <Text variant="logo" tone="ink0">
                    {LIFT_META[lift].label}
                  </Text>
                  <Caps style={{ marginTop: shape.rXs }}>TM</Caps>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: shape.rXs }}>
                  <WeightNum value={tm} size="lg" style={{ color: colors.hot }} />
                  <Caps>{unit}</Caps>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

export default ReviewStep;
