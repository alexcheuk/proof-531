import { act, renderHook } from '@testing-library/react-native';
import { useCancelConfirm } from '../useCancelConfirm';

describe('useCancelConfirm', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts disarmed', () => {
    const { result } = renderHook(() => useCancelConfirm());
    expect(result.current.armed).toBe(false);
  });

  it('arm() flips armed=true and fires the haptic', () => {
    const haptic = jest.fn();
    const { result } = renderHook(() => useCancelConfirm({ onArmHaptic: haptic }));
    act(() => result.current.arm());
    expect(result.current.armed).toBe(true);
    expect(haptic).toHaveBeenCalledTimes(1);
  });

  it('auto-disarms after timeoutMs', () => {
    const { result } = renderHook(() => useCancelConfirm({ timeoutMs: 5000 }));
    act(() => result.current.arm());
    expect(result.current.armed).toBe(true);

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.armed).toBe(false);
  });

  it('disarm() clears the armed flag', () => {
    const { result } = renderHook(() => useCancelConfirm());
    act(() => result.current.arm());
    act(() => result.current.disarm());
    expect(result.current.armed).toBe(false);
  });

  it('attemptDestroy arms on first call, runs fn on second', async () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useCancelConfirm());

    await act(async () => {
      await result.current.attemptDestroy(fn);
    });
    expect(fn).not.toHaveBeenCalled();
    expect(result.current.armed).toBe(true);

    await act(async () => {
      await result.current.attemptDestroy(fn);
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('attemptDestroy awaits async fn', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCancelConfirm());

    act(() => result.current.arm());

    await act(async () => {
      await result.current.attemptDestroy(fn);
    });
    expect(fn).toHaveBeenCalled();
  });

  it('resets the timeout when re-armed before expiry', () => {
    const { result } = renderHook(() => useCancelConfirm({ timeoutMs: 5000 }));
    act(() => result.current.arm());
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.armed).toBe(true);
    // re-arm to reset the latch
    act(() => result.current.disarm());
    act(() => result.current.arm());
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    // We're 6000ms past the original arm but only 3000ms past the latest;
    // still armed.
    expect(result.current.armed).toBe(true);
  });
});
