import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockMigrate = jest.fn();
const mockReset = jest.fn();
const mockRollback = jest.fn();
const mockReplace = jest.fn();

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@/data/accessors/migrateStorageUnit', () => ({
  migrateStorageUnit: (db: unknown, unit: unknown) => mockMigrate(db, unit),
}));

jest.mock('@/data/accessors/reset', () => ({
  resetEverything: (db: unknown) => mockReset(db),
}));

jest.mock('@/data/accessors/rollbackLift', () => ({
  rollbackLift: (db: unknown, lift: unknown, n: unknown) => mockRollback(db, lift, n),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

import { useSettingsDialogs } from '../useSettingsDialogs';

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useSettingsDialogs  -  TM editor', () => {
  it('opens and closes the TM editor', () => {
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    expect(result.current.editingLift).toBeNull();

    act(() => result.current.openTmEditor('squat'));
    expect(result.current.editingLift).toBe('squat');

    act(() => result.current.closeTmEditor());
    expect(result.current.editingLift).toBeNull();
  });
});

describe('useSettingsDialogs  -  unit migration', () => {
  beforeEach(() => {
    mockMigrate.mockReset();
  });

  it('requestStorageMigration is a no-op when the unit is unchanged', () => {
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.requestStorageMigration('lbs'));
    expect(result.current.pendingStorage).toBeNull();
  });

  it('arms pendingStorage when the requested unit differs', () => {
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.requestStorageMigration('kg'));
    expect(result.current.pendingStorage).toBe('kg');
  });

  it('cancelStorageMigration clears pending when not in flight', () => {
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.requestStorageMigration('kg'));
    act(() => result.current.cancelStorageMigration());
    expect(result.current.pendingStorage).toBeNull();
  });

  it('confirmStorageMigration runs the accessor + clears pending', async () => {
    mockMigrate.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.requestStorageMigration('kg'));

    await act(async () => {
      await result.current.confirmStorageMigration();
    });

    expect(mockMigrate).toHaveBeenCalledWith(expect.anything(), 'kg');
    expect(result.current.pendingStorage).toBeNull();
    expect(result.current.migrating).toBe(false);
  });

  it('confirmStorageMigration clears the migrating flag when accessor throws', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockMigrate.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.requestStorageMigration('kg'));
    await act(async () => {
      await result.current.confirmStorageMigration();
    });
    expect(result.current.migrating).toBe(false);
    consoleError.mockRestore();
  });
});

describe('useSettingsDialogs  -  lift rollback', () => {
  beforeEach(() => {
    mockRollback.mockReset();
  });

  it('opens and closes the rollback sheet', () => {
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    expect(result.current.rollbackOpen).toBe(false);

    act(() => result.current.openRollback());
    expect(result.current.rollbackOpen).toBe(true);

    act(() => result.current.closeRollback());
    expect(result.current.rollbackOpen).toBe(false);
  });

  it('confirmRollback calls the accessor with the correct args and closes', async () => {
    mockRollback.mockResolvedValue(2);
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.openRollback());

    await act(async () => {
      await result.current.confirmRollback('bench', 2);
    });

    expect(mockRollback).toHaveBeenCalledWith(expect.anything(), 'bench', 2);
    expect(result.current.rollbackOpen).toBe(false);
    expect(result.current.rollingBack).toBe(false);
  });

  it('keeps rollingBack=true while the accessor is in flight', async () => {
    let resolve: ((n: number) => void) | null = null;
    mockRollback.mockImplementation(
      () =>
        new Promise<number>((r) => {
          resolve = r;
        }),
    );
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.openRollback());

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.confirmRollback('squat', 1);
    });

    expect(result.current.rollingBack).toBe(true);

    await act(async () => {
      resolve?.(1);
      await pending;
    });

    expect(result.current.rollingBack).toBe(false);
  });

  it('clears rollingBack flag when accessor throws', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRollback.mockRejectedValue(new Error('db fail'));
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.openRollback());

    await act(async () => {
      await result.current.confirmRollback('deadlift', 1);
    });

    expect(result.current.rollingBack).toBe(false);
    consoleError.mockRestore();
  });
});

describe('useSettingsDialogs  -  destructive reset', () => {
  beforeEach(() => {
    mockReset.mockReset();
    mockReplace.mockReset();
  });

  it('arms + cancels the confirming-reset flag', () => {
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.requestReset());
    expect(result.current.confirmingReset).toBe(true);
    act(() => result.current.cancelReset());
    expect(result.current.confirmingReset).toBe(false);
  });

  it('confirmReset runs the accessor, clears caches, and routes to onboarding', async () => {
    mockReset.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.requestReset());

    await act(async () => {
      await result.current.confirmReset();
    });

    expect(mockReset).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    expect(result.current.confirmingReset).toBe(false);
    expect(result.current.resetting).toBe(false);
  });

  it('keeps resetting=true while the accessor is in flight', async () => {
    let resolve: (() => void) | null = null;
    mockReset.mockImplementation(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    const { result } = renderHook(() => useSettingsDialogs('lbs'), { wrapper });
    act(() => result.current.requestReset());

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.confirmReset();
    });

    expect(result.current.resetting).toBe(true);

    await act(async () => {
      resolve?.();
      await pending;
    });

    expect(result.current.resetting).toBe(false);
  });
});
