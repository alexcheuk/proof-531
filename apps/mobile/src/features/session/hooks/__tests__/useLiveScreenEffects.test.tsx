import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

const mockReplace = jest.fn();
const mockActivate = jest.fn();
const mockDeactivate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: () => {
    mockActivate();
    return Promise.resolve();
  },
  deactivateKeepAwake: () => {
    mockDeactivate();
  },
}));

// Import after mocks so the hook resolves the stubs.
import { useLiveScreenEffects } from '../useLiveScreenEffects';

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const baseProps = {
  sessionId: 42,
  phase: 'set' as const,
  sessionStatus: 'in_progress' as const,
  sessionLoading: false,
  sessionMissing: false,
};

describe('useLiveScreenEffects', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockActivate.mockClear();
    mockDeactivate.mockClear();
  });

  it('activates keep-awake on mount and deactivates on unmount', () => {
    const { unmount } = renderHook(() => useLiveScreenEffects(baseProps), { wrapper });
    expect(mockActivate).toHaveBeenCalledTimes(1);
    unmount();
    expect(mockDeactivate).toHaveBeenCalledTimes(1);
  });

  it('routes to /session/complete via replace when phase=complete and status=completed', async () => {
    renderHook(
      () => useLiveScreenEffects({ ...baseProps, phase: 'complete', sessionStatus: 'completed' }),
      { wrapper },
    );
    await act(async () => {
      await Promise.resolve();
    });
    // goTo.complete with { replace: true } calls router.replace with the
    // typed Href object.
    expect(mockReplace).toHaveBeenCalled();
    const arg = mockReplace.mock.calls[0]?.[0];
    expect(JSON.stringify(arg)).toMatch(/session\/complete/);
  });

  it('routes home when phase=complete and status=cancelled', async () => {
    renderHook(
      () => useLiveScreenEffects({ ...baseProps, phase: 'complete', sessionStatus: 'cancelled' }),
      { wrapper },
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('bounces home when the session row is missing', () => {
    renderHook(
      () =>
        useLiveScreenEffects({
          ...baseProps,
          sessionMissing: true,
          sessionStatus: undefined,
        }),
      { wrapper },
    );
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('bounces home when the row flipped out of in_progress from another surface', () => {
    renderHook(
      () =>
        useLiveScreenEffects({
          ...baseProps,
          sessionStatus: 'cancelled',
          phase: 'set',
        }),
      { wrapper },
    );
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('does NOT bounce home while the session row is still loading', () => {
    renderHook(
      () =>
        useLiveScreenEffects({
          ...baseProps,
          sessionLoading: true,
          sessionStatus: undefined,
        }),
      { wrapper },
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does NOT bounce home when already mid-complete (the complete effect owns routing)', () => {
    // Status flips to completed mid-complete; exit-gate would race the
    // complete effect if it didn't bail.
    renderHook(
      () =>
        useLiveScreenEffects({
          ...baseProps,
          phase: 'complete',
          sessionStatus: 'completed',
        }),
      { wrapper },
    );
    // Only one replace call should happen (from the complete-flow effect,
    // not from the exit gate).
    expect(mockReplace.mock.calls.length).toBeLessThanOrEqual(1);
  });
});
