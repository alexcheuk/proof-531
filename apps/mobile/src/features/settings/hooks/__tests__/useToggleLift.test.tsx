import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockGetSettings = jest.fn();
const mockUpdateSettings = jest.fn();
const mockGetActiveSession = jest.fn();
const mockCancelSession = jest.fn();

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@/data/accessors/settings', () => ({
  getSettings: (...args: unknown[]) => mockGetSettings(...args),
  updateSettings: (...args: unknown[]) => mockUpdateSettings(...args),
}));

jest.mock('@/data/accessors/session', () => ({
  getActiveSession: (...args: unknown[]) => mockGetActiveSession(...args),
  cancelSession: (...args: unknown[]) => mockCancelSession(...args),
}));

import { useToggleLift } from '../useToggleLift';

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useToggleLift', () => {
  beforeEach(() => {
    mockGetSettings.mockReset();
    mockUpdateSettings.mockReset();
    mockUpdateSettings.mockResolvedValue(undefined);
    mockGetActiveSession.mockReset();
    mockGetActiveSession.mockResolvedValue(null);
    mockCancelSession.mockReset();
    mockCancelSession.mockResolvedValue(undefined);
  });

  it('removes the lift when it is currently enabled', async () => {
    mockGetSettings.mockResolvedValue({ enabledLifts: ['squat', 'bench', 'deadlift', 'press'] });
    const { result } = renderHook(() => useToggleLift(), { wrapper });
    await act(async () => {
      await result.current('bench');
    });
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.anything(), {
      enabledLifts: ['squat', 'deadlift', 'press'],
    });
  });

  it('adds the lift back in LIFT_ORDER position when disabled', async () => {
    mockGetSettings.mockResolvedValue({ enabledLifts: ['squat', 'press'] });
    const { result } = renderHook(() => useToggleLift(), { wrapper });
    await act(async () => {
      await result.current('bench');
    });
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.anything(), {
      enabledLifts: ['squat', 'bench', 'press'],
    });
  });

  it('no-ops when toggling the last remaining lift', async () => {
    mockGetSettings.mockResolvedValue({ enabledLifts: ['squat'] });
    const { result } = renderHook(() => useToggleLift(), { wrapper });
    await act(async () => {
      await result.current('squat');
    });
    expect(mockUpdateSettings).not.toHaveBeenCalled();
  });

  it('cancels an in-progress session when its lift is disabled', async () => {
    mockGetSettings.mockResolvedValue({ enabledLifts: ['squat', 'bench', 'deadlift', 'press'] });
    mockGetActiveSession.mockResolvedValue({ id: 42, lift: 'squat' });
    const { result } = renderHook(() => useToggleLift(), { wrapper });
    await act(async () => {
      await result.current('squat');
    });
    expect(mockCancelSession).toHaveBeenCalledWith(expect.anything(), 42);
  });

  it('does not cancel a session for another lift', async () => {
    mockGetSettings.mockResolvedValue({ enabledLifts: ['squat', 'bench', 'deadlift', 'press'] });
    mockGetActiveSession.mockResolvedValue({ id: 42, lift: 'bench' });
    const { result } = renderHook(() => useToggleLift(), { wrapper });
    await act(async () => {
      await result.current('squat');
    });
    expect(mockCancelSession).not.toHaveBeenCalled();
  });

  it('does not call getActiveSession when enabling a lift (no disable)', async () => {
    mockGetSettings.mockResolvedValue({ enabledLifts: ['squat', 'press'] });
    const { result } = renderHook(() => useToggleLift(), { wrapper });
    await act(async () => {
      await result.current('bench');
    });
    expect(mockGetActiveSession).not.toHaveBeenCalled();
    expect(mockCancelSession).not.toHaveBeenCalled();
  });
});
