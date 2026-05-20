import { Caps } from '@/design/primitives/Caps';
import { PressButton } from '@/design/primitives/PressButton';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { View } from 'react-native';

export type PRModalProps = {
  liftLabel: string;
  priorE1RM: number;
  newE1RM: number;
  unit: 'lbs' | 'kg';
  onContinue: () => void;
};

export function PRModal({ liftLabel, priorE1RM, newE1RM, unit, onContinue }: PRModalProps) {
  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg0,
        alignItems: 'center',
        justifyContent: 'center',
        padding: shape.rLg,
        gap: shape.rLg,
      }}
      testID="pr-modal"
    >
      <Caps style={{ color: colors.hot }}>New PR</Caps>
      <Caps>{liftLabel}</Caps>
      <WeightNum value={newE1RM} size="lg" />
      <Text variant="small" tone="ink2">{`was ${priorE1RM} ${unit}`}</Text>
      <PressButton variant="ember" onPress={onContinue} testID="pr-continue">
        Continue
      </PressButton>
    </View>
  );
}

export default PRModal;
