import type { Lift } from '@/domain/types';
import { useCallback, useEffect, useRef } from 'react';
import type { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * Two-way binding between the Progress carousel's horizontal scroll
 * position and the parent component's `selectedLift` state. Mirrors
 * `useHomeCarouselSync` so swiping the Progress pager feels identical
 * to swiping the TODAY pager.
 *
 * Returns a ref to attach to the FlatList and an `onMomentumScrollEnd`
 * handler that converts horizontal offset to a Lift selection. The
 * effect calls `scrollToIndex` when `selectedLift` changes externally
 * (deep link, route param edit) — swallows the "before initial layout"
 * throw the same way the Home hook does.
 */
export type UseProgressCarouselSyncOptions = {
  selectedLift: Lift;
  enabledLifts: Lift[];
  screenWidth: number;
  setSelectedLift: (lift: Lift) => void;
};

export type UseProgressCarouselSyncResult = {
  listRef: React.RefObject<FlatList<Lift> | null>;
  onMomentumScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function useProgressCarouselSync({
  selectedLift,
  enabledLifts,
  screenWidth,
  setSelectedLift,
}: UseProgressCarouselSyncOptions): UseProgressCarouselSyncResult {
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
