import { renderHook } from '@testing-library/react-native';

const mockUseLiftProgression = jest.fn();
jest.mock('@/data/queries/useLiftProgression', () => ({
  useLiftProgression: (lift: unknown) => mockUseLiftProgression(lift),
}));

import { useCycleDaySessionId } from '../useCycleDaySessionId';

// Minimal progression shape covering the fields the selector reads.
function progression(rows: unknown) {
  return { data: { rows } };
}

beforeEach(() => {
  mockUseLiftProgression.mockReset();
});

describe('useCycleDaySessionId', () => {
  it('returns null while the progression query has not resolved', () => {
    mockUseLiftProgression.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useCycleDaySessionId('bench', 3, 2));
    expect(result.current).toBeNull();
  });

  it('returns the sessionId for a completed past day in the cycle', () => {
    mockUseLiftProgression.mockReturnValue(
      progression([
        {
          cycle: 3,
          cells: [
            { day: 1, kind: 'past', sessionId: 11 },
            { day: 2, kind: 'last-done', sessionId: 22 },
            { day: 3, kind: 'now' },
            { day: 4, kind: 'future' },
          ],
        },
      ]),
    );
    const { result } = renderHook(() => useCycleDaySessionId('bench', 3, 2));
    expect(result.current).toBe(22);
  });

  it('returns null for the current (now) day even within the cycle', () => {
    mockUseLiftProgression.mockReturnValue(
      progression([
        {
          cycle: 3,
          cells: [
            { day: 1, kind: 'past', sessionId: 11 },
            { day: 3, kind: 'now' },
          ],
        },
      ]),
    );
    const { result } = renderHook(() => useCycleDaySessionId('bench', 3, 3));
    expect(result.current).toBeNull();
  });

  it('returns null for a future day', () => {
    mockUseLiftProgression.mockReturnValue(
      progression([{ cycle: 3, cells: [{ day: 4, kind: 'future' }] }]),
    );
    const { result } = renderHook(() => useCycleDaySessionId('bench', 3, 4));
    expect(result.current).toBeNull();
  });

  it('returns null when the requested cycle is not in the rows', () => {
    mockUseLiftProgression.mockReturnValue(
      progression([{ cycle: 2, cells: [{ day: 1, kind: 'past', sessionId: 5 }] }]),
    );
    const { result } = renderHook(() => useCycleDaySessionId('bench', 9, 1));
    expect(result.current).toBeNull();
  });
});
