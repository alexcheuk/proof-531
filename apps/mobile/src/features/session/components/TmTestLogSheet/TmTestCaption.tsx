import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';
import { tmAdjustmentSuggestion } from '@/domain/progression';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';

export type TmTestCaptionProps = {
  reps: number;
  lift: Lift;
  unit: Unit;
};

/**
 * Live one-line caption that updates as the lifter steps through the rep
 * counter inside `TmTestLogSheet`. Translates the band the count falls in
 * into plain English, citing the eventual TM suggestion:
 *
 *   0..2 → "Suggests −10% reset · TM might be too high"
 *   3..4 → "Suggests hold · TM is honest"
 *   ≥5   → "Suggests +N {unit} · TM was conservative"
 *
 * Pure derivation of `tmAdjustmentSuggestion`. No haptics, no animation  -
 * the brief is emphatic that crossing the rep band is information, not a
 * "PR moment".
 */
export function TmTestCaption({ reps, lift, unit }: TmTestCaptionProps) {
  const { spacing } = useTheme();
  const suggestion = tmAdjustmentSuggestion(reps, lift, unit);
  const text = (() => {
    if (suggestion.kind === 'increment') {
      return `Suggests +${suggestion.delta} ${displayUnit(unit)} · TM was conservative`;
    }
    if (suggestion.kind === 'hold') {
      return 'Suggests hold · TM is honest';
    }
    return 'Suggests −10% reset · TM might be too high';
  })();
  return (
    <CapsLabel
      size="xs"
      color="ink2"
      style={{ marginTop: spacing.sm, textAlign: 'center' }}
      testID="tm-test-caption"
    >
      {text}
    </CapsLabel>
  );
}
