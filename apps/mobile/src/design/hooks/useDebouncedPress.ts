import { useCallback, useEffect, useRef } from 'react';

/**
 * Default debounce window. Sized to comfortably swallow a finger rebound
 * (<150ms) and the typical roundtrip of a single set-log DB write (~50–150ms
 * on expo-sqlite) without feeling unresponsive to deliberate retaps.
 */
export const DEFAULT_PRESS_DEBOUNCE_MS = 600;

type Options = {
  /** Override the debounce window. */
  debounceMs?: number;
  /** When true, the handler is never invoked and the gate stays open. */
  disabled?: boolean;
};

/**
 * Wrap a press handler with a debounce that swallows accidental rapid retaps
 * without sacrificing legitimate intent. Two layers:
 *
 *   1. **Time gate**  -  a second press within `debounceMs` of the previous
 *      one is dropped. Uses `setTimeout` (not `Date.now()`) so jest fake
 *      timers can advance the window in tests.
 *
 *   2. **Identity-swap reset**  -  when `handler` swaps identity (a CTA
 *      position flipping copy between phases, or one Pressable rendering
 *      different rows of a list), the gate resets synchronously in the
 *      render body so the legitimate follow-up press isn't swallowed.
 *
 * Critical for CTAs that fan out to async DB writes (Set complete, Log
 * AMRAP, tappable list rows). Without it, a fast double-tap races the
 * underlying mutation.
 */
export function useDebouncedPress(handler: () => void, options: Options = {}): () => void {
  const { debounceMs = DEFAULT_PRESS_DEBOUNCE_MS, disabled = false } = options;
  const inFlightRef = useRef(false);
  const lastHandlerRef = useRef(handler);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronously reset the gate when the handler swaps identity. Done in
  // the render body (not useEffect) so a press queued in the same event-loop
  // pass as the re-render sees the reset before useEffect has run.
  if (lastHandlerRef.current !== handler) {
    lastHandlerRef.current = handler;
    inFlightRef.current = false;
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(
    () => () => {
      mountedRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    },
    [],
  );

  return useCallback(() => {
    if (disabled) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) inFlightRef.current = false;
      timeoutRef.current = null;
    }, debounceMs);
    if (mountedRef.current) handler();
  }, [debounceMs, disabled, handler]);
}
