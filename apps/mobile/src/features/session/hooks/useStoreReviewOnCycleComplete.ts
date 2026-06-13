import { useMarkStoreReviewRequested } from '@/data/queries/useMarkStoreReviewRequested';
import * as StoreReview from 'expo-store-review';
import { useEffect, useRef } from 'react';

/**
 * Fires the Play / App Store in-app review prompt once per install, triggered
 * on the first cycle completion after install. Safe to call on every
 * SessionCompleteScreen render: the ref gate and the `storeReviewAlreadyRequested`
 * DB flag together ensure it fires at most once.
 *
 * No-ops when `StoreReview.isAvailableAsync()` returns false (e.g. emulators,
 * sideloaded builds, or any build that predates the expo-store-review native
 * module inclusion). This means the prompt only shows after a fresh production
 * build that includes the native module.
 */
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
