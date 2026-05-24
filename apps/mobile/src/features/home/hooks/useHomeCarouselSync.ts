import type { Lift } from '@/domain/types';
import { useCallback, useEffect, useRef } from 'react';
import type { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * Two-way binding between the home carousel's scroll position and the
 * `selectedLift` state owned by `useHomeScreenState`.
 *
 * Returns:
 *  - `listRef` to attach to the carousel `FlatList`
 *  - `onMomentumScrollEnd` to convert horizontal scroll offset into a lift
 *    selection (debouncing through `selectedLift !== nextLift`)
 *
 * The hook also runs a one-way effect that calls `scrollToIndex` whenever
 * `selectedLift` changes from outside the carousel (LiftTabs tap, settings
 * edit, deep link). `scrollToIndex` can throw before initial layout on
 * Expo SDK 55; we swallow that one-shot to avoid a noisy first paint.
 */
export type UseHomeCarouselSyncOptions = {
  selectedLift: Lift;
  enabledLifts: Lift[];
  screenWidth: number;
  setSelectedLift: (lift: Lift) => void;
};

export type UseHomeCarouselSyncResult = {
  listRef: React.RefObject<FlatList<Lift> | null>;
  onMomentumScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function useHomeCarouselSync({
  selectedLift,
  enabledLifts,
  screenWidth,
  setSelectedLift,
}: UseHomeCarouselSyncOptions): UseHomeCarouselSyncResult {
  const listRef = useRef<FlatList<Lift>>(null);

  useEffect(() => {
    const idx = enabledLifts.indexOf(selectedLift);
    if (idx < 0 || !listRef.current) return;
    try {
      listRef.current.scrollToIndex({ index: idx, animated: true });
    } catch {
      // scrollToIndex can throw before initial layout; ignore.
    }
  }, [selectedLift, enabledLifts]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
      const lift = enabledLifts[idx];
      if (lift && lift !== selectedLift) {
        setSelectedLift(lift);
      }
    },
    [enabledLifts, selectedLift, screenWidth, setSelectedLift],
  );

  return { listRef, onMomentumScrollEnd };
}
