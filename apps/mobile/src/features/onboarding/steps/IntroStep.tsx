import { PressButton } from '@/design/primitives/PressButton';
import { Text } from '@/design/primitives/Text';
import { shape } from '@/design/tokens';
import { View } from 'react-native';

export type IntroStepProps = {
  onBegin: () => void;
};

export function IntroStep({ onBegin }: IntroStepProps) {
  return (
    <View style={{ gap: shape.rLg }}>
      <Text variant="title" accessibilityRole="header">
        Welcome to 531 Strength
      </Text>
      <Text tone="ink1">
        Train the four main lifts on a simple, proven 5/3/1 plan. We'll size your training maxes
        from a recent set, then progress them cycle by cycle.
      </Text>
      <Text tone="ink2">It takes about a minute to set up.</Text>
      <PressButton onPress={onBegin} testID="intro-begin">
        Begin
      </PressButton>
    </View>
  );
}

export default IntroStep;
