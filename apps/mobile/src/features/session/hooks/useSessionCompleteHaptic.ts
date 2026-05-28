import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

/**
 * Fires `Haptics.impactAsync(Heavy)` exactly once when the session-complete
 * view data first becomes available (i.e. the session is confirmed done and
 * the receipt has loaded).
 *
 * Runs for every session completion regardless of whether a PR was hit. The
 * PR-specific success buzz (`usePrSuccessHaptic`) is a separate hook that
 * fires in addition to this one on PR sessions.
 */
export function useSessionCompleteHaptic(viewReady: boolean): void {
  const firedRef = useRef(false);
  useEffect(() => {
    if (!viewReady || firedRef.current) return;
    firedRef.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [viewReady]);
}
