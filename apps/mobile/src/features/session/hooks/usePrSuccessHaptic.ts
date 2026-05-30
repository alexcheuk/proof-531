import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

// Latch (firedRef) prevents re-renders from double-firing the success buzz.
export function usePrSuccessHaptic(hasPR: boolean): void {
  const firedRef = useRef(false);
  useEffect(() => {
    if (!hasPR || firedRef.current) return;
    firedRef.current = true;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [hasPR]);
}
