import { MonoBadge } from '@/design/primitives/MonoBadge';
import { tmAdjustmentSuggestion } from '@/domain/progression';
import type { Lift, Unit } from '@/domain/types';

export type TmTestBandChipProps = {
  reps: number;
  lift: Lift;
  unit: Unit;
  testID?: string;
};

export function TmTestBandChip({ reps, lift, unit, testID }: TmTestBandChipProps) {
  const suggestion = tmAdjustmentSuggestion(reps, lift, unit);
  const label =
    suggestion.kind === 'increment' ? 'PASS' : suggestion.kind === 'hold' ? 'HOLD' : 'RESET';
  return (
    <MonoBadge size="sm" {...(testID ? { testID } : {})}>
      {label}
    </MonoBadge>
  );
}
