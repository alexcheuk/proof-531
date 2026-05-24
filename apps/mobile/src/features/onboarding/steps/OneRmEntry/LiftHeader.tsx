import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import type { Lift } from '@/domain/types';
import { View } from 'react-native';
import { LIFT_META } from '../../lifts';

export type LiftHeaderProps = {
  lift: Lift;
  step: number;
  total: number;
};

/** "Lift 02 of 04" eyebrow + giant lift name + italic subtitle. */
export function LiftHeader({ lift, step, total }: LiftHeaderProps) {
  const meta = LIFT_META[lift];
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 }}>
      <CapsLabel style={{ marginBottom: 6 }}>
        {`Lift ${String(step).padStart(2, '0')} of ${String(total).padStart(2, '0')}`}
      </CapsLabel>
      <Text
        variant="sans"
        weight="bold"
        size={40}
        color="ink0"
        style={{ letterSpacing: -1.4, lineHeight: 46 }}
      >
        {`${meta.label}.`}
      </Text>
      <Text variant="sans" weight="medium" size={13} color="ink2" style={{ marginTop: 4 }}>
        {`${meta.italic}.`}
      </Text>
    </View>
  );
}
