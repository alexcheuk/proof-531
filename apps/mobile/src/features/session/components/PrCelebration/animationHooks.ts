import { useEffect, useRef, useState } from 'react';

/**
 * Animation hooks used by the PR-celebration intro sequence.
 *
 * Both hooks are JS-side (setInterval-driven) rather than Reanimated-driven
 * because the values they produce — a growing substring and a counting
 * integer — need to drive `<Text>` content, not transform styles. Reanimated
 * shared values can't be rendered into Text without `useAnimatedProps`,
 * which adds plumbing for no real win here (~16ms tick rate is enough for
 * 600–1200ms transitions at a glance).
 */

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

/**
 * Returns the typed-so-far prefix of `text`. While `active === false` the
 * displayed text resets to empty so the next activation always starts at 0.
 *
 * Caller is responsible for unmounting / flipping `active` to false when the
 * sequence advances — the hook will then clear its interval.
 */
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

/**
 * Reactive typewriter that backspaces then retypes whenever `text` changes.
 *
 * Behaviour: each tick compares the currently-shown string to `text` and
 * either deletes one trailing character (when the shown string still has
 * characters past the longest common prefix) or appends the next character
 * from `text`. The two-state machine — backspace, then forward — happens
 * inside a single setInterval so a target change mid-flight cleanly
 * switches directions without stranding characters.
 *
 * Initial value of `shown` is `text` itself, so the first render of a
 * stable target is a no-op. The interval clears itself once `shown === text`.
 */
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

/**
 * Ease-in-out cubic interpolation from `from` → `to` over `durationMs`,
 * ticking every ~16ms. The hook always renders an integer (rounded each
 * tick) since its only caller renders weight values.
 *
 * Ease-in-out is the right curve for a "counter winds up then settles":
 * pure ease-out felt like the number darted away from the prior value
 * and crawled to the new one — visually too front-loaded. Ease-in-out
 * gives a deliberate ramp on both ends, which reads as "this is the
 * number changing", not "this is the number arriving".
 *
 * `from === to` (no actual delta to animate) is a single-tick no-op that
 * fires `onComplete` immediately so the sequence doesn't stall.
 */
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
