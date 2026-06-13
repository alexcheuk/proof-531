import type { Lift } from '@/domain/types';
import { act, renderHook } from '@testing-library/react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useLiftCarouselSync } from '../useLiftCarouselSync';

const SCREEN_WIDTH = 390;
const ENABLED: Lift[] = ['squat', 'bench', 'deadlift', 'press'];

function scrollEvent(x: number): NativeSyntheticEvent<NativeScrollEvent> {
  return {
    nativeEvent: { contentOffset: { x, y: 0 } },
  } as unknown as NativeSyntheticEvent<NativeScrollEvent>;
}

describe('useLiftCarouselSync  -  onMomentumScrollEnd', () => {
  it('dispatches setSelectedLift when scroll lands on a new page', () => {
    const setSelectedLift = jest.fn();
    const { result } = renderHook(() =>
      useLiftCarouselSync({
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
      useLiftCarouselSync({
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
      useLiftCarouselSync({
        selectedLift: 'squat',
        enabledLifts: ENABLED,
        screenWidth: SCREEN_WIDTH,
        setSelectedLift,
      }),
    );

    act(() => {
      result.current.onMomentumScrollEnd(scrollEvent(SCREEN_WIDTH * 1.5));
    });

    expect(setSelectedLift).toHaveBeenCalledWith('deadlift');
  });

  it('ignores scroll positions outside the enabled-lift range', () => {
    const setSelectedLift = jest.fn();
    const { result } = renderHook(() =>
      useLiftCarouselSync({
        selectedLift: 'squat',
        enabledLifts: ENABLED,
        screenWidth: SCREEN_WIDTH,
        setSelectedLift,
      }),
    );

    act(() => {
      result.current.onMomentumScrollEnd(scrollEvent(SCREEN_WIDTH * 99));
    });

    expect(setSelectedLift).not.toHaveBeenCalled();
  });
});

describe('useLiftCarouselSync  -  listRef effect', () => {
  it('returns a listRef the caller can attach to a FlatList', () => {
    const { result } = renderHook(() =>
      useLiftCarouselSync({
        selectedLift: 'squat',
        enabledLifts: ENABLED,
        screenWidth: SCREEN_WIDTH,
        setSelectedLift: jest.fn(),
      }),
    );
    expect(result.current.listRef).toBeDefined();
    expect(result.current.listRef.current).toBeNull();
  });

  it('skips scrollToIndex on the initial mount (FlatList.initialScrollIndex handles first paint)', () => {
    const scrollToIndex = jest.fn();
    const setSelectedLift = jest.fn();
    type Props = { selectedLift: Lift };
    const { result, rerender } = renderHook(
      ({ selectedLift }: Props) =>
        useLiftCarouselSync({
          selectedLift,
          enabledLifts: ENABLED,
          screenWidth: SCREEN_WIDTH,
          setSelectedLift,
        }),
      { initialProps: { selectedLift: 'bench' as Lift } },
    );

    (
      result.current.listRef as { current: { scrollToIndex: typeof scrollToIndex } | null }
    ).current = { scrollToIndex };
    // Re-render WITHOUT changing selectedLift to flush the now-attached
    // ref through the effect  -  this is the "first run with a non-null
    // ref" the hook now treats as the initial sync and SKIPS, matching
    // real-mount semantics (FlatList already positioned at the index).
    rerender({ selectedLift: 'bench' });

    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('calls scrollToIndex when selectedLift changes externally AFTER the initial sync', () => {
    const scrollToIndex = jest.fn();
    const setSelectedLift = jest.fn();
    type Props = { selectedLift: Lift };
    const { result, rerender } = renderHook(
      ({ selectedLift }: Props) =>
        useLiftCarouselSync({
          selectedLift,
          enabledLifts: ENABLED,
          screenWidth: SCREEN_WIDTH,
          setSelectedLift,
        }),
      { initialProps: { selectedLift: 'squat' as Lift } },
    );

    (
      result.current.listRef as { current: { scrollToIndex: typeof scrollToIndex } | null }
    ).current = { scrollToIndex };
    // Burn the initial-sync skip with a same-value rerender, then change
    // for real and assert the animated scroll fires.
    rerender({ selectedLift: 'squat' });
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
        useLiftCarouselSync({
          selectedLift,
          enabledLifts: ENABLED,
          screenWidth: SCREEN_WIDTH,
          setSelectedLift: jest.fn(),
        }),
      { initialProps: { selectedLift: 'squat' as Lift } },
    );

    (
      result.current.listRef as { current: { scrollToIndex: typeof scrollToIndex } | null }
    ).current = { scrollToIndex };
    // Skip the initial-mount sync, then trigger a real change that exercises
    // the catch path.
    rerender({ selectedLift: 'squat' });
    expect(() => rerender({ selectedLift: 'bench' })).not.toThrow();
  });
});
