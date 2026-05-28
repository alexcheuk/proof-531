import { renderHook } from '@testing-library/react-native';

const mockImpactAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  impactAsync: (...args: unknown[]) => {
    mockImpactAsync(...args);
    return Promise.resolve();
  },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

import { useSessionCompleteHaptic } from '../useSessionCompleteHaptic';

describe('useSessionCompleteHaptic', () => {
  beforeEach(() => {
    mockImpactAsync.mockClear();
  });

  it('does not fire when viewReady=false', () => {
    renderHook(() => useSessionCompleteHaptic(false));
    expect(mockImpactAsync).not.toHaveBeenCalled();
  });

  it('fires Heavy impact once when viewReady=true', () => {
    renderHook(() => useSessionCompleteHaptic(true));
    expect(mockImpactAsync).toHaveBeenCalledTimes(1);
    expect(mockImpactAsync).toHaveBeenCalledWith('heavy');
  });

  it('does not re-fire across re-renders once latched', () => {
    const { rerender } = renderHook((ready: boolean) => useSessionCompleteHaptic(ready), {
      initialProps: true as boolean,
    });
    rerender(true);
    rerender(true);
    expect(mockImpactAsync).toHaveBeenCalledTimes(1);
  });

  it('fires when viewReady transitions false→true', () => {
    const { rerender } = renderHook((ready: boolean) => useSessionCompleteHaptic(ready), {
      initialProps: false as boolean,
    });
    expect(mockImpactAsync).not.toHaveBeenCalled();
    rerender(true);
    expect(mockImpactAsync).toHaveBeenCalledTimes(1);
  });
});
