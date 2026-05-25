import { act, renderHook } from '@testing-library/react-native';
import { useElapsedSeconds } from '../useElapsedSeconds';

describe('useElapsedSeconds', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns 0 when startedAt is null', () => {
    const { result } = renderHook(() => useElapsedSeconds(null));
    expect(result.current).toBe(0);
  });

  it('returns the floor of seconds elapsed since startedAt', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    const { result } = renderHook(() => useElapsedSeconds(now - 5500));
    expect(result.current).toBe(5);
  });

  it('ticks once per second', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    const { result } = renderHook(() => useElapsedSeconds(now));

    // `advanceTimersByTime` moves the fake clock forward, so the interval
    // callback's `Date.now()` reads (now + N) after each tick.
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current).toBe(3);
  });
});
