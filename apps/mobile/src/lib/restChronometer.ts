import { extendDeadline } from '@/domain/restDeadline';
import type { RestAlarmSound } from '@/domain/types';
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
// V1 channels are deleted in ensureRestChannels (frozen vibration + no bypassDnd at creation).
const CHANNEL_DONE_LEGACY = 'rest-done';
const CHANNEL_DONE = 'rest-done-v2';
// Separate channel because Android freezes a channel's sound at creation:
// the sound choice picks which channel the completion alert posts to.
// This one plays the device's system alarm sound (whatever the user chose
// in their Clock/Sound settings) instead of the notification default.
// V1 channel deleted below (no vibrationPattern / bypassDnd at creation).
const CHANNEL_DONE_ALARM_LEGACY = 'rest-done-alarm';
const CHANNEL_DONE_ALARM = 'rest-done-alarm-v2';
// 3x 2s pulse: the per-channel vibrationPattern is frozen at creation, so bumping
// the channel ID is the only way to apply the new pattern to existing installs.
const DONE_VIBRATION_PATTERN = [0, 2000, 1000, 2000, 1000, 2000];
// Stable Android URI for "the user's chosen default alarm sound"
// (RingtoneManager.getDefaultUri(TYPE_ALARM)). Resolved at play time, so it
// tracks whatever the user picks in system settings.
const SYSTEM_ALARM_SOUND_URI = 'content://settings/system/alarm_alert';
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

/** Channel the completion alert posts to for a given sound choice. */
export function doneChannelId(sound: RestAlarmSound): string {
  return sound === 'alarm' ? CHANNEL_DONE_ALARM : CHANNEL_DONE;
}

export async function ensureRestChannels(): Promise<void> {
  const m = load();
  if (!m) return;
  const { AndroidImportance } = m;
  // Best-effort cleanup of legacy channels so Android settings don't list orphans.
  for (const id of [CHANNEL_TIMER_LEGACY, CHANNEL_DONE_LEGACY, CHANNEL_DONE_ALARM_LEGACY]) {
    try {
      await m.default.deleteChannel(id);
    } catch {
      // never created on this install, or already gone
    }
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
    name: 'Rest complete (chime)',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    vibrationPattern: DONE_VIBRATION_PATTERN,
    bypassDnd: true,
  });
  await m.default.createChannel({
    id: CHANNEL_DONE_ALARM,
    name: 'Rest complete (alarm)',
    importance: AndroidImportance.HIGH,
    sound: SYSTEM_ALARM_SOUND_URI,
    vibration: true,
    vibrationPattern: DONE_VIBRATION_PATTERN,
    bypassDnd: true,
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
  sound: RestAlarmSound;
}): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await ensureRestChannels();
    await m.default.displayNotification({
      id: REST_NOTIFICATION_ID,
      title: 'Resting',
      body: 'Tap to return to your set.',
      // doneSound rides along so the background +30s handler (which has no
      // access to settings) reschedules the completion alert on the right channel.
      data: {
        endsAtMs: String(opts.endsAtMs),
        sessionId: String(opts.sessionId),
        doneSound: opts.sound,
      },
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
  sound: RestAlarmSound;
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
        data: {
          endsAtMs: String(opts.endsAtMs),
          sessionId: String(opts.sessionId),
          doneSound: opts.sound,
        },
        android: {
          channelId: doneChannelId(opts.sound),
          smallIcon: SMALL_ICON,
          pressAction: { id: 'default', launchActivity: 'default' },
        },
      },
      {
        type: m.TriggerType.TIMESTAMP,
        timestamp: opts.endsAtMs,
        // SET_ALARM_CLOCK is the only alarm class Doze and OEM battery
        // managers reliably deliver on time  -  exact-idle alarms can still be
        // deferred by minutes on aggressive firmwares. It needs the exact-alarm
        // permission (USE_EXACT_ALARM, declared in app.json); without it
        // notify-kit silently downgrades to an INEXACT alarm, which is the
        // "rest timer fires late in the background" failure mode.
        alarmManager: { type: m.AlarmType.SET_ALARM_CLOCK },
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
export async function fireRestDoneAlarmForeground(sound: RestAlarmSound): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await ensureRestChannels();
    await m.default.displayNotification({
      id: `${REST_NOTIFICATION_ID}-done`,
      title: 'Rest complete',
      body: "Time to lift. You've got this.",
      android: {
        channelId: doneChannelId(sound),
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
  // Carried on the notification since the headless handler can't reach settings.
  // Falls back to 'alarm' (the DEFAULT_SETTINGS value) for notifications posted
  // by builds that predate the doneSound payload.
  const sound: RestAlarmSound = data.doneSound === 'chime' ? 'chime' : 'alarm';
  // Extend from whichever is later: the carried deadline or now (handles the
  // race where +30s is tapped just after T-0).
  const next = extendDeadline(Math.max(endsAt, Date.now()));
  await postRestChronometer({ endsAtMs: next, sessionId, sound });
  await scheduleRestComplete({ endsAtMs: next, sessionId, sound });
  return next;
}

/**
 * Why the background alert can still be late, per subsystem. `null` = unknown
 * or not applicable (always null on iOS, where the pre-scheduled local
 * notification needs no alarm permission).
 */
export type RestReliability = {
  /** false = Android denied exact alarms → the completion alert drifts under Doze. */
  exactAlarmsEnabled: boolean | null;
  /** true = the OS may throttle the app in the background (OEM battery managers). */
  batteryOptimized: boolean | null;
};

export async function getRestReliability(): Promise<RestReliability> {
  const m = load();
  if (!m) return { exactAlarmsEnabled: null, batteryOptimized: null };
  const result: RestReliability = { exactAlarmsEnabled: null, batteryOptimized: null };
  try {
    const settings = await m.default.getNotificationSettings();
    const alarm = settings.android?.alarm;
    if (alarm === m.AndroidNotificationSetting.ENABLED) result.exactAlarmsEnabled = true;
    else if (alarm === m.AndroidNotificationSetting.DISABLED) result.exactAlarmsEnabled = false;
  } catch {
    // leave null  -  don't render a false warning off a failed read
  }
  try {
    result.batteryOptimized = await m.default.isBatteryOptimizationEnabled();
  } catch {
    // leave null
  }
  return result;
}

/** Opens Android's "Alarms & reminders" special-access screen (API 31+). */
export async function openExactAlarmSettings(): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.default.openAlarmPermissionSettings();
  } catch {
    // best-effort
  }
}

/** Opens the OS battery-optimization exemption screen for this app. */
export async function openBatteryOptimizationSettings(): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await m.default.openBatteryOptimizationSettings();
  } catch {
    // best-effort
  }
}

/**
 * Opens the OS notification-channel settings for the active completion
 * channel, where the user can pick any sound on the device for the alert.
 */
export async function openRestDoneSoundSettings(sound: RestAlarmSound): Promise<void> {
  const m = load();
  if (!m) return;
  try {
    await ensureRestChannels();
    await m.default.openNotificationSettings(doneChannelId(sound));
  } catch {
    // best-effort
  }
}
