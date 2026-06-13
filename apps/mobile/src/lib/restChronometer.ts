import { extendDeadline } from '@/domain/restDeadline';
import { Platform } from 'react-native';

// notify-kit lazy-required and Android-guarded so the iOS bundle never loads the native module.
// Notification data payload carries the deadline so it survives process death (cross-process +30s sync).

const REST_NOTIFICATION_ID = 'rest';
// Versioned id: Android freezes a channel's importance at creation time, so an
// existing install would keep the old LOW channel forever. Bumping the id forces
// a fresh channel at the new DEFAULT importance. The previous 'rest-timer'
// channel is deleted in ensureRestChannels so settings don't show a stale dupe.
const CHANNEL_TIMER_LEGACY = 'rest-timer';
const CHANNEL_TIMER = 'rest-timer-v2';
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
  // Best-effort cleanup of the pre-v2 LOW channel so Android settings don't list
  // an orphaned "Rest timer" entry alongside the new one.
  try {
    await m.default.deleteChannel(CHANNEL_TIMER_LEGACY);
  } catch {
    // never created on this install, or already gone
  }
  await m.default.createChannel({
    id: CHANNEL_TIMER,
    name: 'Rest timer',
    // DEFAULT (not LOW) keeps the ongoing countdown out of the shade's "Silent"
    // group. DEFAULT plays a sound on first post; the chronometer sets
    // onlyAlertOnce so it dings once when a rest starts, not on every OS tick.
    // vibration stays off to match the app's quiet gym-timer feel.
    importance: AndroidImportance.DEFAULT,
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

// Same id as the chronometer  -  the OS replaces the ticking notification at T-0 with no JS needed.
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

// Used when rest expires in the foreground  -  no trigger was scheduled, so the OS swap never fires.
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
    // Non-fatal  -  foreground alarm degrades to haptics-only.
  }
}

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
