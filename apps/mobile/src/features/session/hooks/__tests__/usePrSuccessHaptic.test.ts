import { renderHook } from '@testing-library/react-native';

const mockNotificationAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  notificationAsync: (...args: unknown[]) => {
    mockNotificationAsync(...args);
    return Promise.resolve();
  },
  NotificationFeedbackType: { Warning: 'warning', Error: 'error', Success: 'success' },
}));

import { usePrSuccessHaptic } from '../usePrSuccessHaptic';

describe('usePrSuccessHaptic', () => {
  beforeEach(() => {
    mockNotificationAsync.mockClear();
  });

  it('does not fire when hasPR=false', () => {
    renderHook(() => usePrSuccessHaptic(false));
    expect(mockNotificationAsync).not.toHaveBeenCalled();
  });

  it('fires once with `success` when hasPR=true', () => {
    renderHook(() => usePrSuccessHaptic(true));
    expect(mockNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mockNotificationAsync).toHaveBeenCalledWith('success');
  });

  it('does NOT fire again across re-renders once latched', () => {
    const { rerender } = renderHook((hasPR: boolean) => usePrSuccessHaptic(hasPR), {
      initialProps: true as boolean,
    });
    expect(mockNotificationAsync).toHaveBeenCalledTimes(1);
    rerender(true);
    rerender(true);
    expect(mockNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire when hasPR flips false→true→false→true across re-renders', () => {
    // Latch holds — once fired the hook never re-fires inside the same
    // component instance, even if hasPR oscillates (which it shouldn't in
    // practice but the latch is the contract).
    const { rerender } = renderHook((hasPR: boolean) => usePrSuccessHaptic(hasPR), {
      initialProps: true as boolean,
    });
    rerender(false);
    rerender(true);
    expect(mockNotificationAsync).toHaveBeenCalledTimes(1);
  });
});
