import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * TmTestLogSheet state container — sibling to `useAmrapLogState`.
 *
 * The only structural difference vs the AMRAP variant is the seed value:
 * AMRAP seeds at the prescribed reps so the user can save immediately if
 * they hit the floor; the TM test seeds at **0** so the count is always a
 * deliberate input (spec Q4 resolution). A pre-filled "5" would also
 * pre-populate the PASS chip and read as editorial pressure, which the
 * brief explicitly rejects.
 *
 * Resets reps + pending whenever `open` flips to true so an error path on a
 * previous attempt does not bleed into the next session.
 */
export type UseTmTestLogStateOptions = {
  open: boolean;
  onSave: (reps: number) => void | Promise<void>;
  onCancel: () => void;
};

export type UseTmTestLogStateResult = {
  reps: number;
  setReps: (next: number) => void;
  pending: boolean;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
};

export function useTmTestLogState({
  open,
  onSave,
  onCancel,
}: UseTmTestLogStateOptions): UseTmTestLogStateResult {
  const [reps, setReps] = useState<number>(0);
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
      setReps(0);
    }
  }, [open]);

  const handleSave = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      await Promise.resolve(onSave(reps));
    } catch (err) {
      console.error('useTmTestLogState.handleSave failed', err);
    } finally {
      if (mountedRef.current) setPending(false);
    }
  }, [onSave, pending, reps]);

  const handleCancel = useCallback(() => {
    if (pending) return;
    // Mirrors the AMRAP guard: gorhom fires dismiss on auto-close after a
    // successful save (parent flips `open` → false). Without this check the
    // dismiss would clobber the just-set phase.
    if (!open) return;
    onCancel();
  }, [onCancel, open, pending]);

  return { reps, setReps, pending, handleSave, handleCancel };
}
