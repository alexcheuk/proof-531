import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

// Android uses react-native-notify-kit (restChronometer.ts) instead.
// Lazy-require so the iOS module isn't loaded until first use.
let cached: NotificationsModule | null = null;
function getNotifications(): NotificationsModule | null {
  if (Platform.OS === 'android') return null;
  if (!cached) cached = require('expo-notifications') as NotificationsModule;
  return cached;
}

// Configure notification presentation behavior (show while app is foregrounded).
getNotifications()?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return status === 'granted';
}

// Fires even when backgrounded or screen-off  -  that's the point.
export async function scheduleRestDoneNotification(seconds: number): Promise<string | null> {
  const Notifications = getNotifications();
  if (!Notifications) return null;
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

export async function cancelRestDoneNotification(id: string | null): Promise<void> {
  if (!id) return;
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already fired or invalid id: not an error.
  }
}
