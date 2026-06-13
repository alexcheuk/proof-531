import { type UseLogSheetStateResult, useLogSheetState } from './useLogSheetState';

/**
 * AmrapLogSheet state container.
 *
 * Thin wrapper around `useLogSheetState`  -  seeds at `prescribedReps` so the
 * user can save immediately if they hit the floor. Resets reps + pending
 * whenever `open` flips to true so a previous error path doesn't bleed into
 * the next attempt.
 */
export type UseAmrapLogStateOptions = {
  open: boolean;
  prescribedReps: number;
  onSave: (reps: number) => void | Promise<void>;
  onCancel: () => void;
};

export type UseAmrapLogStateResult = UseLogSheetStateResult;

export function useAmrapLogState({
  open,
  prescribedReps,
  onSave,
  onCancel,
}: UseAmrapLogStateOptions): UseAmrapLogStateResult {
  return useLogSheetState({ open, initialReps: prescribedReps, onSave, onCancel });
}
