import * as Updates from 'expo-updates';
import { useCallback } from 'react';

export type OtaStatus = {
  updateId: string | null;
  createdAt: Date | null;
  channel: string | null;
  runtimeVersion: string | null;
  isEmbeddedLaunch: boolean;
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  lastChecked: Date | null;
  checkError: string | null;
  downloadError: string | null;
  checkNow: () => Promise<void>;
  fetchNow: () => Promise<void>;
  applyNow: () => Promise<void>;
};

export function useOtaStatus(): OtaStatus {
  const u = Updates.useUpdates();
  const running = u.currentlyRunning;

  const checkNow = useCallback(async () => {
    try {
      await Updates.checkForUpdateAsync();
    } catch {
      // Errors surface through `useUpdates().checkError` — swallow here so
      // the press handler never rejects.
    }
  }, []);

  const fetchNow = useCallback(async () => {
    try {
      await Updates.fetchUpdateAsync();
    } catch {
      // See above — surfaced via `downloadError`.
    }
  }, []);

  const applyNow = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // reloadAsync rejects in dev / Expo Go. Banner stays visible; user can
      // dismiss by force-quitting if they really want to.
    }
  }, []);

  return {
    updateId: running?.updateId ?? null,
    createdAt: running?.createdAt ?? null,
    channel: running?.channel ?? null,
    runtimeVersion: running?.runtimeVersion ?? null,
    isEmbeddedLaunch: running?.isEmbeddedLaunch ?? true,
    isUpdateAvailable: u.isUpdateAvailable,
    isUpdatePending: u.isUpdatePending,
    isChecking: u.isChecking,
    isDownloading: u.isDownloading,
    lastChecked: u.lastCheckForUpdateTimeSinceRestart ?? null,
    checkError: u.checkError?.message ?? null,
    downloadError: u.downloadError?.message ?? null,
    checkNow,
    fetchNow,
    applyNow,
  };
}
