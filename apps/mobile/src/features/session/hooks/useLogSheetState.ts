import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Shared state container for bottom-sheet rep loggers (AMRAP, TM Test).
 *
 * Both log sheets share the same state shape:
 *   - `reps` and `pending` reset whenever `open` flips to true.
 *   - `handleSave` awaits async parents, clears pending on both success and
 *     failure, guards against setState on an unmounted parent.
 *   - `handleCancel` is a no-op while pending or when the sheet is already
 *     closed (gorhom fires dismiss on auto-close after a successful save —
 *     without this guard the just-set phase is overwritten).
 *
 * The only per-sheet difference is `initialReps`:
 *   - AMRAP seeds at `prescribedReps` so the user can save immediately.
 *   - TM Test seeds at 0 to require deliberate entry.
 */
export type UseLogSheetStateOptions = {
  open: boolean;
  /** Starting rep count. Restored to this value whenever `open` flips to true. */
  initialReps: number;
  onSave: (reps: number) => void | Promise<void>;
  onCancel: () => void;
};

export type UseLogSheetStateResult = {
  reps: number;
  setReps: (next: number) => void;
  pending: boolean;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
};

export function useLogSheetState({
  open,
  initialReps,
  onSave,
  onCancel,
}: UseLogSheetStateOptions): UseLogSheetStateResult {
  const [reps, setReps] = useState<number>(initialReps);
  const [pending, setPending] = useState(false);

  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  useEffect(() => {
    if (open) {
      setPending(false);
      setReps(initialReps);
    }
  }, [open, initialReps]);

  const handleSave = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      await Promise.resolve(onSave(reps));
    } catch (err) {
      console.error('useLogSheetState.handleSave failed', err);
    } finally {
      if (mountedRef.current) setPending(false);
    }
  }, [onSave, pending, reps]);

  const handleCancel = useCallback(() => {
    if (pending) return;
    if (!open) return;
    onCancel();
  }, [onCancel, open, pending]);

  return { reps, setReps, pending, handleSave, handleCancel };
}
