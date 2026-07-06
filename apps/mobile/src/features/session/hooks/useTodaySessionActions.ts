import { useDb } from '@/data/DbProvider';
import { resetSession } from '@/data/accessors/session';
import { ACTIVE_SESSION_KEY } from '@/data/queries/useActiveSession';
import { SESSION_KEY } from '@/data/queries/useSession';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import { SET_LOGS_FOR_SESSION_KEY } from '@/data/queries/useSetLogsForSession';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { clearRestSnapshot } from '../sessionRuntime';
import { useCancelConfirm } from './useCancelConfirm';

export type UseTodaySessionActionsResult = {
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
  const [resetOpen, setResetOpen] = useState(false);
  const resetConfirm = useCancelConfirm({ onArmHaptic: fireWarningHaptic });

  const invalidateSessionQueries = useCallback(() => {
    if (sessionId != null) {
      void queryClient.invalidateQueries({ queryKey: SESSION_KEY(sessionId) });
      void queryClient.invalidateQueries({ queryKey: SET_LOGS_FOR_SESSION_KEY(sessionId) });
    }
    void queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY });
    void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
  }, [queryClient, sessionId]);

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
    resetOpen,
    resetArmed: resetConfirm.armed,
    onRequestReset,
    onConfirmResetFirstTap,
    onConfirmResetSecondTap,
    onDismissResetSheet,
  };
}
