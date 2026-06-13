import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

/**
 * Fires a single Light impact haptic the moment `isPotentialPR` flips
 * from false → true while the AMRAP sheet is open  -  gives the user a
 * subtle "you just hit PR territory" buzz as they dial up reps with
 * the stepper, before they commit by tapping Save.
 *
 * Re-armed every time the sheet opens (`open` flipping false → true
 * resets the latch). Closing the sheet leaves the latch tripped so
 * stray re-renders don't fire a second haptic on the same session.
 *
 * Kept as a standalone hook so the alert is independent of the post-
 * save success haptic (`usePrSuccessHaptic`)  -  the two fire at
 * different beats and shouldn't be coupled.
 */
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
