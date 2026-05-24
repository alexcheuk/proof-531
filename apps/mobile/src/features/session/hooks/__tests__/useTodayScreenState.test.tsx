import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockCreateSession = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@/data/accessors/session', () => ({
  createSession: (db: unknown, lift: unknown) => mockCreateSession(db, lift),
}));

const mockActive: { data: { id: number; lift: string } | null } = { data: null };
jest.mock('@/data/queries/useActiveSession', () => ({
  useActiveSession: () => mockActive,
  ACTIVE_SESSION_KEY: ['activeSession'],
}));

type SetLog = {
  id: number;
  sessionId: number;
  index: 0 | 1 | 2;
  kind: 'warmup' | 'working' | 'amrap';
  prescribedWeight: number;
  prescribedReps: number;
  actualReps: number;
  completedAt: number;
};
const mockSetLogs: { data: SetLog[] } = { data: [] };
jest.mock('@/data/queries/useSetLogsForSession', () => ({
  useSetLogsForSession: () => mockSetLogs,
  SET_LOGS_FOR_SESSION_KEY: (id: number | null) => ['setLogsForSession', id],
}));

import { useTodayScreenState } from '../useTodayScreenState';

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useTodayScreenState', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockCreateSession.mockReset();
    mockActive.data = null;
    mockSetLogs.data = [];
  });

  it('preview mode: no active session, completedCount=0, nextSetIndex=0', () => {
    const { result } = renderHook(() => useTodayScreenState('squat'), { wrapper });
    expect(result.current.mode).toBe('preview');
    expect(result.current.completedCount).toBe(0);
    expect(result.current.nextSetIndex).toBeNull();
    expect(result.current.otherLift).toBeNull();
  });

  it('preview-other-active mode: active session belongs to a different lift', () => {
    mockActive.data = { id: 7, lift: 'bench' };
    const { result } = renderHook(() => useTodayScreenState('squat'), { wrapper });
    expect(result.current.mode).toBe('preview-other-active');
    expect(result.current.otherLift).toBe('bench');
    expect(result.current.sessionId).toBeNull();
  });

  it('active mode: this lift has an in-progress session', () => {
    mockActive.data = { id: 42, lift: 'squat' };
    const { result } = renderHook(() => useTodayScreenState('squat'), { wrapper });
    expect(result.current.mode).toBe('active');
    expect(result.current.sessionId).toBe(42);
  });

  it('active mode: derives completed indices + nextSetIndex from set logs', () => {
    mockActive.data = { id: 42, lift: 'squat' };
    mockSetLogs.data = [
      {
        id: 1,
        sessionId: 42,
        index: 0,
        kind: 'working',
        prescribedWeight: 0,
        prescribedReps: 5,
        actualReps: 5,
        completedAt: 0,
      },
      {
        id: 2,
        sessionId: 42,
        index: 1,
        kind: 'working',
        prescribedWeight: 0,
        prescribedReps: 5,
        actualReps: 5,
        completedAt: 0,
      },
    ];
    const { result } = renderHook(() => useTodayScreenState('squat'), { wrapper });
    expect(result.current.completedIndices).toEqual([0, 1]);
    expect(result.current.completedCount).toBe(2);
    expect(result.current.nextSetIndex).toBe(2);
  });

  it('active mode: warmup rows do NOT count toward completion', () => {
    mockActive.data = { id: 42, lift: 'squat' };
    mockSetLogs.data = [
      {
        id: 1,
        sessionId: 42,
        index: 0,
        kind: 'warmup',
        prescribedWeight: 0,
        prescribedReps: 0,
        actualReps: 0,
        completedAt: 0,
      },
    ];
    const { result } = renderHook(() => useTodayScreenState('squat'), { wrapper });
    expect(result.current.completedCount).toBe(0);
  });

  it('onPressCta in preview mode creates a session and routes to live', async () => {
    mockCreateSession.mockResolvedValue({ id: 99, lift: 'squat' });
    const { result } = renderHook(() => useTodayScreenState('squat'), { wrapper });

    await act(async () => {
      await result.current.onPressCta();
    });

    expect(mockCreateSession).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalled();
    const arg = mockPush.mock.calls[0]?.[0];
    expect(JSON.stringify(arg)).toMatch(/session\/live/);
  });

  it('onPressCta in active mode skips createSession and routes with the existing id', async () => {
    mockActive.data = { id: 42, lift: 'squat' };
    const { result } = renderHook(() => useTodayScreenState('squat'), { wrapper });

    await act(async () => {
      await result.current.onPressCta();
    });

    expect(mockCreateSession).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalled();
    const arg = mockPush.mock.calls[0]?.[0];
    expect(JSON.stringify(arg)).toMatch(/sessionId.*42/);
  });

  it('onPressCta in preview-other-active redirects to the other lift', async () => {
    mockActive.data = { id: 7, lift: 'bench' };
    const { result } = renderHook(() => useTodayScreenState('squat'), { wrapper });

    await act(async () => {
      await result.current.onPressCta();
    });

    expect(mockCreateSession).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalled();
    const arg = mockReplace.mock.calls[0]?.[0];
    expect(JSON.stringify(arg)).toMatch(/bench/);
  });
});
