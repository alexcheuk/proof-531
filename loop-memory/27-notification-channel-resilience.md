---
name: notification-channel-resilience
description: In restChronometer.ts, each createChannel() call in ensureRestChannels() must be independently try/catch wrapped. An uncaught throw on one channel (e.g. bypassDnd unsupported on the device's Android version) propagates out and is swallowed by every caller, silently breaking ALL notifications. The P0 from tick-18, fixed tick-19.
---

# Notification channel resilience (P0, tick-18 to tick-19, Exp 97)

## The codebase fact

`apps/mobile/src/lib/restChronometer.ts` uses `react-native-notify-kit` (Android-only, lazy-required)
and creates three notification channels in `ensureRestChannels()`: `rest-timer-v2`,
`rest-done-v2`, and `rest-done-alarm-v2`. Each `createChannel()` call now has its own
`try { } catch { }`. They are NOT wrapped together.

## Why this matters (the bug)

Tick-18 left the three `createChannel()` calls unguarded. When one call threw (a `createChannel`
option like `bypassDnd: true` is unsupported on some Android versions), the throw propagated out
of `ensureRestChannels()`. Every caller of that function (`postRestChronometer`,
`scheduleRestComplete`, `fireRestDoneAlarmForeground`, `openRestDoneSoundSettings`) wraps its
call in a best-effort try/catch that silently swallows and returns. So a single failing channel
left ALL channels uncreated and killed every rest notification, with no error surfaced. Reported
as a P0 after tick-18; fixed tick-19 by giving each `createChannel()` its own try/catch.

## The durable pattern

When a function makes several independent native-module calls and its callers swallow errors
best-effort, wrap each call individually. A failure on one must not prevent the others from
running, and must not become an invisible all-or-nothing failure upstream. This applies broadly
in `restChronometer.ts`: the legacy `deleteChannel` cleanup loop, `requestPermission`,
`cancelNotification` / `cancelTriggerNotification`, and the reliability reads are all already
per-call guarded for the same reason. Keep new native calls consistent with that.

## Guardrail for future edits

If you touch `ensureRestChannels()` (add a channel, change options, refactor), keep each
`createChannel()` in its own try/catch. Do not consolidate them under a single try block, and do
not rely on a caller's outer catch as the safety net: that is exactly the failure mode this note
records.
