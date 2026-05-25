import { useDb } from '@/data/DbProvider';
import { cancelSession, resetSession } from '@/data/accessors/session';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { clearRestSnapshot } from '../sessionRuntime';
import { useCancelConfirm } from './useCancelConfirm';

/**
 * Today-screen cancel + restart actions for an in-progress session.
 *
 * Moved here (loop-004, Discord 1508386540) when Cancel + Restart pills
 * were lifted out of the Live screen top bar onto Today. Live now shows
 * only contextual recovery (Undo during rest); destructive actions live
 * at the entry-point screen.
 *
 * Surface contract — three modeless interactions:
 *   - `onRequestCancel()`  → opens the cancel-confirm sheet.
 *   - `onConfirmCancelFirstTap()` / `onConfirmCancelSecondTap()` — two-tap arm.
 *   - `onDismissCancelSheet()` — close + disarm.
 *   - Same trio for reset.
 *
 * On success of either destroy, invalidates the same query keys the Live
 * screen's destroy paths invalidate, so the Today screen rerenders with
 * `mode === 'preview'` (no active session). The caller stays on Today —
 * no navigation here.
 */
export type UseTodaySessionActionsResult = {
  cancelOpen: boolean;
  cancelArmed: boolean;
  onRequestCancel: () => void;
  onConfirmCancelFirstTap: () => void;
  onConfirmCancelSecondTap: () => Promise<void>;
  onDismissCancelSheet: () => void;

  resetOpen: boolean;
  resetArmed: boolean;
  onRequestReset: () => void;
  onConfirmResetFirstTap: () => void;
  onConfirmResetSecondTap: () => Promise<void>;
  onDismissResetSheet: () => void;
};

function fireWarningHaptic() {
  try {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Best-effort.
  }
}

export function useTodaySessionActions(sessionId: number | null): UseTodaySessionActionsResult {
  const db = useDb();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const cancelConfirm = useCancelConfirm({ onArmHaptic: fireWarningHaptic });
  const resetConfirm = useCancelConfirm({ onArmHaptic: fireWarningHaptic });

  const invalidateSessionQueries = useCallback(() => {
    if (sessionId != null) {
      void queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      void queryClient.invalidateQueries({ queryKey: ['setLogsForSession', sessionId] });
    }
    void queryClient.invalidateQueries({ queryKey: ['activeSession'] });
    void queryClient.invalidateQueries({ queryKey: ['sessions'] });
  }, [queryClient, sessionId]);

  const onRequestCancel = useCallback(() => {
    cancelConfirm.disarm();
    setCancelOpen(true);
  }, [cancelConfirm]);

  const onConfirmCancelFirstTap = useCallback(() => {
    cancelConfirm.arm();
  }, [cancelConfirm]);

  const onConfirmCancelSecondTap = useCallback(async () => {
    if (sessionId == null) return;
    try {
      await cancelSession(db, sessionId);
      clearRestSnapshot(sessionId);
      invalidateSessionQueries();
    } catch (err) {
      console.error('useTodaySessionActions.onConfirmCancelSecondTap failed', err);
    } finally {
      cancelConfirm.disarm();
      setCancelOpen(false);
    }
  }, [cancelConfirm, db, invalidateSessionQueries, sessionId]);

  const onDismissCancelSheet = useCallback(() => {
    cancelConfirm.disarm();
    setCancelOpen(false);
  }, [cancelConfirm]);

  const onRequestReset = useCallback(() => {
    resetConfirm.disarm();
    setResetOpen(true);
  }, [resetConfirm]);

  const onConfirmResetFirstTap = useCallback(() => {
    resetConfirm.arm();
  }, [resetConfirm]);

  const onConfirmResetSecondTap = useCallback(async () => {
    if (sessionId == null) return;
    try {
      await resetSession(db, sessionId);
      clearRestSnapshot(sessionId);
      invalidateSessionQueries();
    } catch (err) {
      console.error('useTodaySessionActions.onConfirmResetSecondTap failed', err);
    } finally {
      resetConfirm.disarm();
      setResetOpen(false);
    }
  }, [db, invalidateSessionQueries, resetConfirm, sessionId]);

  const onDismissResetSheet = useCallback(() => {
    resetConfirm.disarm();
    setResetOpen(false);
  }, [resetConfirm]);

  return {
    cancelOpen,
    cancelArmed: cancelConfirm.armed,
    onRequestCancel,
    onConfirmCancelFirstTap,
    onConfirmCancelSecondTap,
    onDismissCancelSheet,

    resetOpen,
    resetArmed: resetConfirm.armed,
    onRequestReset,
    onConfirmResetFirstTap,
    onConfirmResetSecondTap,
    onDismissResetSheet,
  };
}
