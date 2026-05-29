import { useDb } from '@/data/DbProvider';
import { migrateStorageUnit } from '@/data/accessors/migrateStorageUnit';
import { resetEverything } from '@/data/accessors/reset';
import { rollbackLift } from '@/data/accessors/rollbackLift';
import { TM_KEY } from '@/data/queries/useLatestTm';
import { PRS_KEY } from '@/data/queries/usePrs';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import type { Lift, Unit } from '@/domain/types';
import { goTo } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

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
  };
}
