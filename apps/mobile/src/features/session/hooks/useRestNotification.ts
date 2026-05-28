import { cancelRestDoneNotification, scheduleRestDoneNotification } from '@/lib/restNotification';
import { useEffect, useRef } from 'react';

/**
 * Schedule a "rest complete" local notification when rest becomes active,
 * then cancel it when rest ends or the component unmounts.
 *
 * Works in the background — the notification fires even if the user
 * navigates away from the session screen during rest.
 *
 * NOTE: Adding expo-notifications changes the EAS fingerprint. Existing
 * native builds will not receive this OTA until they rebuild.
 */
export function useRestNotification({
  active,
  restSeconds,
}: {
  active: boolean;
  restSeconds: number;
}): void {
  const notificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active) {
      cancelRestDoneNotification(notificationIdRef.current);
      notificationIdRef.current = null;
      return;
    }

    // Capture the promise so the cleanup can cancel even if the async
    // scheduleRestDoneNotification hasn't resolved by the time the component
    // unmounts (race: active→inactive transition during schedule flight).
    const promise = scheduleRestDoneNotification(restSeconds);
    promise.then((id) => {
      notificationIdRef.current = id;
    });

    return () => {
      // Cancel immediately if the ID is already resolved.
      cancelRestDoneNotification(notificationIdRef.current);
      // Also cancel whichever ID the in-flight promise resolves to.
      promise.then((id) => {
        cancelRestDoneNotification(id);
      });
      notificationIdRef.current = null;
    };
  }, [active, restSeconds]);
}
