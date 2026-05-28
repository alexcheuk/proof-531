import * as Notifications from 'expo-notifications';

// Configure notification presentation behavior (show while app is foregrounded).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Ask for notification permissions on iOS and Android 13+.
 * Returns true if granted; false if denied or irrelevant.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return status === 'granted';
}

/**
 * Schedule a "rest complete" notification that fires `seconds` from now.
 * Returns the notification identifier (used to cancel later) or null if
 * permissions were not granted.
 *
 * The notification fires even when the app is backgrounded or the screen
 * is off, alerting the user that their rest period has ended.
 */
export async function scheduleRestDoneNotification(seconds: number): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const granted = await requestNotificationPermissions();
      if (!granted) return null;
    }
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rest complete',
        body: "Time to lift. You've got this.",
        sound: true,
        vibrate: [0, 250, 150, 250],
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Cancel a previously scheduled rest notification by its identifier.
 * No-op if the identifier is null or the notification already fired.
 */
export async function cancelRestDoneNotification(id: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already fired or invalid id — not an error.
  }
}
