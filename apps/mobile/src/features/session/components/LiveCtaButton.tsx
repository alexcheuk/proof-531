import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import type { UseLiveScreenStateResult } from '../hooks/useLiveScreenState';

export type LiveCtaButtonProps = {
  phase: UseLiveScreenStateResult['phase'];
  setIndex: UseLiveScreenStateResult['setIndex'];
  isAmrap: boolean;
  isTmTest: boolean;
  onAdvanceFromRest: () => void;
  onOpenAmrapSheet: () => void;
  onOpenTmTestSheet: () => void;
  onLogWorkingSet: () => void;
};

// The rest CTA advances to the NEXT SET, not to the receipt — earlier label "Complete session" was wrong.
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
