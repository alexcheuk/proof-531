import { useEffect, useRef, useState } from 'react';

// JS-side (setInterval) rather than Reanimated: these values drive <Text> content, not transform
// styles. Reanimated shared values can't feed Text without useAnimatedProps — extra plumbing for
// no gain at ~16ms tick rate.

export type UseTypewriterOptions = {
  /** The full string to type out. */
  text: string;
  /** Milliseconds per character. Defaults to 40. */
  charMs?: number;
  /** When false the hook stays empty and timers stay paused. */
  active: boolean;
  /** Fires once the last character has been written. */
  onComplete?: () => void;
};

export function useTypewriter({
  text,
  charMs = 40,
  active,
  onComplete,
}: UseTypewriterOptions): string {
  const [shown, setShown] = useState('');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setShown('');
      return;
    }
    if (text.length === 0) {
      onCompleteRef.current?.();
      return;
    }
    let i = 0;
    setShown('');
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        onCompleteRef.current?.();
      }
    }, charMs);
    return () => clearInterval(id);
  }, [active, text, charMs]);

  return shown;
}

export type UseTypewriterTransitionOptions = {
  /** Target string the displayed text should converge to. */
  text: string;
  /** Milliseconds per backspace / type tick. Defaults to 45. */
  charMs?: number;
  /** When false the hook freezes at its last shown value (no further ticks). */
  active: boolean;
};

export function useTypewriterTransition({
  text,
  charMs = 45,
  active,
}: UseTypewriterTransitionOptions): string {
  // Start empty so the first activation types in from "" → text rather
  // than appearing instantly. Subsequent target changes (e.g. PREVIOUS
  // BEST → NEW ESTIMATED 1RM) do their backspace-and-retype as usual.
  const [shown, setShown] = useState('');

  // Reset to empty while inactive. Two reasons:
  //   1. Replay correctness — without this, a settled value from a
  //      prior run (e.g. "NEW ESTIMATED 1RM") would survive the
  //      sequence reset and cause the next activation to animate
  //      backwards to the new target.
  //   2. Consistent type-in feel — every activation starts from a
  //      clean slate and types forward.
  useEffect(() => {
    if (!active) setShown('');
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setShown((current) => {
        if (current === text) {
          clearInterval(id);
          return current;
        }
        // Longest common prefix between current and target.
        let commonLen = 0;
        const maxLen = Math.min(current.length, text.length);
        while (commonLen < maxLen && current[commonLen] === text[commonLen]) {
          commonLen += 1;
        }
        // Backspace down to the common prefix, then type forward.
        if (current.length > commonLen) {
          return current.slice(0, current.length - 1);
        }
        return text.slice(0, current.length + 1);
      });
    }, charMs);
    return () => clearInterval(id);
  }, [text, charMs, active]);

  return shown;
}

export type UseCountUpOptions = {
  from: number;
  to: number;
  /** Total animation duration in ms. */
  durationMs: number;
  /** When false the value snaps to `from` and timers stay paused. */
  active: boolean;
  /** Fires once the value reaches `to`. */
  onComplete?: () => void;
};

// Ease-in-out cubic: pure ease-out felt front-loaded (darted away, crawled to the new value).
// Ease-in-out gives a deliberate ramp on both ends — reads as "number changing" not "arriving".
export function useCountUp({
  from,
  to,
  durationMs,
  active,
  onComplete,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(from);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setValue(from);
      return;
    }
    if (from === to || durationMs <= 0) {
      setValue(to);
      onCompleteRef.current?.();
      return;
    }
    const start = Date.now();
    setValue(from);
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / durationMs);
      // Ease-in-out cubic: slow start, faster middle, slow end.
      const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      setValue(Math.round(from + (to - from) * eased));
      if (t >= 1) {
        clearInterval(id);
        onCompleteRef.current?.();
      }
    }, 16);
    return () => clearInterval(id);
  }, [active, from, to, durationMs]);

  return value;
}
