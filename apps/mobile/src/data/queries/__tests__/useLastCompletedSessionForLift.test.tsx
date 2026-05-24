import type { Session } from '@/data/accessors/session';
import { renderHook } from '@testing-library/react-native';

const mockData: { rows: Session[] | undefined; isLoading: boolean } = {
  rows: [],
  isLoading: false,
};

jest.mock('@/data/queries/useSessions', () => ({
  useSessions: () => ({ data: mockData.rows, isLoading: mockData.isLoading }),
  SESSIONS_KEY: ['sessions'],
}));

import { useLastCompletedSessionForLift } from '../useLastCompletedSessionForLift';

function session(
  id: number,
  lift: Session['lift'],
  status: Session['status'] = 'completed',
): Session {
  return {
    id,
    lift,
    cycle: 1,
    week: 1,
    startedAt: id * 1000,
    endedAt: id * 1000 + 1,
    status,
    trainingMaxSnapshot: 100,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
  };
}

describe('useLastCompletedSessionForLift', () => {
  beforeEach(() => {
    mockData.rows = [];
    mockData.isLoading = false;
  });

  it('returns null when no sessions exist for the lift', () => {
    mockData.rows = [session(1, 'squat')];
    const { result } = renderHook(() => useLastCompletedSessionForLift('bench'));
    expect(result.current.startedAt).toBeNull();
  });

  it('returns the newest completed session for the lift', () => {
    // Sessions are newest-first per the accessor contract.
    mockData.rows = [
      session(30, 'squat'),
      session(25, 'bench'),
      session(20, 'squat'),
      session(10, 'squat'),
    ];
    const { result } = renderHook(() => useLastCompletedSessionForLift('squat'));
    expect(result.current.startedAt).toBe(30 * 1000);
  });

  it('ignores cancelled / in_progress rows', () => {
    mockData.rows = [
      session(30, 'squat', 'cancelled'),
      session(25, 'squat', 'in_progress'),
      session(10, 'squat', 'completed'),
    ];
    const { result } = renderHook(() => useLastCompletedSessionForLift('squat'));
    expect(result.current.startedAt).toBe(10 * 1000);
  });

  it('returns null while the underlying query is loading', () => {
    mockData.rows = undefined;
    mockData.isLoading = true;
    const { result } = renderHook(() => useLastCompletedSessionForLift('squat'));
    expect(result.current.startedAt).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });
});
