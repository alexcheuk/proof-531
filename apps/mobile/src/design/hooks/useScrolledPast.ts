import { useCallback, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * Watches a ScrollView / FlatList vertical offset and flips a boolean as it
 * crosses a threshold (default 4 px). Used by screens that want a sticky
 * header to elevate (shadow / hairline) once content has scrolled, then
 * return to flat when scrolled back to the top.
 *
 * Returns `{ scrolled, onScroll, scrollEventThrottle }` — spread the latter
 * two onto the scrollable. The state only re-renders when the boolean
 * *flips*; intermediate scroll positions are dropped so animation isn't
 * re-rendering the whole tree.
 */
export type UseScrolledPastResult = {
  scrolled: boolean;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle: number;
};

export function useScrolledPast(threshold = 4): UseScrolledPastResult {
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const next = y > threshold;
      // Only setState on flip — every intermediate scroll tick would
      // otherwise re-render the masthead + sibling content.
      setScrolled((prev) => (prev === next ? prev : next));
    },
    [threshold],
  );

  return { scrolled, onScroll, scrollEventThrottle: 16 };
}
