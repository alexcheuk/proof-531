import { act, renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';

const mockSchedule = jest.fn();
const mockCancel = jest.fn();

jest.mock('@/lib/restNotification', () => ({
  scheduleRestDoneNotification: (...args: unknown[]) => mockSchedule(...args),
  cancelRestDoneNotification: (...args: unknown[]) => mockCancel(...args),
}));

import { useRestNotification } from '../useRestNotification';

// These cover the iOS path (a single scheduled "Rest complete" at the deadline).
// The Android live-chronometer path uses the native module and is verified on
// device, not in jest. Force iOS so the scheduling effect runs deterministically.
(Platform as { OS: string }).OS = 'ios';

const baseProps = {
  restSeconds: 180,
  sessionId: 1,
  getDeadlineMs: () => Date.now() + 180_000,
  setDeadline: jest.fn(),
};

describe('useRestNotification (iOS path)', () => {
  beforeEach(() => {
    mockSchedule.mockClear();
    mockCancel.mockClear();
    mockSchedule.mockResolvedValue('notif-id-123');
  });

  it('schedules a notification when active is true', () => {
    renderHook(() => useRestNotification({ ...baseProps, active: true }));
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(180);
  });

  it('does not schedule when active is false', () => {
    renderHook(() => useRestNotification({ ...baseProps, active: false }));
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('cancels on unmount when active', async () => {
    const { unmount } = renderHook(() =>
      useRestNotification({ ...baseProps, active: true, restSeconds: 120 }),
    );
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
    const { unmount } = renderHook(() => useRestNotification({ ...baseProps, active: true }));
    await act(async () => {
      resolveSchedule('late-id');
    });
    unmount();
    // The promise resolved before unmount, so the ref was set before cleanup ran.
    // Cleanup cancels with the resolved id  -  the notification is still cleaned up.
    expect(mockCancel).toHaveBeenCalledWith('late-id');
  });
});
