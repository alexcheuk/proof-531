import type { Lift } from '@/domain/types';
import { act, renderHook } from '@testing-library/react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useHomeCarouselSync } from '../useHomeCarouselSync';

const SCREEN_WIDTH = 390;
const ENABLED: Lift[] = ['squat', 'bench', 'deadlift', 'press'];

function scrollEvent(x: number): NativeSyntheticEvent<NativeScrollEvent> {
  // Only the subset of fields the hook reads.
  return {
    nativeEvent: { contentOffset: { x, y: 0 } },
  } as unknown as NativeSyntheticEvent<NativeScrollEvent>;
}

describe('useHomeCarouselSync — onMomentumScrollEnd', () => {
  it('dispatches setSelectedLift when scroll lands on a new page', () => {
    const setSelectedLift = jest.fn();
    const { result } = renderHook(() =>
      useHomeCarouselSync({
        selectedLift: 'squat',
        enabledLifts: ENABLED,
        screenWidth: SCREEN_WIDTH,
        setSelectedLift,
      }),
    );

    act(() => {
      result.current.onMomentumScrollEnd(scrollEvent(SCREEN_WIDTH * 2));
    });

    expect(setSelectedLift).toHaveBeenCalledWith('deadlift');
  });

  it('is a no-op when the user scrolls to the already-selected page', () => {
    const setSelectedLift = jest.fn();
    const { result } = renderHook(() =>
      useHomeCarouselSync({
        selectedLift: 'bench',
        enabledLifts: ENABLED,
        screenWidth: SCREEN_WIDTH,
        setSelectedLift,
      }),
    );

    act(() => {
      result.current.onMomentumScrollEnd(scrollEvent(SCREEN_WIDTH * 1));
    });

    expect(setSelectedLift).not.toHaveBeenCalled();
  });

  it('rounds fractional scroll offsets to the nearest page', () => {
    const setSelectedLift = jest.fn();
    const { result } = renderHook(() =>
      useHomeCarouselSync({
        selectedLift: 'squat',
        enabledLifts: ENABLED,
        screenWidth: SCREEN_WIDTH,
        setSelectedLift,
      }),
    );

    // Halfway between page 1 (bench) and page 2 (deadlift) rounds to 2.
    act(() => {
      result.current.onMomentumScrollEnd(scrollEvent(SCREEN_WIDTH * 1.5));
    });

    expect(setSelectedLift).toHaveBeenCalledWith('deadlift');
  });

  it('ignores scroll positions outside the enabled-lift range', () => {
    const setSelectedLift = jest.fn();
    const { result } = renderHook(() =>
      useHomeCarouselSync({
        selectedLift: 'squat',
        enabledLifts: ENABLED,
        screenWidth: SCREEN_WIDTH,
        setSelectedLift,
      }),
    );

    act(() => {
      // Page 99 — way past the last enabled lift.
      result.current.onMomentumScrollEnd(scrollEvent(SCREEN_WIDTH * 99));
    });

    expect(setSelectedLift).not.toHaveBeenCalled();
  });
});

describe('useHomeCarouselSync — listRef effect', () => {
  it('returns a listRef the caller can attach to a FlatList', () => {
    const { result } = renderHook(() =>
      useHomeCarouselSync({
        selectedLift: 'squat',
        enabledLifts: ENABLED,
        screenWidth: SCREEN_WIDTH,
        setSelectedLift: jest.fn(),
      }),
    );
    expect(result.current.listRef).toBeDefined();
    expect(result.current.listRef.current).toBeNull();
  });

  it('calls scrollToIndex with the new index when selectedLift changes externally', () => {
    const scrollToIndex = jest.fn();
    const setSelectedLift = jest.fn();
    type Props = { selectedLift: Lift };
    const { result, rerender } = renderHook(
      ({ selectedLift }: Props) =>
        useHomeCarouselSync({
          selectedLift,
          enabledLifts: ENABLED,
          screenWidth: SCREEN_WIDTH,
          setSelectedLift,
        }),
      { initialProps: { selectedLift: 'squat' as Lift } },
    );

    // Attach a stub FlatList shim — we only call scrollToIndex on it.
    (
      result.current.listRef as { current: { scrollToIndex: typeof scrollToIndex } | null }
    ).current = {
      scrollToIndex,
    };

    rerender({ selectedLift: 'deadlift' });

    expect(scrollToIndex).toHaveBeenCalledWith({ index: 2, animated: true });
  });

  it('swallows scrollToIndex errors (pre-layout edge case)', () => {
    const scrollToIndex = jest.fn(() => {
      throw new Error('out of range');
    });
    type Props = { selectedLift: Lift };
    const { result, rerender } = renderHook(
      ({ selectedLift }: Props) =>
        useHomeCarouselSync({
          selectedLift,
          enabledLifts: ENABLED,
          screenWidth: SCREEN_WIDTH,
          setSelectedLift: jest.fn(),
        }),
      { initialProps: { selectedLift: 'squat' as Lift } },
    );

    (
      result.current.listRef as { current: { scrollToIndex: typeof scrollToIndex } | null }
    ).current = {
      scrollToIndex,
    };

    // Should not throw.
    expect(() => rerender({ selectedLift: 'bench' })).not.toThrow();
  });
});
