import type { Lift } from '@/domain/types';
import { useCallback, useEffect, useRef } from 'react';
import type { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

// scrollToIndex throws before initial layout on Expo SDK 55; the effect swallows that one-shot.
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
  // Skip the initial sync  -  `initialScrollIndex` on the FlatList already
  // positions the carousel at `selectedLift` on mount. Animating on first
  // run causes the visible "scroll back to selected lift" flash when the
  // user returns to Home from a session (HomeScreen remounts, this hook
  // re-fires, the animation plays even though we're already at the target).
  // Only animate on selection changes that happen AFTER mount  -  taps on
  // LiftTabs, deep-link route param updates, etc.
  const hasMounted = useRef(false);

  useEffect(() => {
    const wasMounted = hasMounted.current;
    hasMounted.current = true;
    // Flip the mount flag BEFORE the early returns so the ref-null path
    // (which can happen on a parent that mounts the FlatList lazily)
    // still consumes the initial-mount allowance  -  otherwise the first
    // effect run with a usable ref would always animate, defeating the
    // fix.
    if (!wasMounted) return;
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
