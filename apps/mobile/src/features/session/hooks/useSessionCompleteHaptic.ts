import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

// Fires on every completion (not just PRs) — usePrSuccessHaptic fires additionally on PR sessions.
export function useSessionCompleteHaptic(viewReady: boolean): void {
  const firedRef = useRef(false);
  useEffect(() => {
    if (!viewReady || firedRef.current) return;
    firedRef.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [viewReady]);
}
