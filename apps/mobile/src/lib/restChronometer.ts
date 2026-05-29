import { extendDeadline } from '@/domain/restDeadline';
import { Platform } from 'react-native';

/**
 * Android-only wrapper around react-native-notify-kit for the live rest
 * countdown. The notification is the OS-ticked chronometer (counts down with
 * zero JS running); a same-id timestamp trigger replaces it with a "Rest
 * complete" alert at the deadline. Every posted notification carries the
 * deadline in its `data` payload, which survives process death and is the
 * cross-process carrier for the +30s action and the foreground re-sync.
 *
 * notify-kit is lazy-required and Android-guarded so the iOS bundle never
 * loads the native module and every function is a safe no-op off Android.
 */

const REST_NOTIFICATION_ID = 'rest';
const CHANNEL_TIMER = 'rest-timer';
const CHANNEL_DONE = 'rest-done';
/** Action id for the notification "+30s" button. */
export const REST_ADD_ACTION_ID = 'rest-add-30';
/** Status-bar icon. ic_launcher always exists; a monochrome icon is a follow-up. */
const SMALL_ICON = 'ic_launcher';

type NotifeeNamespace = typeof import('react-native-notify-kit');

const isAndroid = Platform.OS === 'android';

let cached: NotifeeNamespace | null = null;
function load(): NotifeeNamespace | null {
  if (!isAndroid) return null;
  if (!cached) cached = require('react-native-notify-kit') as NotifeeNamespace;
  return cached;
}

export async function ensureRestChannels(): Promise<void> {
  const m = load();
  if (!m) return;
  const { AndroidImportance } = m;
  await m.default.createChannel({
    id: CHANNEL_TIMER,
    name: 'Rest timer',
    importance: AndroidImportance.LOW,
    vibration: false,
  });
  await m.default.createChannel({
    id: CHANNEL_DONE,
    name: 'Rest complete',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

/** Android 13+ runtime notification permission. Resolves regardless of outcome. */
export async function requestRestPermission(): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.default.requestPermission();
  } catch {
    // Best-effort: a denied prompt degrades to the in-app timer only.
  }
}

/** Post (or replace) the ongoing chronometer notification counting down to `endsAtMs`. */
export async function postRestChronometer(opts: {
  endsAtMs: number;
  sessionId: number;
}): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await ensureRestChannels();
    await m.default.displayNotification({
      id: REST_NOTIFICATION_ID,
      title: 'Resting',
      body: 'Tap to return to your set.',
      data: { endsAtMs: String(opts.endsAtMs), sessionId: String(opts.sessionId) },
      android: {
        channelId: CHANNEL_TIMER,
        ongoing: true,
        onlyAlertOnce: true,
        smallIcon: SMALL_ICON,
        showChronometer: true,
        chronometerDirection: 'down',
        timestamp: opts.endsAtMs,
        pressAction: { id: 'default', launchActivity: 'default' },
        actions: [{ title: '+30s', pressAction: { id: REST_ADD_ACTION_ID } }],
      },
    });
  } catch {
    // Non-fatal: the in-app timer remains the primary experience.
  }
}

/**
 * Schedule the "Rest complete" heads-up alert at `endsAtMs`. Posted with the
 * same id as the chronometer, so when the OS fires it the ticking notification
 * is replaced (the swap), with no JS needed at T-0. No-op if already past.
 */
export async function scheduleRestComplete(opts: {
  endsAtMs: number;
  sessionId: number;
}): Promise<void> {
  const m = load();
  if (!m) return;
  if (opts.endsAtMs <= Date.now()) return;
  try {
    await ensureRestChannels();
    await m.default.createTriggerNotification(
      {
        id: REST_NOTIFICATION_ID,
        title: 'Rest complete',
        body: "Time to lift. You've got this.",
        data: { endsAtMs: String(opts.endsAtMs), sessionId: String(opts.sessionId) },
        android: {
          channelId: CHANNEL_DONE,
          smallIcon: SMALL_ICON,
          pressAction: { id: 'default', launchActivity: 'default' },
        },
      },
      {
        type: m.TriggerType.TIMESTAMP,
        timestamp: opts.endsAtMs,
        alarmManager: { allowWhileIdle: true },
      },
    );
  } catch {
    // Degrade to chronometer-only rather than throwing.
  }
}

/** Cancel both the ongoing chronometer and any pending completion trigger. */
export async function cancelRest(): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.default.cancelNotification(REST_NOTIFICATION_ID);
  } catch {
    // already gone
  }
  try {
    await m.default.cancelTriggerNotification(REST_NOTIFICATION_ID);
  } catch {
    // already gone
  }
}

/**
 * Read the deadline back from the currently-displayed rest notification (the
 * authoritative cross-process value after a backgrounded +30s). Returns null
 * if there is no rest notification or its data is unreadable.
 */
export async function readDisplayedDeadline(): Promise<number | null> {
  const m = load();
  if (!m) return null;
  try {
    const list = await m.default.getDisplayedNotifications();
    const found = list.find((n) => n.notification?.id === REST_NOTIFICATION_ID);
    const raw = found?.notification?.data?.endsAtMs;
    if (typeof raw !== 'string') return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Fire the "Rest complete" notification immediately — used when the rest timer
 * expires while the app is in the foreground (no trigger was scheduled in that
 * case, so the chronometer-→-done swap never happens at the OS level).
 * No-op on non-Android or when the module is unavailable.
 */
export async function fireRestDoneAlarmForeground(): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await ensureRestChannels();
    await m.default.displayNotification({
      id: `${REST_NOTIFICATION_ID}-done`,
      title: 'Rest complete',
      body: "Time to lift. You've got this.",
      android: {
        channelId: CHANNEL_DONE,
        smallIcon: SMALL_ICON,
        pressAction: { id: 'default', launchActivity: 'default' },
      },
    });
  } catch {
    // Non-fatal — foreground alarm degrades to haptics-only.
  }
}

/**
 * Handle a "+30s" action press (foreground or background, even after process
 * death): extend the deadline carried in the notification data and re-post the
 * chronometer + reschedule the trigger. Returns the new deadline, or null.
 */
export async function handleAddRestAction(
  data: Record<string, string | number | object> | undefined,
): Promise<number | null> {
  if (!data) return null;
  const endsAtRaw = data.endsAtMs;
  const sessionIdRaw = data.sessionId;
  const endsAt = typeof endsAtRaw === 'string' ? Number.parseInt(endsAtRaw, 10) : Number.NaN;
  const sessionId =
    typeof sessionIdRaw === 'string' ? Number.parseInt(sessionIdRaw, 10) : Number.NaN;
  if (!Number.isFinite(endsAt) || !Number.isFinite(sessionId)) return null;
  // Extend from whichever is later: the carried deadline or now (handles the
  // race where +30s is tapped just after T-0).
  const next = extendDeadline(Math.max(endsAt, Date.now()));
  await postRestChronometer({ endsAtMs: next, sessionId });
  await scheduleRestComplete({ endsAtMs: next, sessionId });
  return next;
}
