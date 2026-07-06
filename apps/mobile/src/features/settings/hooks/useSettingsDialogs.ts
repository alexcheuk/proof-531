import { useDb } from '@/data/DbProvider';
import { BackupError, exportBackup, importBackup } from '@/data/accessors/backup';
import { migrateStorageUnit } from '@/data/accessors/migrateStorageUnit';
import { resetEverything } from '@/data/accessors/reset';
import { rollbackLift } from '@/data/accessors/rollbackLift';
import { ACTIVE_SESSION_KEY } from '@/data/queries/useActiveSession';
import { TM_KEY } from '@/data/queries/useLatestTm';
import { PRS_KEY } from '@/data/queries/usePrs';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import type { Lift, Unit } from '@/domain/types';
import { goTo } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Share } from 'react-native';
import type { RestoreResult } from '../components/RestoreBackupSheet';

export type UseSettingsDialogsResult = {
  // TM editor
  editingLift: Lift | null;
  openTmEditor: (lift: Lift) => void;
  closeTmEditor: () => void;
  // Unit migration
  pendingStorage: Unit | null;
  requestStorageMigration: (next: Unit) => void;
  cancelStorageMigration: () => void;
  confirmStorageMigration: () => Promise<void>;
  migrating: boolean;
  // Destructive reset
  confirmingReset: boolean;
  requestReset: () => void;
  cancelReset: () => void;
  confirmReset: () => Promise<void>;
  resetting: boolean;
  // Lift rollback
  rollbackOpen: boolean;
  openRollback: () => void;
  closeRollback: () => void;
  confirmRollback: (lift: Lift, n: number) => Promise<void>;
  rollingBack: boolean;
  // Backup export
  exportBackupNow: () => Promise<void>;
  exporting: boolean;
  // Backup restore
  restoreOpen: boolean;
  openRestore: () => void;
  closeRestore: () => void;
  confirmRestore: (json: string) => Promise<RestoreResult>;
  restoring: boolean;
};

export function useSettingsDialogs(currentStorageUnit: Unit): UseSettingsDialogsResult {
  const db = useDb();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editingLift, setEditingLift] = useState<Lift | null>(null);
  const [pendingStorage, setPendingStorage] = useState<Unit | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const openTmEditor = useCallback((lift: Lift) => setEditingLift(lift), []);
  const closeTmEditor = useCallback(() => setEditingLift(null), []);

  const requestStorageMigration = useCallback(
    (next: Unit) => {
      if (next !== currentStorageUnit) setPendingStorage(next);
    },
    [currentStorageUnit],
  );

  const cancelStorageMigration = useCallback(() => {
    if (!migrating) setPendingStorage(null);
  }, [migrating]);

  const confirmStorageMigration = useCallback(async () => {
    if (!pendingStorage || migrating) return;
    setMigrating(true);
    try {
      await migrateStorageUnit(db, pendingStorage);
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      await queryClient.invalidateQueries({ queryKey: TM_KEY });
      setPendingStorage(null);
    } catch (err) {
      console.error('migrateStorageUnit failed', err);
    } finally {
      setMigrating(false);
    }
  }, [db, migrating, pendingStorage, queryClient]);

  const requestReset = useCallback(() => setConfirmingReset(true), []);

  const cancelReset = useCallback(() => {
    if (!resetting) setConfirmingReset(false);
  }, [resetting]);

  const confirmReset = useCallback(async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await resetEverything(db);
      queryClient.clear();
      setConfirmingReset(false);
      goTo.onboarding(router);
    } catch (err) {
      console.error('resetEverything failed', err);
    } finally {
      setResetting(false);
    }
  }, [db, queryClient, resetting, router]);

  const openRollback = useCallback(() => setRollbackOpen(true), []);

  const closeRollback = useCallback(() => {
    if (!rollingBack) setRollbackOpen(false);
  }, [rollingBack]);

  const confirmRollback = useCallback(
    async (lift: Lift, n: number) => {
      if (rollingBack) return;
      setRollingBack(true);
      try {
        await rollbackLift(db, lift, n);
        await queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY });
        await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
        await queryClient.invalidateQueries({ queryKey: PRS_KEY });
        await queryClient.invalidateQueries({ queryKey: TM_KEY });
        await queryClient.invalidateQueries({ queryKey: ['liftProgress'] });
        await queryClient.invalidateQueries({ queryKey: ['rollback-count'] });
        setRollbackOpen(false);
      } catch (err) {
        console.error('rollbackLift failed', err);
      } finally {
        setRollingBack(false);
      }
    },
    [db, queryClient, rollingBack],
  );

  const exportBackupNow = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const json = await exportBackup(db);
      const result = await Share.share({ message: json, title: '531 backup' });
      if (result.action === Share.sharedAction) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('exportBackup failed', err);
    } finally {
      setExporting(false);
    }
  }, [db, exporting]);

  const openRestore = useCallback(() => setRestoreOpen(true), []);

  const closeRestore = useCallback(() => {
    if (!restoring) setRestoreOpen(false);
  }, [restoring]);

  const confirmRestore = useCallback(
    async (json: string): Promise<RestoreResult> => {
      if (restoring) return { ok: false, reason: 'wrong-shape' };
      setRestoring(true);
      try {
        await importBackup(db, json);
        queryClient.clear();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRestoreOpen(false);
        return { ok: true };
      } catch (err) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (err instanceof BackupError) {
          return { ok: false, reason: err.reason };
        }
        // A non-validation failure (DB write error) leaves the data intact via
        // the import's transaction rollback; surface it as a shape error.
        console.error('importBackup failed', err);
        return { ok: false, reason: 'wrong-shape' };
      } finally {
        setRestoring(false);
      }
    },
    [db, queryClient, restoring],
  );

  return {
    editingLift,
    openTmEditor,
    closeTmEditor,
    pendingStorage,
    requestStorageMigration,
    cancelStorageMigration,
    confirmStorageMigration,
    migrating,
    confirmingReset,
    requestReset,
    cancelReset,
    confirmReset,
    resetting,
    rollbackOpen,
    openRollback,
    closeRollback,
    confirmRollback,
    rollingBack,
    exportBackupNow,
    exporting,
    restoreOpen,
    openRestore,
    closeRestore,
    confirmRestore,
    restoring,
  };
}
