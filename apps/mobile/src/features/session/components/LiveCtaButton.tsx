import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import type { UseLiveScreenStateResult } from '../hooks/useLiveScreenState';

export type LiveCtaButtonProps = {
  phase: UseLiveScreenStateResult['phase'];
  setIndex: UseLiveScreenStateResult['setIndex'];
  isAmrap: boolean;
  onAdvanceFromRest: () => void;
  onOpenAmrapSheet: () => void;
  onLogWorkingSet: () => void;
};

/**
 * The single primary CTA on the LiveScreen. Its label + glyph depends on
 * which phase the screen is in:
 *
 *   rest, set 1/2  → "Next set"          (→)
 *   rest, set 3    → "Complete session"  (→)
 *   set, AMRAP     → "Log AMRAP"         (→)
 *   set, working   → "Set complete"      (✓)
 *
 * Cancel-confirm and amrap-log phases re-use the CTA from the phase they
 * popped out of, so the same selection rules apply.
 */
export function LiveCtaButton({
  phase,
  setIndex,
  isAmrap,
  onAdvanceFromRest,
  onOpenAmrapSheet,
  onLogWorkingSet,
}: LiveCtaButtonProps) {
  if (phase === 'rest') {
    const hasNext = setIndex < 2;
    return (
      <PrimaryPillButton testID="cta-advance-rest" glyph="→" onPress={onAdvanceFromRest}>
        {hasNext ? 'Next set' : 'Complete session'}
      </PrimaryPillButton>
    );
  }
  if (phase !== 'set' && phase !== 'amrap-log' && phase !== 'cancel-confirm') return null;
  if (isAmrap) {
    return (
      <PrimaryPillButton testID="cta-log-amrap" glyph="→" onPress={onOpenAmrapSheet}>
        Log AMRAP
      </PrimaryPillButton>
    );
  }
  return (
    <PrimaryPillButton testID="cta-log-working" glyph="✓" onPress={onLogWorkingSet}>
      Set complete
    </PrimaryPillButton>
  );
}
