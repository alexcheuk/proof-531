import { act, renderHook } from '@testing-library/react-native';
import { formatElapsedClock, useElapsedSeconds } from '../useElapsedSeconds';

describe('formatElapsedClock', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatElapsedClock(0)).toBe('00:00');
  });

  it('formats minutes + seconds', () => {
    expect(formatElapsedClock(135)).toBe('02:15');
  });

  it('formats hours + minutes + seconds once past an hour', () => {
    expect(formatElapsedClock(3725)).toBe('1:02:05');
  });

  it('floors negative input to 0', () => {
    expect(formatElapsedClock(-30)).toBe('00:00');
  });
});

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
