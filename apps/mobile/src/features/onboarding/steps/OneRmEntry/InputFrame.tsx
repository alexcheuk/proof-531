import { NumberStepper } from '@/design/primitives/NumberStepper';
import { useTheme } from '@/design/theme';
import { barWeight } from '@/domain/plates';
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
 * Mode-aware input cluster  -  single weight stepper in `direct` mode,
 * weight + reps in `calculate` mode. The mode toggle itself lives in the
 * parent so it can sit above this frame.
 */
export function InputFrame({ data, unit, weightStep, onChange }: InputFrameProps) {
  const { spacing } = useTheme();
  const bar = barWeight(unit);
  if (data.mode === 'direct') {
    return (
      <NumberStepper
        label="One-rep max"
        value={data.weight}
        unit={unit}
        step={weightStep}
        min={bar}
        max={9999}
        onChange={(v) => onChange({ weight: v })}
      />
    );
  }
  return (
    <View style={{ gap: spacing.lg }}>
      <NumberStepper
        label="Weight you lifted"
        value={data.weight}
        unit={unit}
        step={weightStep}
        min={bar}
        max={9999}
        onChange={(v) => onChange({ weight: v })}
      />
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
