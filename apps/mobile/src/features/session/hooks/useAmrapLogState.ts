import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * AmrapLogSheet state container.
 *
 * Pulls the rep/pending state + mounted-ref + save/cancel handlers out of
 * the sheet component so the sheet body is pure presentation. The hook also
 * resets `reps` and `pending` whenever `open` flips to true — without this
 * reset, a previous error path (parent's `onSave` rejected) would leave
 * `pending` stuck true the next time the sheet opens, and `reps` would
 * carry over from the user's last attempt.
 */
export type UseAmrapLogStateOptions = {
  /** Sheet open flag — used to reset reps/pending on each open. */
  open: boolean;
  /** Prescribed reps for this AMRAP set — also the seed value for `reps`. */
  prescribedReps: number;
  /** Save handler from the parent. May be sync or async. */
  onSave: (reps: number) => void | Promise<void>;
  /** Cancel handler from the parent. */
  onCancel: () => void;
};

export type UseAmrapLogStateResult = {
  /** Current rep count (committed by the user via the stepper). */
  reps: number;
  setReps: (next: number) => void;
  /** True while `onSave` is in flight — block both buttons. */
  pending: boolean;
  /** Saves the current rep count; awaits async parents and clears pending on reject. */
  handleSave: () => Promise<void>;
  /** Forwards to onCancel unless a save is in flight. */
  handleCancel: () => void;
};

export function useAmrapLogState({
  open,
  prescribedReps,
  onSave,
  onCancel,
}: UseAmrapLogStateOptions): UseAmrapLogStateResult {
  const [reps, setReps] = useState<number>(prescribedReps);
  const [pending, setPending] = useState(false);

  // Guard against setState on an unmounted parent (happy path: parent unmounts
  // the sheet after onSave resolves).
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
      setReps(prescribedReps);
    }
  }, [open, prescribedReps]);

  const handleSave = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      await Promise.resolve(onSave(reps));
    } catch (err) {
      console.error('useAmrapLogState.handleSave failed', err);
      if (mountedRef.current) setPending(false);
    }
  }, [onSave, pending, reps]);

  const handleCancel = useCallback(() => {
    if (pending) return;
    onCancel();
  }, [onCancel, pending]);

  return { reps, setReps, pending, handleSave, handleCancel };
}
