import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

/**
 * Fires `Haptics.notificationAsync(Success)` exactly once when `hasPR` is true.
 *
 * The latch ensures re-renders (e.g. settings refetch) don't double-fire the
 * success buzz.
 */
export function usePrSuccessHaptic(hasPR: boolean): void {
  const firedRef = useRef(false);
  useEffect(() => {
    if (!hasPR || firedRef.current) return;
    firedRef.current = true;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [hasPR]);
}
