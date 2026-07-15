import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

// Separated from usePrSuccessHaptic so the "entering PR territory" cue (pre-commit) never couples to the post-save success beat.
export function useAmrapPrEdgeHaptic(open: boolean, isPotentialPR: boolean): void {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    firedRef.current = false;
  }, [open]);

  useEffect(() => {
    if (!open || !isPotentialPR || firedRef.current) return;
    firedRef.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [open, isPotentialPR]);
}
