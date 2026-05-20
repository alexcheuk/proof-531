import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { PressButton } from '@/design/primitives/PressButton';
import { SegRail } from '@/design/primitives/SegRail';
import { Text } from '@/design/primitives/Text';
import { shape } from '@/design/tokens';
import { View } from 'react-native';
import { LIFT_META, LIFT_ORDER, type LiftId } from '../lift-meta';

export type LiftSelectStepProps = {
  unit: 'lbs' | 'kg';
  enabled: Record<LiftId, boolean>;
  onUnitChange: (unit: 'lbs' | 'kg') => void;
  onToggleLift: (lift: LiftId) => void;
  onNext: () => void;
};

export function LiftSelectStep({
  unit,
  enabled,
  onUnitChange,
  onToggleLift,
  onNext,
}: LiftSelectStepProps) {
  const anyEnabled = LIFT_ORDER.some((l) => enabled[l]);
  return (
    <View style={{ gap: shape.rLg }}>
      <Text variant="title" accessibilityRole="header">
        Pick your lifts
      </Text>
      <View style={{ gap: shape.rSm }}>
        <Caps>Units</Caps>
        <SegRail<'lbs' | 'kg'>
          options={['lbs', 'kg']}
          value={unit}
          onChange={onUnitChange}
          testID="unit-toggle"
        />
      </View>
      <View style={{ gap: shape.rSm }}>
        {LIFT_ORDER.map((lift) => {
          const isOn = enabled[lift];
          return (
            <Card
              key={lift}
              interactive
              onPress={() => onToggleLift(lift)}
              testID={`lift-toggle-${lift}`}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text variant="subtitle">{LIFT_META[lift].label}</Text>
                <Text tone={isOn ? 'hot' : 'ink3'}>{isOn ? 'on' : 'off'}</Text>
              </View>
            </Card>
          );
        })}
      </View>
      <PressButton onPress={onNext} disabled={!anyEnabled} testID="select-next">
        Next
      </PressButton>
    </View>
  );
}

export default LiftSelectStep;
