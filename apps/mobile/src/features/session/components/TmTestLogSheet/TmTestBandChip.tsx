import { MonoBadge } from '@/design/primitives/MonoBadge';
import { tmAdjustmentSuggestion } from '@/domain/progression';
import type { Lift, Unit } from '@/domain/types';

export type TmTestBandChipProps = {
  reps: number;
  lift: Lift;
  unit: Unit;
  testID?: string;
};

/**
 * PASS / HOLD / RESET caps-mono badge shown next to "Reps achieved at TM" in
 * the `TmTestLogSheet`. Wraps the existing `MonoBadge` primitive  -  the chip
 * itself is a feature-local composition, not a new primitive.
 *
 * Semantics map directly onto {@link tmAdjustmentSuggestion}:
 *   reps ≥ 5 → PASS   (increment band)
 *   reps 3–4 → HOLD   (hold band)
 *   reps 0–2 → RESET  (reset band)
 *
 * The chip is read-only  -  it announces the band the lifter has dialed into,
 * not a decision they have to confirm. The actual TM adjustment is surfaced
 * on the Session Complete screen and is opt-in.
 */
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
