import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockCompleteOnboarding = jest.fn();
const mockReplace = jest.fn();
const mockRefetch = jest.fn(() => Promise.resolve());

jest.mock('@/data/DbProvider', () => ({
  useDb: () => ({ __stub: 'db' }),
}));

jest.mock('@/data/accessors/onboarding', () => ({
  completeOnboarding: (...args: unknown[]) => mockCompleteOnboarding(...args),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

const mockSettings: { data: { storageUnit: 'lbs' | 'kg' } | undefined } = {
  data: { storageUnit: 'lbs' },
};
jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => ({ data: mockSettings.data }),
  SETTINGS_KEY: ['settings'],
}));

import { useOnboardingFlow } from '../useOnboardingFlow';

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // Spy on refetch so the test can assert that we await it before navigating.
  qc.refetchQueries = mockRefetch as unknown as QueryClient['refetchQueries'];
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useOnboardingFlow', () => {
  beforeEach(() => {
    mockCompleteOnboarding.mockReset();
    mockReplace.mockReset();
    mockRefetch.mockClear();
    mockSettings.data = { storageUnit: 'lbs' };
  });

  it('exposes the underlying reducer state + dispatch', () => {
    const { result } = renderHook(() => useOnboardingFlow(), { wrapper });
    expect(result.current.state.step).toBe(1);
    expect(typeof result.current.dispatch).toBe('function');
  });

  it('seeds defaults from settings.storageUnit (kg → kg defaults)', () => {
    mockSettings.data = { storageUnit: 'kg' };
    const { result } = renderHook(() => useOnboardingFlow(), { wrapper });
    expect(result.current.state.unit).toBe('kg');
  });

  it('falls back to lbs when settings is still loading', () => {
    mockSettings.data = undefined;
    const { result } = renderHook(() => useOnboardingFlow(), { wrapper });
    expect(result.current.state.unit).toBe('lbs');
  });

  it('derives Epley-based 1RM for calculate-mode inputs', () => {
    const { result } = renderHook(() => useOnboardingFlow(), { wrapper });
    // Default squat in calculate mode is 225 × 5 → Epley ≈ 263.
    expect(result.current.computed.squat).toBeGreaterThan(0);
    expect(result.current.computed.squat).toBeLessThan(280);
  });

  it('handleFinish writes via completeOnboarding, refetches caches, and routes home', async () => {
    mockCompleteOnboarding.mockResolvedValue(undefined);
    const { result } = renderHook(() => useOnboardingFlow(), { wrapper });

    await act(async () => {
      await result.current.handleFinish();
    });

    expect(mockCompleteOnboarding).toHaveBeenCalled();
    const [, payload] = mockCompleteOnboarding.mock.calls[0] as [unknown, { unit: string }];
    expect(payload.unit).toBe('lbs');
    expect(mockRefetch).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('handleFinish clears the finishing latch on accessor error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCompleteOnboarding.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useOnboardingFlow(), { wrapper });

    await act(async () => {
      await result.current.handleFinish();
    });

    expect(result.current.finishing).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('handleFinish is a no-op while already finishing', async () => {
    let resolve: (() => void) | null = null;
    mockCompleteOnboarding.mockImplementation(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    const { result } = renderHook(() => useOnboardingFlow(), { wrapper });

    let first!: Promise<void>;
    act(() => {
      first = result.current.handleFinish();
    });

    // Second call while first is in flight should not enqueue another accessor.
    await act(async () => {
      await result.current.handleFinish();
    });
    expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve?.();
      await first;
    });
  });
});
