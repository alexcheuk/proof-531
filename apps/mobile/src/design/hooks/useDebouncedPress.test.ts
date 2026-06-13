import { act, renderHook } from '@testing-library/react-native';
import { useDebouncedPress } from './useDebouncedPress';

describe('useDebouncedPress', () => {
  it('fires the handler once per debounce window', () => {
    jest.useFakeTimers();
    try {
      const handler = jest.fn();
      const { result } = renderHook(() => useDebouncedPress(handler));
      act(() => {
        result.current();
        result.current();
        result.current();
      });
      expect(handler).toHaveBeenCalledTimes(1);
      // After the window elapses, the next press fires again.
      act(() => {
        jest.advanceTimersByTime(700);
      });
      act(() => {
        result.current();
      });
      expect(handler).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not invoke the handler when disabled', () => {
    const handler = jest.fn();
    const { result } = renderHook(() => useDebouncedPress(handler, { disabled: true }));
    act(() => {
      result.current();
      result.current();
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('resets the gate synchronously when the handler identity swaps', () => {
    jest.useFakeTimers();
    try {
      const first = jest.fn();
      const second = jest.fn();
      const { result, rerender } = renderHook(
        (props: { h: () => void }) => useDebouncedPress(props.h),
        { initialProps: { h: first as () => void } },
      );
      act(() => {
        result.current();
      });
      expect(first).toHaveBeenCalledTimes(1);
      // Re-render with a different handler  -  gate should reset immediately,
      // even though the debounce timeout hasn't elapsed.
      rerender({ h: second as () => void });
      act(() => {
        result.current();
      });
      expect(second).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });
});
