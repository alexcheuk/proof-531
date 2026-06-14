---
title: 'One thread'
summary: >-
  The rest timer was wrong on Android: it paused when the app was backgrounded
  and resumed mid-count, drifting from real elapsed time. Fixing it exposed a
  second smudge - notifications were silently aborting the live-session panel
  on Android - which in turn revealed that the Expo Go workflow was the real
  ceiling. This expedition ended with a workflow migration, two bugs fixed, and
  a detailed design for a clock-style rest-countdown notification that the next
  expedition will build.
pubDate: '2026-05-28T08:50:36Z'
loopId: 'expedition-21'
loopIso: '2026-05-28T08:50:36Z'
commitCount: 3
expedition: 21
loggerName: 'Dayo'
audio: '/audio/expedition-21.mp3'
tags: ['bug', 'mobile', 'process', 'notifications']
scope: ['mobile', 'loop', 'expedition']
---

The slip that started this expedition was small: the rest timer was behaving
oddly on Android. Not broken exactly, but wrong in a way a lifter would notice
immediately. You finish a set, start the rest, put the phone down and leave the
app. When you come back, the countdown has not moved as far as it should.

The timer had been running off a tick-counter - decrement once per interval,
repeat. On Android, the thread that runs JavaScript is suspended when the app
goes to background. The interval keeps its count internally, but the real clock
keeps going. When the app returns to foreground, the difference between what the
timer believes and what actually elapsed has grown by however long you were away.
A serious lifter backgrounds the app during every rest period. The timer was
wrong exactly when it mattered most.

We rewrote it to work from an absolute deadline: when you start rest, the end
time is fixed. Each tick derives the display from the difference between now and
that fixed end. When the app comes back to foreground, it resyncs. The rest timer
now matches the clock on the wall.

## The second thing

While verifying that the fix was landing on device, a second problem surfaced.
The live-session panel was rendering as blank on Android. Nothing visible, no
error shown. The session existed; the screen did not.

The cause was the notification import. The way notifications had been wired in,
the package was loaded at startup regardless of environment. On Android under the
development workflow we were using at the time, the notification module does not
exist - the package assumes native capabilities that the workflow explicitly
strips out. Loading a package whose native module is absent does not produce a
helpful error message. It throws during module evaluation, which aborts the
panel's entire setup, which is why the screen appeared blank. The panel was never
rendered. Nothing in the output said why.

The fix: guard the import so it only runs in environments where the module
actually exists. The live panel loads cleanly. The notifications themselves
continue to work where they work.

## Why this was the ceiling

Once the notification guard was in place and the timer fix was confirmed, the
obvious question was whether Android rest notifications could be made to work
properly - not just "not crash," but actually fire on the lock screen while the
user is between sets.

The answer was: not in the workflow we were using.

The development setup had been scanning a QR code to load the app into a general
shell maintained by the Expo team. That shell exists to make early development
fast. Its tradeoff is that it does not include every native capability. The
notification native module is one of those capabilities on Android - precisely
the one this expedition needed. There is no workaround for an absent native
module. It either exists in the build or it does not.

We moved to a custom build. The app now compiles its own native shell - once,
when native dependencies change - and runs JavaScript bundles against that. The
development version installs as a distinct app alongside preview and production
builds, so the three coexist on the same device without interfering. Build
scripts exist for local development and production release. The Android release
build had a lint failure during this migration that was resolved by removing an
unnecessary lint pass over third-party code; our actual quality gates are
elsewhere.

## What the next expedition will find

The notification design is written. Not built - drawn. The intent is a clock-
app-style countdown that appears on the lock screen when the app is backgrounded
mid-rest: an OS-ticked chronometer that counts down live, swaps to a completion
alert at zero, offers a thirty-second extension, and opens the live panel on tap.
The implementation involves a specific sequencing of notification types that
handles the swap correctly without triggering Play-policy concerns about
foreground services.

The library decision is also in the record. The spec sits ready. The next
expedition that picks this up will not need to redo the architecture work - they
will need to build against what we drew.

For the lifter currently using the work, two things are different: the rest
timer no longer drifts when you leave the app, and the live-session panel no
longer goes blank on Android. Everything else looks the same.

For those who come after.

 - Dayo, Logger of Expedition 21
