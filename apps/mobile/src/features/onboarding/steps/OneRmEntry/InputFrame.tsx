import { NumberStepper } from '@/design/primitives/NumberStepper';
import type { Unit } from '@/domain/types';
import { View } from 'react-native';
import type { LiftInput } from '../../hooks/useOnboardingState';

export type InputFrameProps = {
  data: LiftInput;
  unit: Unit;
  weightStep: number;
  onChange: (patch: Partial<LiftInput>) => void;
};

/**
 * Mode-aware input cluster — single weight stepper in `direct` mode,
 * weight + reps in `calculate` mode. The mode toggle itself lives in the
 * parent so it can sit above this frame.
 */
export function InputFrame({ data, unit, weightStep, onChange }: InputFrameProps) {
  if (data.mode === 'direct') {
    return (
      <NumberStepper
        label="One-rep max"
        value={data.weight}
        unit={unit}
        step={weightStep}
        min={0}
        max={9999}
        onChange={(v) => onChange({ weight: v })}
      />
    );
  }
  return (
    <View>
      <NumberStepper
        label="Weight you lifted"
        value={data.weight}
        unit={unit}
        step={weightStep}
        min={0}
        max={9999}
        onChange={(v) => onChange({ weight: v })}
      />
      <View style={{ height: 16 }} />
      <NumberStepper
        label="For how many reps"
        value={data.reps}
        unit="reps"
        step={1}
        min={1}
        max={15}
        onChange={(v) => onChange({ reps: v })}
      />
    </View>
  );
}
