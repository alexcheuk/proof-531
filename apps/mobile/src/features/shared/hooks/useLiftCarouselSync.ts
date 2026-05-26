import type { Lift } from '@/domain/types';
import { useCallback, useEffect, useRef } from 'react';
import type { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * Two-way binding between a horizontal lift carousel's scroll position and
 * the parent's `selectedLift` state. Shared between HomeScreen and
 * ProgressScreen — both render the same "one page per enabled lift"
 * shape and need identical sync behaviour (a momentum-end handler that
 * dispatches the new lift, plus an effect that `scrollToIndex`'s when the
 * selection changes externally via LiftTabs / deep-link / route params).
 *
 * `scrollToIndex` can throw before initial layout on Expo SDK 55; the
 * effect swallows that one-shot to keep first paint quiet.
 */
export type UseLiftCarouselSyncOptions = {
  selectedLift: Lift;
  enabledLifts: Lift[];
  screenWidth: number;
  setSelectedLift: (lift: Lift) => void;
};

export type UseLiftCarouselSyncResult = {
  listRef: React.RefObject<FlatList<Lift> | null>;
  onMomentumScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function useLiftCarouselSync({
  selectedLift,
  enabledLifts,
  screenWidth,
  setSelectedLift,
}: UseLiftCarouselSyncOptions): UseLiftCarouselSyncResult {
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
