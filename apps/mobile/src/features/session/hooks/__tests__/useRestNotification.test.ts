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

// Deadline computed per-render so the seconds assertion is deterministic
// (module-load → test-run latency must not skew the rounding).
function makeProps(deadlineMs: number = Date.now() + 180_000) {
  return {
    deadlineMs,
    sessionId: 1,
    restAlarmSound: 'alarm' as const,
    getDeadlineMs: () => deadlineMs,
    setDeadline: jest.fn(),
  };
}

describe('useRestNotification (iOS path)', () => {
  beforeEach(() => {
    mockSchedule.mockClear();
    mockCancel.mockClear();
    mockSchedule.mockResolvedValue('notif-id-123');
  });

  it('schedules a notification for the remaining seconds when active is true', () => {
    renderHook(() => useRestNotification({ ...makeProps(), active: true }));
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith(180);
  });

  it('does not schedule when active is false', () => {
    renderHook(() => useRestNotification({ ...makeProps(), active: false }));
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('does not schedule without a deadline', () => {
    renderHook(() => useRestNotification({ ...makeProps(), deadlineMs: null, active: true }));
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('reschedules when the deadline moves (in-app +30s)', async () => {
    const start = Date.now() + 180_000;
    const { rerender } = renderHook(
      ({ deadlineMs }: { deadlineMs: number }) =>
        useRestNotification({ ...makeProps(deadlineMs), deadlineMs, active: true }),
      { initialProps: { deadlineMs: start } },
    );
    await act(async () => {
      await Promise.resolve();
    });
    rerender({ deadlineMs: start + 30_000 });
    // Old notification cancelled, new one scheduled at the extended deadline.
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSchedule).toHaveBeenCalledTimes(2);
    expect(mockSchedule).toHaveBeenLastCalledWith(210);
  });

  it('cancels on unmount when active', async () => {
    const { unmount } = renderHook(() =>
      useRestNotification({ ...makeProps(Date.now() + 120_000), active: true }),
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
    const { unmount } = renderHook(() => useRestNotification({ ...makeProps(), active: true }));
    await act(async () => {
      resolveSchedule('late-id');
    });
    unmount();
    // The promise resolved before unmount, so the ref was set before cleanup ran.
    // Cleanup cancels with the resolved id  -  the notification is still cleaned up.
    expect(mockCancel).toHaveBeenCalledWith('late-id');
  });
});
