import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import type { UseLiveScreenStateResult } from '../hooks/useLiveScreenState';

export type LiveCtaButtonProps = {
  phase: UseLiveScreenStateResult['phase'];
  setIndex: UseLiveScreenStateResult['setIndex'];
  isAmrap: boolean;
  /**
   * True when the current set is the Week-4 TM Test set. The CTA pivots to
   * "Log TM test" and opens the dedicated `TmTestLogSheet` rather than the
   * AMRAP sheet.
   */
  isTmTest: boolean;
  onAdvanceFromRest: () => void;
  onOpenAmrapSheet: () => void;
  /** Opens the TM Test rep-entry sheet. */
  onOpenTmTestSheet: () => void;
  onLogWorkingSet: () => void;
};

/**
 * The single primary CTA on the LiveScreen. Its label + glyph depends on
 * which phase the screen is in:
 *
 *   rest, before set 3   → "Next set"      (→)
 *   rest, before final   → "Final set"     (→)
 *   set, AMRAP           → "Log AMRAP"     (→)
 *   set, TM test         → "Log TM test"   (→)
 *   set, working         → "Set complete"  (✓)
 *
 * The rest CTA advances to the next set surface — it does NOT complete the
 * session (the working/AMRAP CTAs on the set surface do). Earlier copy of
 * "Complete session" on `setIndex === 2` was misleading: pressing it took
 * the user to their FINAL set, not to the receipt.
 *
 * The amrap-log / tm-test-log phases re-use the CTA from the phase they
 * popped out of, so the same selection rules apply.
 */
export function LiveCtaButton({
  phase,
  setIndex,
  isAmrap,
  isTmTest,
  onAdvanceFromRest,
  onOpenAmrapSheet,
  onOpenTmTestSheet,
  onLogWorkingSet,
}: LiveCtaButtonProps) {
  if (phase === 'rest') {
    const isHeadingIntoFinal = setIndex === 2;
    return (
      <PrimaryPillButton testID="cta-advance-rest" glyph="→" onPress={onAdvanceFromRest}>
        {isHeadingIntoFinal ? 'Final set' : 'Next set'}
      </PrimaryPillButton>
    );
  }
  if (phase !== 'set' && phase !== 'amrap-log' && phase !== 'tm-test-log') return null;
  if (isTmTest) {
    return (
      <PrimaryPillButton testID="cta-log-tm-test" glyph="→" onPress={onOpenTmTestSheet}>
        Log TM test
      </PrimaryPillButton>
    );
  }
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
