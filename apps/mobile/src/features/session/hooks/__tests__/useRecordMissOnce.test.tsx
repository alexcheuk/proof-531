import { renderHook } from '@testing-library/react-native';

const mockRecordMiss = jest.fn();
const mockClearMiss = jest.fn();
jest.mock('@/data/queries/useRecordMiss', () => ({
  useRecordMiss: () => ({ mutate: mockRecordMiss }),
}));
jest.mock('@/data/queries/useClearMissState', () => ({
  useClearMissState: () => ({ mutate: mockClearMiss }),
}));

import { useRecordMissOnce } from '../useRecordMissOnce';

type Params = Parameters<typeof useRecordMissOnce>[0];

describe('useRecordMissOnce', () => {
  beforeEach(() => {
    mockRecordMiss.mockClear();
    mockClearMiss.mockClear();
  });

  it('does nothing while not ready', () => {
    renderHook(() =>
      useRecordMissOnce({ sessionId: 1, lift: 'squat', isMiss: true, ready: false }),
    );
    expect(mockRecordMiss).not.toHaveBeenCalled();
    expect(mockClearMiss).not.toHaveBeenCalled();
  });

  it('does nothing when lift is null (e.g. a D4 session)', () => {
    renderHook(() => useRecordMissOnce({ sessionId: 1, lift: null, isMiss: true, ready: true }));
    expect(mockRecordMiss).not.toHaveBeenCalled();
    expect(mockClearMiss).not.toHaveBeenCalled();
  });

  it('records a miss exactly once on a ready miss', () => {
    renderHook(() => useRecordMissOnce({ sessionId: 7, lift: 'squat', isMiss: true, ready: true }));
    expect(mockRecordMiss).toHaveBeenCalledTimes(1);
    expect(mockRecordMiss).toHaveBeenCalledWith({ lift: 'squat' });
    expect(mockClearMiss).not.toHaveBeenCalled();
  });

  it('clears the miss state on a ready hit (literal "consecutive")', () => {
    renderHook(() =>
      useRecordMissOnce({ sessionId: 7, lift: 'bench', isMiss: false, ready: true }),
    );
    expect(mockClearMiss).toHaveBeenCalledTimes(1);
    expect(mockClearMiss).toHaveBeenCalledWith({ lift: 'bench' });
    expect(mockRecordMiss).not.toHaveBeenCalled();
  });

  it('does NOT re-fire across re-renders for the same sessionId', () => {
    const { rerender } = renderHook((p: Params) => useRecordMissOnce(p), {
      initialProps: { sessionId: 7, lift: 'squat', isMiss: true, ready: true } as Params,
    });
    expect(mockRecordMiss).toHaveBeenCalledTimes(1);
    rerender({ sessionId: 7, lift: 'squat', isMiss: true, ready: true });
    rerender({ sessionId: 7, lift: 'squat', isMiss: true, ready: true });
    expect(mockRecordMiss).toHaveBeenCalledTimes(1);
  });
});
