import { act, renderHook } from '@testing-library/react-native';
import { usePrCelebrationSequence } from '../usePrCelebrationSequence';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('usePrCelebrationSequence', () => {
  it('stays idle until ready flips true', () => {
    const { result, rerender } = renderHook(
      ({ ready }: { ready: boolean }) => usePrCelebrationSequence({ hasComparison: true, ready }),
      { initialProps: { ready: false } },
    );
    expect(result.current.phase).toBe('idle');
    rerender({ ready: true });
    expect(result.current.phase).toBe('title-type');
  });

  it('full chain with comparison: title → hold → settle → prev → hold → tick → settle → final', () => {
    const { result } = renderHook(() =>
      usePrCelebrationSequence({ hasComparison: true, ready: true }),
    );
    expect(result.current.phase).toBe('title-type');

    // External (typewriter) callback advances to hold
    act(() => result.current.onTitleTyped());
    expect(result.current.phase).toBe('title-hold');

    // Internal timer → settle
    act(() => {
      jest.advanceTimersByTime(450);
    });
    expect(result.current.phase).toBe('title-settle');

    // Internal timer → prev-type (because hasComparison)
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.phase).toBe('prev-type');

    // External (typewriter) callback advances to prev-hold
    act(() => result.current.onPrevTyped());
    expect(result.current.phase).toBe('prev-hold');

    // Internal timer → tick-up
    act(() => {
      jest.advanceTimersByTime(350);
    });
    expect(result.current.phase).toBe('tick-up');

    // External (count-up) callback advances to numbers-settle
    act(() => result.current.onTickComplete());
    expect(result.current.phase).toBe('numbers-settle');

    // Internal timer → final
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.phase).toBe('final');
  });

  it('skips prev/tick/numbers-settle when hasComparison is false (first PR for the lift)', () => {
    const { result } = renderHook(() =>
      usePrCelebrationSequence({ hasComparison: false, ready: true }),
    );
    act(() => result.current.onTitleTyped());
    act(() => {
      jest.advanceTimersByTime(450);
    });
    expect(result.current.phase).toBe('title-settle');
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.phase).toBe('final');
  });

  it('ignores onPrevTyped / onTickComplete fired from the wrong phase', () => {
    const { result } = renderHook(() =>
      usePrCelebrationSequence({ hasComparison: true, ready: true }),
    );
    expect(result.current.phase).toBe('title-type');
    act(() => result.current.onPrevTyped());
    expect(result.current.phase).toBe('title-type');
    act(() => result.current.onTickComplete());
    expect(result.current.phase).toBe('title-type');
  });
});
