# Android live rest-countdown notification

**Date:** 2026-05-28
**Status:** Design approved, pending spec review
**Author:** brainstorming session (Alex + Claude)

## Summary

Give the rest timer a clock-app-style **live countdown notification on Android**: when
the user backgrounds the app during a rest period, an ongoing notification appears and
counts down on its own (OS-rendered chronometer). At zero it swaps to a heads-up "Rest
complete" alert with sound and vibration. The notification offers a **+30s** action and
opens the live session screen when tapped. iOS keeps its existing behavior (a single
scheduled "Rest complete" notification at T-0).

This depends on leaving Expo Go (already done) and adopting `react-native-notify-kit`,
the maintained, New-Architecture successor to the now-archived `@notifee/react-native`.

## Goals

- Android: a live, OS-ticked countdown notification while the app is backgrounded during rest.
- The countdown is accurate with zero JS running (uses the Android chronometer).
- At T-0: the ticking notification is replaced by a heads-up "Rest complete - time to lift"
  alert (sound + vibration) that stays until dismissed.
- A **+30s** action that extends the running rest and stays in sync with the in-app timer,
  working even after the app process has been killed.
- Tapping the notification opens the app on the live session screen.
- The in-app timer remains the experience while the app is foregrounded; the notification
  only appears when backgrounded.

## Non-goals

- iOS live countdown / Live Activities (ActivityKit). iOS keeps the existing single
  scheduled "Rest complete" notification. Deferred.
- A "Skip / next set" notification action. Only tap-to-open and +30s ship in v1.
- A foreground service. Approach B (below) avoids it deliberately.
- Surviving an app *kill* for the in-app timer state beyond what the posted notification
  already carries.

## Requirements (decisions locked in brainstorming)

| Decision | Choice |
|---|---|
| Dependency | `react-native-notify-kit` (notifee successor; New Arch; Expo config plugin; drop-in notifee API) |
| iOS | Keep current behavior (existing scheduled "Rest complete" at T-0). No live countdown. |
| At T-0 (Android) | Swap the ticking notification to a heads-up "Rest complete" alert (sound + vibration); stop ticking; stay until dismissed. |
| Interactions | Tap → open live screen. `+30s` action that extends rest and stays in sync. |
| Architecture | **B**: ongoing chronometer notification + scheduled timestamp-trigger alert, same notification id for the swap. No foreground service. |

## Architecture (Approach B)

The live countdown is the Android **chronometer** notification: the system renders and
ticks `timestamp - now` itself, so it stays correct with no JS running. A separate
**timestamp-trigger** notification fires at the deadline as the "Rest complete" alert.
Both are posted with the **same notification id (`"rest"`)**, so the trigger *replaces*
the ticking notification at T-0 - that is the swap, achieved by the OS with no JS needed.

### Single source of truth: the rest deadline

`endsAtMs` (absolute wall-clock ms) is the one source of truth. It already exists in
`sessionRuntime` (the in-memory rest snapshot) and anchors the in-app `useRestTimer`
(deadline-based since the 2026-05-28 wall-clock fix).

The cross-process carrier is **the notification's own `data` payload**: every posted
rest notification carries `{ endsAtMs, sessionId }`. Android keeps a posted notification
across process death, so the background +30s handler and the foreground re-sync can both
recover the deadline from the notification itself - no DB migration, no extra persistence.

### Components & boundaries

```
src/domain/restDeadline.ts            NEW, pure. addRestTime(endsAtMs, stepMs),
                                      remainingMs(endsAtMs, now), isExpired(endsAtMs, now).
                                      Property-tested. No React / async / I/O.

src/lib/restChronometer.ts            NEW. Android-only notify-kit wrapper (side effects):
                                      ensureChannels(), requestPermission(),
                                      postRestChronometer({endsAtMs, sessionId}),
                                      scheduleRestCompleteTrigger({endsAtMs, sessionId}),
                                      cancelRest(), readDeadlineFromDisplayed().
                                      Lazy-requires react-native-notify-kit; no-ops off Android.
                                      (Mirrors the existing restNotification.ts guard pattern.)

src/lib/restNotification.ts           KEEP. iOS path unchanged (expo-notifications scheduled
                                      "Rest complete" at the deadline).

src/features/session/hooks/
  useRestNotification.ts              REWRITE. Orchestrator keyed on Platform x AppState x
                                      rest-active:
                                        iOS     → existing schedule-at-deadline behavior.
                                        Android → on background: post chronometer + schedule
                                                  trigger; on foreground: recover endsAtMs
                                                  from the displayed notification, sync the
                                                  in-app timer, cancel the chronometer.

  restNotificationActions.ts          NEW, pure-ish decision helper: given
                                      (platform, prevAppState, nextAppState, restActive)
                                      → which side-effect to run. Unit-tested.

src/app/_layout.tsx                   EDIT. At module scope: register
                                      notifee.onBackgroundEvent (handles +30s after process
                                      death; routes taps) and ensure channels exist.
                                      Cold-start tap routing via getInitialNotification().
```

Boundary rules respected: pure math in `domain/`, native side-effects in `lib/`,
orchestration in `features/`, registration/routing in `app/`. Import direction stays
`app → features → (design | data | domain)` with `lib` as a leaf utility.

## Data flow

- **Foreground + resting:** in-app `useRestTimer` only. No notification posted.
- **Foreground → background while resting:** post the ongoing chronometer
  (`showChronometer: true`, `timestamp: endsAtMs`, `chronometerDirection: 'down'`,
  `ongoing: true`, channel `rest-timer`, id `"rest"`, `data: { endsAtMs, sessionId }`,
  `+30s` action, press action → live screen) **and** schedule a timestamp-trigger
  "Rest complete" alert at `endsAtMs` (channel `rest-done`, **id `"rest"`**) so it
  replaces the ticking notification when it fires.
- **+30s from the notification (backgrounded, even after process death):** the
  background handler reads `endsAtMs` from the pressed notification's `data`, applies
  `addRestTime`, re-posts the chronometer with the new timestamp, and reschedules the
  trigger. No in-memory dependency.
- **Background → foreground:** recover `endsAtMs` from the displayed notification's
  `data` (authoritative), sync `useRestTimer`'s deadline, then cancel the chronometer.
  The in-app timer resumes seamlessly. If rest already ended while away, the in-app
  timer's wall-clock already shows done and the "Rest complete" notification stays until
  dismissed.
- **+30s in-app (foreground):** updates `endsAtMs` in `sessionRuntime` + the timer
  (existing path). No notification is shown while foregrounded, so nothing else to do.
- **Tap (any state):** route to `goTo.live(sessionId)`; cold start reads
  `getInitialNotification()`.

## Native integration

- Add `react-native-notify-kit`; add its Expo config plugin to `app.config.ts` `plugins`.
  Native module → requires a **dev-client rebuild** (`pnpm build:dev`) and a new
  production build. Cannot run in Expo Go or hot-reload in.
- **Channels:** `rest-timer` (LOW importance, silent, no vibration) for the chronometer;
  `rest-done` (HIGH importance, sound + vibration) for the alert. The swap re-posts id
  `"rest"` onto `rest-done`.
- **Permissions:** plugin adds `POST_NOTIFICATIONS` (Android 13+ runtime prompt; requested
  on first rest; denial degrades to in-app-only). Declare `USE_EXACT_ALARM` so the T-0
  trigger is on time (inexact alarms can fire minutes late). `USE_EXACT_ALARM` is
  install-granted for timer/alarm apps - a Play-review note, but a rest timer qualifies.
- **Handlers:** `onBackgroundEvent` (module scope in `_layout.tsx`) for +30s after process
  death and tap routing; `onForegroundEvent` for foreground taps; `getInitialNotification()`
  for cold-start taps.
- If notify-kit needs Android SDK/JDK alignment, pair with `expo-build-properties` (only
  if a build surfaces the need).

## iOS

Unchanged. `restNotification.ts` keeps scheduling the single "Rest complete"
expo-notifications local notification at the deadline. notify-kit is never called on iOS.

## Error handling

- Permission denied / non-Android / notify-kit unavailable → silent no-op. The in-app
  timer is always the primary, complete experience.
- Trigger scheduling failure → degrade to chronometer-only (no late surprise alert)
  rather than throwing.
- +30s pressed at the exact T-0 moment (race): handler is idempotent - if the deadline is
  already expired it re-posts a fresh chronometer from `now + step` and reschedules.
- Same-id swap is standard Android behavior but will be confirmed on-device (see testing).

## Testing & verification

- **TDD** on `src/domain/restDeadline.ts`: unit + `fast-check` property tests
  (red → green → commit).
- **Unit-test** `restNotificationActions.ts` (pure decision table over platform/AppState/phase).
- **Mock** `react-native-notify-kit` (jest manual mock under `__mocks__/`) so all suites
  import cleanly and stay green.
- **Component tests** assert behavior with notify-kit mocked (e.g. backgrounding while
  resting calls `postRestChronometer` with the right deadline; foregrounding cancels).
- **Native behavior is manual-only** (cannot run in CI / Expo Go). Device checklist:
  1. Start a session, log a set → rest begins.
  2. Background the app → live countdown notification appears and ticks.
  3. Lock the screen → it keeps ticking.
  4. Tap **+30s** → countdown jumps +30s; return to app → in-app timer matches.
  5. Let it reach 0 while backgrounded → heads-up "Rest complete" replaces it with
     sound + vibration; stays until dismissed.
  6. Tap the notification → app opens on the live session screen.
  7. Force-kill the app mid-rest → notification survives and keeps ticking; +30s still
     works; T-0 alert still fires.
  8. Deny notification permission → no notification, in-app timer still works.
- **CI** (`pnpm run ci` + bundle-check) stays green with notify-kit mocked. Native
  resolution is verified by the dev-client build, not CI.
- Rebuild the dev client (`pnpm build:dev`) before manual testing.

## Files touched

- `apps/mobile/package.json` (+ `react-native-notify-kit`)
- `apps/mobile/app.config.ts` (config plugin)
- `apps/mobile/src/domain/restDeadline.ts` (new)
- `apps/mobile/src/domain/__tests__/restDeadline.test.ts` (new)
- `apps/mobile/src/lib/restChronometer.ts` (new)
- `apps/mobile/src/features/session/hooks/useRestNotification.ts` (rewrite)
- `apps/mobile/src/features/session/hooks/restNotificationActions.ts` (new) + test
- `apps/mobile/src/features/session/hooks/__tests__/useRestNotification.test.ts` (update)
- `apps/mobile/src/app/_layout.tsx` (register handlers + channels + cold-start routing)
- `apps/mobile/__mocks__/react-native-notify-kit.ts` (new)
- `CLAUDE.md` (note notify-kit in stack), `docs/decision-log.md` (entry)

## Open risks

- `react-native-notify-kit` is young (since Apr 2026, fast release cadence). Mitigation:
  drop-in notifee API, isolated behind `restChronometer.ts`, easy to swap.
- Same-id trigger replacement of an ongoing notification - confirm on-device.
- `USE_EXACT_ALARM` Play-policy posture for store submission.
- React peerDep nuance across the notifee forks (Expo pins React 19.2.0); notify-kit's
  peer is broad (`expo:*`, `react-native>=0.73`), expected fine - verify at build.
