import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockCompleteSession = jest.fn();

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@/data/accessors/session', () => ({
  completeSession: (...args: unknown[]) => mockCompleteSession(...args),
  cancelSession: jest.fn(),
}));

jest.mock('@/data/accessors/setLog', () => ({
  appendSetLog: jest.fn().mockResolvedValue(undefined),
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

  it('onRequestCancel parks the prior phase and switches to cancel-confirm', () => {
    const { result } = renderHook(() => useLiveScreenState(42), { wrapper });
    act(() => result.current.onRequestCancel());
    expect(result.current.phase).toBe('cancel-confirm');
    expect(result.current.cancelArmed).toBe(false);
    act(() => result.current.onDismissCancelSheet());
    expect(result.current.phase).toBe('set');
  });
});
