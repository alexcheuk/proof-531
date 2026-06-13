import { useMarkStoreReviewRequested } from '@/data/queries/useMarkStoreReviewRequested';
import * as StoreReview from 'expo-store-review';
import { useEffect, useRef } from 'react';

// Dual-guarded (in-memory ref + DB flag) so it fires once per install even if the screen re-renders.
// No-ops silently when isAvailableAsync() is false (emulators, sideloaded builds, old native builds).
export function useStoreReviewOnCycleComplete(
  isCycleComplete: boolean,
  storeReviewAlreadyRequested: boolean,
): void {
  const hasTriggeredRef = useRef(false);
  const markRequested = useMarkStoreReviewRequested();

  useEffect(() => {
    if (!isCycleComplete || storeReviewAlreadyRequested || hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    void (async () => {
      try {
        const available = await StoreReview.isAvailableAsync();
        if (!available) return;
        await StoreReview.requestReview();
        markRequested.mutate();
      } catch {
        // Best-effort: never let a review prompt error surface to the user.
      }
    })();
    // hasTriggeredRef is the real guard against double-fire; markRequested is a stable mutation object.
  }, [isCycleComplete, storeReviewAlreadyRequested, markRequested]);
}
