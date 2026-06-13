import { useMarkReviewPrompted } from '@/data/queries/useMarkReviewPrompted';
import { useSettings } from '@/data/queries/useSettings';
import * as StoreReview from 'expo-store-review';
import { useEffect, useRef } from 'react';

type Props = {
  isCycleComplete: boolean;
  cycle: number;
};

/**
 * Requests an in-app review after the user completes their 2nd+ cycle.
 * Fires once per install (gated by settings.reviewPromptedAt). Both
 * platforms impose their own rate-limiting on top of this gate.
 */
export function useInAppReview({ isCycleComplete, cycle }: Props): void {
  const settings = useSettings();
  const markPrompted = useMarkReviewPrompted();
  const firedRef = useRef(false);

  useEffect(() => {
    if (!isCycleComplete) return;
    if (cycle < 2) return;
    if (firedRef.current) return;
    if (settings.isLoading || settings.isError) return;
    if (settings.data?.reviewPromptedAt != null) return;

    firedRef.current = true;
    void (async () => {
      try {
        const available = await StoreReview.isAvailableAsync();
        if (available) {
          await StoreReview.requestReview();
        }
      } catch {
        // Review prompt failures are silent - non-critical UX
      } finally {
        markPrompted.mutate();
      }
    })();
  }, [
    isCycleComplete,
    cycle,
    settings.isLoading,
    settings.isError,
    settings.data?.reviewPromptedAt,
    markPrompted,
  ]);
}
