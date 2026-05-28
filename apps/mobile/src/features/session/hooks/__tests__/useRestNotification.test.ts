import { act, renderHook } from '@testing-library/react-native';

const mockSchedule = jest.fn();
const mockCancel = jest.fn();

jest.mock('@/lib/restNotification', () => ({
  scheduleRestDoneNotification: (...args: unknown[]) => mockSchedule(...args),
  cancelRestDoneNotification: (...args: unknown[]) => mockCancel(...args),
}));

import { useRestNotification } from '../useRestNotification';

describe('useRestNotification', () => {
  beforeEach(() => {
    mockSchedule.mockClear();
    mockCancel.mockClear();
    mockSchedule.mockResolvedValue('notif-id-123');
  });

  it('schedules a notification when active is true', () => {
    renderHook(() => useRestNotification({ active: true, restSeconds: 180 }));
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(180);
  });

  it('does not schedule when active is false', () => {
    renderHook(() => useRestNotification({ active: false, restSeconds: 180 }));
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('cancels on unmount when active', async () => {
    const { unmount } = renderHook(() => useRestNotification({ active: true, restSeconds: 120 }));
    await act(async () => {
      await Promise.resolve();
    });
    unmount();
    expect(mockCancel).toHaveBeenCalled();
  });

  it('cancels with the resolved id if promise resolves before cleanup', async () => {
    let resolveSchedule!: (id: string) => void;
    mockSchedule.mockReturnValue(
      new Promise<string>((res) => {
        resolveSchedule = res;
      }),
    );
    const { unmount } = renderHook(() => useRestNotification({ active: true, restSeconds: 180 }));
    await act(async () => {
      resolveSchedule('late-id');
    });
    unmount();
    // The promise resolved before unmount, so the ref was set before cleanup ran.
    // Cleanup cancels with the resolved id — the notification is still cleaned up.
    expect(mockCancel).toHaveBeenCalledWith('late-id');
  });
});
