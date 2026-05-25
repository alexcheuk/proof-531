import { act, renderHook } from '@testing-library/react-native';
import { useCountUp, useTypewriter, useTypewriterTransition } from '../animationHooks';

describe('useTypewriter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns empty while inactive', () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: 'HELLO', charMs: 10, active: false }),
    );
    expect(result.current).toBe('');
  });

  it('reveals one character per tick', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'ABCD', charMs: 10, active: true }));
    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(result.current).toBe('A');
    act(() => {
      jest.advanceTimersByTime(20);
    });
    expect(result.current).toBe('ABC');
    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(result.current).toBe('ABCD');
  });

  it('fires onComplete after the last character', () => {
    const onComplete = jest.fn();
    renderHook(() => useTypewriter({ text: 'AB', charMs: 10, active: true, onComplete }));
    act(() => {
      jest.advanceTimersByTime(20);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('fires onComplete immediately on empty text', () => {
    const onComplete = jest.fn();
    renderHook(() => useTypewriter({ text: '', charMs: 10, active: true, onComplete }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('resets to empty when active flips back to false', () => {
    const { result, rerender } = renderHook(
      ({ active }: { active: boolean }) => useTypewriter({ text: 'ABC', charMs: 10, active }),
      { initialProps: { active: true } },
    );
    act(() => {
      jest.advanceTimersByTime(30);
    });
    expect(result.current).toBe('ABC');
    rerender({ active: false });
    expect(result.current).toBe('');
  });
});

describe('useTypewriterTransition', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts empty and types forward to the initial target on activation', () => {
    const { result } = renderHook(() =>
      useTypewriterTransition({ text: 'ABC', charMs: 10, active: true }),
    );
    expect(result.current).toBe('');
    act(() => jest.advanceTimersByTime(10));
    expect(result.current).toBe('A');
    act(() => jest.advanceTimersByTime(20));
    expect(result.current).toBe('ABC');
  });

  it('clears shown when active flips to false', () => {
    const { result, rerender } = renderHook(
      ({ active }: { active: boolean }) =>
        useTypewriterTransition({ text: 'ABC', charMs: 10, active }),
      { initialProps: { active: true } },
    );
    act(() => jest.advanceTimersByTime(50));
    expect(result.current).toBe('ABC');
    rerender({ active: false });
    expect(result.current).toBe('');
  });

  it('backspaces then retypes when target changes mid-flight (no common prefix)', () => {
    const { result, rerender } = renderHook(
      ({ text }: { text: string }) => useTypewriterTransition({ text, charMs: 10, active: true }),
      { initialProps: { text: 'ABC' } },
    );
    // Settle on the initial target first
    act(() => jest.advanceTimersByTime(50));
    expect(result.current).toBe('ABC');
    rerender({ text: 'XYZ' });
    // Three backspaces remove ABC → "AB" → "A" → ""
    act(() => jest.advanceTimersByTime(30));
    expect(result.current).toBe('');
    // Three forward ticks build "X" → "XY" → "XYZ"
    act(() => jest.advanceTimersByTime(30));
    expect(result.current).toBe('XYZ');
  });

  it('only backspaces past the longest common prefix', () => {
    const { result, rerender } = renderHook(
      ({ text }: { text: string }) => useTypewriterTransition({ text, charMs: 10, active: true }),
      { initialProps: { text: 'ABCDEF' } },
    );
    // Settle on the initial target first
    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('ABCDEF');
    rerender({ text: 'ABCXYZ' });
    // Backspace from 'ABCDEF' → 'ABCDE' → 'ABCD' → 'ABC' (stop at common prefix)
    act(() => jest.advanceTimersByTime(30));
    expect(result.current).toBe('ABC');
    // Type forward to 'ABCX' → 'ABCXY' → 'ABCXYZ'
    act(() => jest.advanceTimersByTime(30));
    expect(result.current).toBe('ABCXYZ');
  });

  it('stops ticking once target is reached', () => {
    const { result, rerender } = renderHook(
      ({ text }: { text: string }) => useTypewriterTransition({ text, charMs: 10, active: true }),
      { initialProps: { text: 'AB' } },
    );
    act(() => jest.advanceTimersByTime(30));
    expect(result.current).toBe('AB');
    rerender({ text: 'C' });
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('C');
    // Burning another full second after settle should not produce churn.
    act(() => jest.advanceTimersByTime(1000));
    expect(result.current).toBe('C');
  });
});

describe('useCountUp', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns `from` while inactive', () => {
    const { result } = renderHook(() =>
      useCountUp({ from: 100, to: 200, durationMs: 100, active: false }),
    );
    expect(result.current).toBe(100);
  });

  it('reaches `to` after duration', () => {
    const { result } = renderHook(() =>
      useCountUp({ from: 100, to: 200, durationMs: 100, active: true }),
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe(200);
  });

  it('fires onComplete when the count finishes', () => {
    const onComplete = jest.fn();
    renderHook(() => useCountUp({ from: 0, to: 10, durationMs: 50, active: true, onComplete }));
    // Tick rate is 16ms; advance past the duration to guarantee the
    // tick that crosses t === 1 lands inside the window.
    act(() => {
      jest.advanceTimersByTime(96);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('no-ops + completes immediately when from === to', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() =>
      useCountUp({ from: 42, to: 42, durationMs: 100, active: true, onComplete }),
    );
    expect(result.current).toBe(42);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('monotonically increases between ticks (ease-in-out)', () => {
    const samples: number[] = [];
    const { result } = renderHook(() =>
      useCountUp({ from: 0, to: 100, durationMs: 200, active: true }),
    );
    samples.push(result.current);
    for (let t = 0; t < 200; t += 32) {
      act(() => {
        jest.advanceTimersByTime(32);
      });
      samples.push(result.current);
    }
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1] as number);
    }
    expect(samples[samples.length - 1]).toBe(100);
  });
});
