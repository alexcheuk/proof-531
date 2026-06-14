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
