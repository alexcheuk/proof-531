import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockAppendSetLog = jest.fn();
const mockCompleteSession = jest.fn();

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@/data/accessors/setLog', () => ({
  appendSetLog: (...args: unknown[]) => mockAppendSetLog(...args),
}));

jest.mock('@/data/accessors/session', () => ({
  completeSession: (...args: unknown[]) => mockCompleteSession(...args),
}));

import { _resetSessionRuntimeForTests } from '../../sessionRuntime';
import { useLogWorkingSets } from '../useLogWorkingSets';

const baseProps = (overrides: Record<string, unknown> = {}) => ({
  sessionId: 42,
  setIndex: 0 as 0 | 1 | 2,
  prescribedWeight: 200,
  prescribedReps: 5,
  setLastLogged: jest.fn(),
  setSetIndex: jest.fn(),
  setPhase: jest.fn(),
  ...overrides,
});

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useLogWorkingSets  -  onLogWorkingSet', () => {
  beforeEach(() => {
    _resetSessionRuntimeForTests();
    mockAppendSetLog.mockReset();
    mockCompleteSession.mockReset();
    mockAppendSetLog.mockResolvedValue(undefined);
    mockCompleteSession.mockResolvedValue(undefined);
  });

  it('skips when sessionId is null', async () => {
    const props = baseProps({ sessionId: null });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });
    await act(async () => {
      await result.current.onLogWorkingSet();
    });
    expect(mockAppendSetLog).not.toHaveBeenCalled();
  });

  it('appends a working set and transitions to rest on non-terminal index', async () => {
    const setPhase = jest.fn();
    const setSetIndex = jest.fn();
    const setLastLogged = jest.fn();
    const props = baseProps({ setIndex: 1, setPhase, setSetIndex, setLastLogged });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });

    await act(async () => {
      await result.current.onLogWorkingSet();
    });

    expect(mockAppendSetLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sessionId: 42, index: 1, kind: 'working' }),
    );
    expect(setLastLogged).toHaveBeenCalledWith(
      expect.objectContaining({ isAmrap: false, weight: 200, reps: 5 }),
    );
    expect(setSetIndex).toHaveBeenCalledWith(2);
    expect(setPhase).toHaveBeenCalledWith('rest');
    expect(mockCompleteSession).not.toHaveBeenCalled();
  });

  it('completes the session when the last index (2) is logged (deload path)', async () => {
    const setPhase = jest.fn();
    const setSetIndex = jest.fn();
    const props = baseProps({ setIndex: 2, setPhase, setSetIndex });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });

    await act(async () => {
      await result.current.onLogWorkingSet();
    });

    expect(mockCompleteSession).toHaveBeenCalledWith(expect.anything(), 42);
    expect(setPhase).toHaveBeenCalledWith('complete');
    expect(setSetIndex).not.toHaveBeenCalled();
  });

  it('swallows accessor errors and leaves phase unchanged', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAppendSetLog.mockRejectedValueOnce(new Error('write failed'));
    const setPhase = jest.fn();
    const props = baseProps({ setIndex: 0, setPhase });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });

    await act(async () => {
      await result.current.onLogWorkingSet();
    });

    expect(setPhase).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('useLogWorkingSets  -  onSaveAmrap', () => {
  beforeEach(() => {
    mockAppendSetLog.mockReset();
    mockCompleteSession.mockReset();
    // Default: simulate a non-PR insert. Tests that exercise the PR branch
    // override with `mockResolvedValueOnce({ isPR: true })`.
    mockAppendSetLog.mockResolvedValue({ id: 1, isPR: false });
    mockCompleteSession.mockResolvedValue(undefined);
  });

  it('skips when sessionId is null', async () => {
    const props = baseProps({ sessionId: null });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });
    await act(async () => {
      await result.current.onSaveAmrap(8);
    });
    expect(mockAppendSetLog).not.toHaveBeenCalled();
  });

  it('appends an AMRAP set, snapshots e1RM, completes session, transitions to complete', async () => {
    const setPhase = jest.fn();
    const setLastLogged = jest.fn();
    const props = baseProps({ setIndex: 2, setPhase, setLastLogged });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });

    await act(async () => {
      await result.current.onSaveAmrap(8);
    });

    expect(mockAppendSetLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ index: 2, kind: 'amrap', actualReps: 8 }),
    );
    expect(setLastLogged).toHaveBeenCalledWith(expect.objectContaining({ isAmrap: true, reps: 8 }));
    expect(setLastLogged.mock.calls[0]?.[0].estimated1RM).toBeGreaterThan(200);
    expect(mockCompleteSession).toHaveBeenCalledWith(expect.anything(), 42);
    // After AMRAP the state machine stops on the BBB prompt screen so the
    // user can review their 5×10 supplementary plan before the receipt.
    expect(setPhase).toHaveBeenCalledWith('awaiting-bbb');
  });

  it('always routes to awaiting-bbb after AMRAP even when isPR (PR celebration reserved for TM-test day)', async () => {
    mockAppendSetLog.mockResolvedValueOnce({ id: 99, isPR: true });
    const setPhase = jest.fn();
    const props = baseProps({ setIndex: 2, setPhase });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });

    await act(async () => {
      await result.current.onSaveAmrap(10);
    });

    expect(setPhase).toHaveBeenCalledWith('awaiting-bbb');
    expect(setPhase).not.toHaveBeenCalledWith('pr-celebration');
  });

  it('swallows save errors and does not advance phase', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAppendSetLog.mockRejectedValueOnce(new Error('boom'));
    const setPhase = jest.fn();
    const props = baseProps({ setIndex: 2, setPhase });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });

    await act(async () => {
      await result.current.onSaveAmrap(5);
    });

    expect(setPhase).not.toHaveBeenCalled();
    expect(mockCompleteSession).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('useLogWorkingSets  -  onSaveTmTest', () => {
  beforeEach(() => {
    mockAppendSetLog.mockReset();
    mockCompleteSession.mockReset();
    mockAppendSetLog.mockResolvedValue({ id: 1, isPR: false });
    mockCompleteSession.mockResolvedValue(undefined);
  });

  it('skips when sessionId is null', async () => {
    const props = baseProps({ sessionId: null });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });
    await act(async () => {
      await result.current.onSaveTmTest(3);
    });
    expect(mockAppendSetLog).not.toHaveBeenCalled();
  });

  it('appends a tm-test log, completes the session, transitions to complete when not a PR', async () => {
    const setPhase = jest.fn();
    const props = baseProps({ setPhase });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });

    await act(async () => {
      await result.current.onSaveTmTest(1);
    });

    expect(mockAppendSetLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ kind: 'tm-test', actualReps: 1 }),
    );
    expect(mockCompleteSession).toHaveBeenCalledWith(expect.anything(), 42);
    expect(setPhase).toHaveBeenCalledWith('complete');
    expect(setPhase).not.toHaveBeenCalledWith('pr-celebration');
  });

  it('routes to pr-celebration when the TM-test row was flagged isPR', async () => {
    mockAppendSetLog.mockResolvedValueOnce({ id: 5, isPR: true });
    const setPhase = jest.fn();
    const props = baseProps({ setPhase });
    const { result } = renderHook(() => useLogWorkingSets(props), { wrapper });

    await act(async () => {
      await result.current.onSaveTmTest(5);
    });

    expect(setPhase).toHaveBeenCalledWith('pr-celebration');
    expect(setPhase).not.toHaveBeenCalledWith('complete');
  });
});
