import { useMarkReviewPrompted } from '@/data/queries/useMarkReviewPrompted';
import { useSettings } from '@/data/queries/useSettings';
import * as StoreReview from 'expo-store-review';
import { useEffect, useRef } from 'react';

type Props = {
  isCycleComplete: boolean;
  cycle: number;
  /** Only prompt on the live just-finished flow, never while browsing history. */
  origin: 'live' | 'history';
};

/**
 * Requests an in-app review after the user completes their 2nd+ cycle.
 * Only fires on the live close-the-day flow (not when browsing history).
 * Fires once per install (gated by settings.reviewPromptedAt). Both
 * platforms impose their own rate-limiting on top of this gate.
 */
export function useInAppReview({ isCycleComplete, cycle, origin }: Props): void {
  const settings = useSettings();
  const markPrompted = useMarkReviewPrompted();
  const firedRef = useRef(false);

  useEffect(() => {
    if (origin !== 'live') return;
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
    origin,
    isCycleComplete,
    cycle,
    settings.isLoading,
    settings.isError,
    settings.data?.reviewPromptedAt,
    markPrompted,
  ]);
}
