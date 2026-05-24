import { act, renderHook } from '@testing-library/react-native';

const mockActive: { data: { lift: string } | null } = { data: null };
jest.mock('@/data/queries/useActiveSession', () => ({
  useActiveSession: () => mockActive,
}));

import { __resetHomeScreenStateForTests, useHomeScreenState } from '../useHomeScreenState';

describe('useHomeScreenState', () => {
  beforeEach(() => {
    __resetHomeScreenStateForTests();
    mockActive.data = null;
  });

  it('starts on the initial lift', () => {
    const { result } = renderHook(() =>
      useHomeScreenState('squat', ['squat', 'bench', 'deadlift', 'press']),
    );
    expect(result.current.selectedLift).toBe('squat');
    expect(result.current.inProgressLift).toBeNull();
  });

  it('setSelectedLift updates state + persists across remount', () => {
    const { result } = renderHook(() =>
      useHomeScreenState('squat', ['squat', 'bench', 'deadlift', 'press']),
    );
    act(() => result.current.setSelectedLift('deadlift'));
    expect(result.current.selectedLift).toBe('deadlift');

    // Mount a fresh hook — module cache should keep the prior selection.
    const { result: result2 } = renderHook(() =>
      useHomeScreenState('squat', ['squat', 'bench', 'deadlift', 'press']),
    );
    expect(result2.current.selectedLift).toBe('deadlift');
  });

  it('snaps the selectedLift back to initialLift when it is no longer enabled', () => {
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: ReadonlyArray<'squat' | 'bench' | 'deadlift' | 'press'> }) =>
        useHomeScreenState('bench', enabled),
      { initialProps: { enabled: ['squat', 'bench', 'deadlift', 'press'] as const } },
    );

    act(() => result.current.setSelectedLift('deadlift'));
    expect(result.current.selectedLift).toBe('deadlift');

    rerender({ enabled: ['squat', 'bench'] as const });
    expect(result.current.selectedLift).toBe('bench');
  });

  it('auto-focuses the in-progress lift on first observation (no user choice yet)', () => {
    mockActive.data = { lift: 'press' };
    const { result } = renderHook(() =>
      useHomeScreenState('squat', ['squat', 'bench', 'deadlift', 'press']),
    );
    expect(result.current.selectedLift).toBe('press');
    expect(result.current.inProgressLift).toBe('press');
  });

  it('does NOT auto-focus when the user has already chosen a lift', () => {
    const { result, rerender } = renderHook(
      ({ activeLift }: { activeLift: string | null }) => {
        mockActive.data = activeLift ? { lift: activeLift } : null;
        return useHomeScreenState('squat', ['squat', 'bench', 'deadlift', 'press']);
      },
      { initialProps: { activeLift: null as string | null } },
    );

    act(() => result.current.setSelectedLift('bench'));
    expect(result.current.selectedLift).toBe('bench');

    rerender({ activeLift: 'press' });
    // User already chose bench; auto-focus should NOT override.
    expect(result.current.selectedLift).toBe('bench');
  });
});
