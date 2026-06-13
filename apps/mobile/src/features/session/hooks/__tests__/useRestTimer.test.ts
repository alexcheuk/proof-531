import { act, renderHook } from '@testing-library/react-native';
import { useRestTimer } from '../useRestTimer';

describe('useRestTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('holds remaining at 0 while inactive, then seeds to `seconds` when active', () => {
    const { result } = renderHook(() =>
      useRestTimer({ active: false, seconds: 10, fireWarningHaptic: jest.fn() }),
    );
    expect(result.current.remaining).toBe(0);

    const { result: r2 } = renderHook(() =>
      useRestTimer({ active: true, seconds: 10, fireWarningHaptic: jest.fn() }),
    );
    expect(r2.current.remaining).toBe(10);
  });

  it('decrements by 1 per second', () => {
    const { result } = renderHook(() =>
      useRestTimer({ active: true, seconds: 5, fireWarningHaptic: jest.fn() }),
    );
    expect(result.current.remaining).toBe(5);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.remaining).toBe(3);
  });

  it('fires the warning haptic exactly once when remaining hits threshold', () => {
    const haptic = jest.fn();
    const { result } = renderHook(() =>
      useRestTimer({
        active: true,
        seconds: 5,
        warningThresholdSeconds: 2,
        fireWarningHaptic: haptic,
      }),
    );

    act(() => {
      jest.advanceTimersByTime(3000); // 5 → 2
    });

    expect(result.current.remaining).toBe(2);
    expect(haptic).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(2000); // keep ticking past
    });
    expect(haptic).toHaveBeenCalledTimes(1);
  });

  it('addTime extends countdown by 30s', () => {
    const { result } = renderHook(() =>
      useRestTimer({ active: true, seconds: 10, fireWarningHaptic: jest.fn() }),
    );

    act(() => {
      result.current.addTime();
    });

    expect(result.current.remaining).toBe(40);
  });

  it('subtractTime floors at 1', () => {
    const { result } = renderHook(() =>
      useRestTimer({ active: true, seconds: 10, fireWarningHaptic: jest.fn() }),
    );

    act(() => {
      result.current.subtractTime();
    });

    expect(result.current.remaining).toBe(1);
  });

  it('re-arms warning haptic when addTime pushes past threshold', () => {
    const haptic = jest.fn();
    const { result } = renderHook(() =>
      useRestTimer({
        active: true,
        seconds: 5,
        warningThresholdSeconds: 2,
        fireWarningHaptic: haptic,
      }),
    );

    act(() => {
      jest.advanceTimersByTime(3000); // remaining=2 → first warning
    });
    expect(haptic).toHaveBeenCalledTimes(1);

    // User taps +30s after hearing the warning — extends rest to 32s.
    // The latch must re-arm so the second pass through T-2s fires again.
    act(() => {
      result.current.addTime();
    });
    act(() => {
      jest.advanceTimersByTime(30000); // 32 → 2
    });
    expect(haptic).toHaveBeenCalledTimes(2);
  });

  it('subtractTime resets the warning latch when remaining stays above threshold', () => {
    const haptic = jest.fn();
    const { result } = renderHook(() =>
      useRestTimer({
        active: true,
        seconds: 60,
        warningThresholdSeconds: 2,
        fireWarningHaptic: haptic,
      }),
    );

    act(() => {
      result.current.subtractTime(); // 60 → 30 (above threshold, latch reset)
    });

    act(() => {
      jest.advanceTimersByTime(28000); // 30 → 2 → fires haptic
    });
    expect(haptic).toHaveBeenCalledTimes(1);
  });

  it('addTime and subtractTime are no-ops when inactive', () => {
    const { result } = renderHook(() =>
      useRestTimer({ active: false, seconds: 10, fireWarningHaptic: jest.fn() }),
    );
    act(() => {
      result.current.addTime();
      result.current.subtractTime();
    });
    expect(result.current.remaining).toBe(0);
  });

  it('tracks wall-clock time, not tick count, when the JS clock jumps ahead', () => {
    // Reproduces the Android background bug: while the app is backgrounded the
    // JS thread (and thus setInterval) is suspended, but real time keeps
    // passing. On the next tick the timer must reflect *elapsed wall-clock
    // time*, not the number of intervals that happened to fire. A tick-count
    // timer would read 9 here (one decrement); a wall-clock timer reads ~2.
    const { result } = renderHook(() =>
      useRestTimer({ active: true, seconds: 10, fireWarningHaptic: jest.fn() }),
    );
    expect(result.current.remaining).toBe(10);

    act(() => {
      jest.setSystemTime(Date.now() + 7000); // 7s passed while backgrounded
      jest.advanceTimersByTime(1000); // one tick after returning to foreground (8s total)
    });

    expect(result.current.remaining).toBe(2);
  });

  it('fires the done haptic when rest elapsed entirely while the clock was frozen', () => {
    const done = jest.fn();
    const { result } = renderHook(() =>
      useRestTimer({
        active: true,
        seconds: 5,
        fireWarningHaptic: jest.fn(),
        fireDoneHaptic: done,
      }),
    );
    expect(result.current.remaining).toBe(5);

    act(() => {
      jest.setSystemTime(Date.now() + 9000); // rest fully elapsed in background
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.remaining).toBeLessThanOrEqual(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('precise alarm fires done haptic at the deadline (not on the next interval tick)', () => {
    const done = jest.fn();
    renderHook(() =>
      useRestTimer({
        active: true,
        seconds: 5,
        fireWarningHaptic: jest.fn(),
        fireDoneHaptic: done,
      }),
    );
    // Advance exactly to the deadline — the precise setTimeout should fire.
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('done haptic fires exactly once even when both precise alarm and interval fire at expiry', () => {
    const done = jest.fn();
    renderHook(() =>
      useRestTimer({
        active: true,
        seconds: 5,
        fireWarningHaptic: jest.fn(),
        fireDoneHaptic: done,
      }),
    );
    act(() => {
      jest.advanceTimersByTime(5000); // fires both the precise alarm AND the 5s interval tick
    });
    act(() => {
      jest.advanceTimersByTime(2000); // additional ticks
    });
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('re-arms precise alarm after addTime extends the deadline', () => {
    const done = jest.fn();
    const { result } = renderHook(() =>
      useRestTimer({
        active: true,
        seconds: 5,
        fireWarningHaptic: jest.fn(),
        fireDoneHaptic: done,
      }),
    );
    act(() => jest.advanceTimersByTime(3000)); // 2s remaining
    expect(done).not.toHaveBeenCalled();

    act(() => result.current.addTime()); // extends to ~32s

    // Old deadline (5000ms total) would have fired — verify it was cancelled.
    act(() => jest.advanceTimersByTime(2100)); // would be past old deadline
    expect(done).not.toHaveBeenCalled();

    // New deadline fires ~30s later.
    act(() => jest.advanceTimersByTime(30000));
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('clears the precise alarm when active becomes false', () => {
    const done = jest.fn();
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) =>
        useRestTimer({ active, seconds: 5, fireWarningHaptic: jest.fn(), fireDoneHaptic: done }),
      { initialProps: { active: true } },
    );
    // Deactivate before deadline
    rerender({ active: false });
    act(() => jest.advanceTimersByTime(6000));
    expect(done).not.toHaveBeenCalled();
  });
});
