import { type UseLogSheetStateResult, useLogSheetState } from './useLogSheetState';

/**
 * TmTestLogSheet state container.
 *
 * Thin wrapper around `useLogSheetState`  -  seeds at 0 so the count is always
 * a deliberate input (a pre-filled rep count would pre-populate the PASS chip
 * and read as editorial pressure, which the spec rejects). Resets reps +
 * pending whenever `open` flips to true.
 */
export type UseTmTestLogStateOptions = {
  open: boolean;
  onSave: (reps: number) => void | Promise<void>;
  onCancel: () => void;
};

export type UseTmTestLogStateResult = UseLogSheetStateResult;

export function useTmTestLogState({
  open,
  onSave,
  onCancel,
}: UseTmTestLogStateOptions): UseTmTestLogStateResult {
  return useLogSheetState({ open, initialReps: 0, onSave, onCancel });
}
