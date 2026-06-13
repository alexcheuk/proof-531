import { isExpired } from '@/domain/restDeadline';
import {
  cancelRest,
  postRestChronometer,
  readDisplayedDeadline,
  requestRestPermission,
  scheduleRestComplete,
} from '@/lib/restChronometer';
import { cancelRestDoneNotification, scheduleRestDoneNotification } from '@/lib/restNotification';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { type AppPhase, restNotifEffectForAppState } from './restNotificationActions';

/**
 * Drives the rest-complete notification.
 *
 * iOS: schedules a single "Rest complete" local notification at the deadline
 * (unchanged behavior; the live countdown is Android-only).
 *
 * Android: while resting, shows the OS-ticked live countdown notification only
 * when the app is backgrounded. The in-app timer is the experience while
 * foregrounded. The notification carries the deadline in its data, so a +30s
 * pressed on the notification (even after the process is killed) is recovered
 * on foreground and copied back into the in-app timer via `setDeadline`.
 */
export function useRestNotification({
  active,
  restSeconds,
  sessionId,
  getDeadlineMs,
  setDeadline,
}: {
  active: boolean;
  restSeconds: number;
  sessionId: number | null;
  getDeadlineMs: () => number | null;
  setDeadline: (endsAtMs: number) => void;
}): void {
  const iosNotificationId = useRef<string | null>(null);

  // iOS  -  schedule the single completion notification; cancel on exit.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (!active) return;

    const promise = scheduleRestDoneNotification(restSeconds);
    promise.then((id) => {
      iosNotificationId.current = id;
    });

    return () => {
      cancelRestDoneNotification(iosNotificationId.current);
      promise.then((id) => cancelRestDoneNotification(id));
      iosNotificationId.current = null;
    };
  }, [active, restSeconds]);

  // Android  -  live chronometer notification while backgrounded mid-rest.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!active || sessionId == null) return;

    void requestRestPermission();

    // Copy the deadline back from a displayed rest notification (cold start
    // from a tap, or a +30s pressed while the process was dead), then clear
    // the chronometer if rest is still running. If it already elapsed, leave
    // the "Rest complete" alert up  -  it stays until dismissed.
    const reconcile = async () => {
      const displayed = await readDisplayedDeadline();
      if (displayed != null) {
        setDeadline(displayed);
        if (!isExpired(displayed, Date.now())) {
          await cancelRest();
        }
        return;
      }
      if (AppState.currentState === 'active') {
        await cancelRest();
      }
    };
    void reconcile();

    const onChange = (next: AppStateStatus) => {
      const effect = restNotifEffectForAppState(next as AppPhase, true);
      if (effect === 'post') {
        const endsAtMs = getDeadlineMs();
        if (endsAtMs != null) {
          void postRestChronometer({ endsAtMs, sessionId });
          void scheduleRestComplete({ endsAtMs, sessionId });
        }
      } else if (effect === 'reconcile') {
        void reconcile();
      }
    };
    const subscription = AppState.addEventListener('change', onChange);

    return () => {
      subscription.remove();
      void cancelRest();
    };
  }, [active, sessionId, getDeadlineMs, setDeadline]);
}
