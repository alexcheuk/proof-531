import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

// ── mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

const mockResetSession = jest.fn();
jest.mock('@/data/accessors/session', () => ({
  resetSession: (...args: unknown[]) => mockResetSession(...args),
}));

const mockClearRestSnapshot = jest.fn();
jest.mock('../../sessionRuntime', () => ({
  clearRestSnapshot: (...args: unknown[]) => mockClearRestSnapshot(...args),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Warning: 'warning' },
}));

import { useTodaySessionActions } from '../useTodaySessionActions';

// ── helpers ───────────────────────────────────────────────────────────────────

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useTodaySessionActions', () => {
  beforeEach(() => {
    mockResetSession.mockReset();
    mockClearRestSnapshot.mockReset();
  });

  it('starts with reset sheet closed and not armed', () => {
    const { result } = renderHook(() => useTodaySessionActions(42), { wrapper });
    expect(result.current.resetOpen).toBe(false);
    expect(result.current.resetArmed).toBe(false);
  });

  it('onRequestReset opens the sheet (disarmed)', () => {
    const { result } = renderHook(() => useTodaySessionActions(42), { wrapper });
    act(() => {
      result.current.onRequestReset();
    });
    expect(result.current.resetOpen).toBe(true);
    expect(result.current.resetArmed).toBe(false);
  });

  it('first tap arms the confirm button', () => {
    const { result } = renderHook(() => useTodaySessionActions(42), { wrapper });
    act(() => {
      result.current.onRequestReset();
    });
    act(() => {
      result.current.onConfirmResetFirstTap();
    });
    expect(result.current.resetArmed).toBe(true);
  });

  it('dismiss disarms and closes the sheet', () => {
    const { result } = renderHook(() => useTodaySessionActions(42), { wrapper });
    act(() => {
      result.current.onRequestReset();
    });
    act(() => {
      result.current.onConfirmResetFirstTap();
    });
    act(() => {
      result.current.onDismissResetSheet();
    });
    expect(result.current.resetOpen).toBe(false);
    expect(result.current.resetArmed).toBe(false);
  });

  it('second tap calls resetSession + clears rest snapshot + closes sheet', async () => {
    mockResetSession.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTodaySessionActions(42), { wrapper });
    act(() => {
      result.current.onRequestReset();
    });
    act(() => {
      result.current.onConfirmResetFirstTap();
    });

    await act(async () => {
      await result.current.onConfirmResetSecondTap();
    });

    expect(mockResetSession).toHaveBeenCalledWith({ __stub: 'db' }, 42);
    expect(mockClearRestSnapshot).toHaveBeenCalledWith(42);
    expect(result.current.resetOpen).toBe(false);
    expect(result.current.resetArmed).toBe(false);
  });

  it('second tap is a no-op when sessionId is null', async () => {
    const { result } = renderHook(() => useTodaySessionActions(null), { wrapper });
    await act(async () => {
      await result.current.onConfirmResetSecondTap();
    });
    expect(mockResetSession).not.toHaveBeenCalled();
  });
});
