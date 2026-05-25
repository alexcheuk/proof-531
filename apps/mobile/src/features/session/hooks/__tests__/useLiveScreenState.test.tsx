import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockCompleteSession = jest.fn();

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@/data/accessors/session', () => ({
  completeSession: (...args: unknown[]) => mockCompleteSession(...args),
}));

jest.mock('@/data/accessors/setLog', () => ({
  appendSetLog: jest.fn().mockResolvedValue(undefined),
}));

const mockUndoLastWorkingSet = jest.fn();
jest.mock('@/data/queries/useUndoLastWorkingSet', () => ({
  useUndoLastWorkingSet: () => mockUndoLastWorkingSet,
}));

const mockSession: {
  data: {
    id: number;
    week: number;
    trainingMaxSnapshot: number;
    storageUnitSnapshot: string;
  } | null;
} = {
  data: { id: 42, week: 1, trainingMaxSnapshot: 250, storageUnitSnapshot: 'lbs' },
};
jest.mock('@/data/queries/useSession', () => ({
  useSession: () => ({ data: mockSession.data, isLoading: false }),
}));

const mockSetLogs: { data: Array<{ kind: string; index: number }> | undefined } = { data: [] };
jest.mock('@/data/queries/useSetLogsForSession', () => ({
  useSetLogsForSession: () => ({ data: mockSetLogs.data }),
  SET_LOGS_FOR_SESSION_KEY: (id: number | null) => ['setLogsForSession', id],
}));

jest.mock('@/data/queries/useSessions', () => ({
  SESSIONS_KEY: ['sessions'],
}));

import { useLiveScreenState } from '../useLiveScreenState';

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useLiveScreenState — bootstrap', () => {
  beforeEach(() => {
    mockCompleteSession.mockReset();
    mockSession.data = { id: 42, week: 1, trainingMaxSnapshot: 250, storageUnitSnapshot: 'lbs' };
    mockSetLogs.data = [];
  });

  it('starts on the first set when no set logs exist', () => {
    const { result } = renderHook(() => useLiveScreenState(42), { wrapper });
    expect(result.current.setIndex).toBe(0);
    expect(result.current.phase).toBe('set');
  });

  it('advances setIndex from persisted set logs', async () => {
    mockSetLogs.data = [
      { kind: 'working', index: 0 },
      { kind: 'working', index: 1 },
    ];
    const { result } = renderHook(() => useLiveScreenState(42), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.setIndex).toBe(2);
  });

  it('transitions straight to complete when every working slot is already filled', async () => {
    mockCompleteSession.mockResolvedValue(undefined);
    mockSetLogs.data = [
      { kind: 'working', index: 0 },
      { kind: 'working', index: 1 },
      { kind: 'amrap', index: 2 },
    ];
    const { result } = renderHook(() => useLiveScreenState(42), { wrapper });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockCompleteSession).toHaveBeenCalledWith(expect.anything(), 42);
    expect(result.current.phase).toBe('complete');
  });
});

describe('useLiveScreenState — phase transitions', () => {
  beforeEach(() => {
    mockCompleteSession.mockReset();
    mockSession.data = { id: 42, week: 1, trainingMaxSnapshot: 250, storageUnitSnapshot: 'lbs' };
    mockSetLogs.data = [];
  });

  it('onOpenAmrapSheet flips phase to amrap-log; onCancelAmrapSheet returns to set', () => {
    const { result } = renderHook(() => useLiveScreenState(42), { wrapper });
    act(() => result.current.onOpenAmrapSheet());
    expect(result.current.phase).toBe('amrap-log');
    act(() => result.current.onCancelAmrapSheet());
    expect(result.current.phase).toBe('set');
  });

  it('onUndoLastSet during rest restores the prior setIndex and returns to set phase', async () => {
    mockUndoLastWorkingSet.mockReset();
    // Pretend the accessor deleted the working row at index 0 (the just-logged set).
    mockUndoLastWorkingSet.mockResolvedValue({
      id: 1,
      sessionId: 42,
      index: 0,
      kind: 'working',
      prescribedWeight: 162.5,
      prescribedReps: 5,
      actualReps: 5,
      completedAt: Date.now(),
      isPR: false,
      estimated1RM: null,
    });
    const { result } = renderHook(() => useLiveScreenState(42), { wrapper });
    // Log the first working set → advances to setIndex=1, phase='rest'.
    await act(async () => {
      await result.current.onLogWorkingSet();
    });
    expect(result.current.phase).toBe('rest');
    expect(result.current.setIndex).toBe(1);

    // Undo → restores setIndex to 0, clears lastLogged, phase back to 'set'.
    await act(async () => {
      await result.current.onUndoLastSet();
    });
    expect(mockUndoLastWorkingSet).toHaveBeenCalledWith(42);
    expect(result.current.phase).toBe('set');
    expect(result.current.setIndex).toBe(0);
    expect(result.current.lastLogged).toBeNull();
  });

  it('onUndoLastSet is a no-op outside the rest phase', async () => {
    mockUndoLastWorkingSet.mockReset();
    const { result } = renderHook(() => useLiveScreenState(42), { wrapper });
    expect(result.current.phase).toBe('set');
    await act(async () => {
      await result.current.onUndoLastSet();
    });
    expect(mockUndoLastWorkingSet).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('set');
  });
});
