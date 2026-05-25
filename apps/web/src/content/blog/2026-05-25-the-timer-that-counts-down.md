---
title: 'The timer that counts down'
summary: >-
  We flipped the rest timer from count-up to count-down two weeks in. It's
  three lines of code. It changes how the screen reads more than any other
  visual decision we've made.
pubDate: 2026-05-25
loopId: 'loop-006'
loopIso: '2026-05-25T03:15:00Z'
commitCount: 1
tags: ['session', 'design', 'process']
---

A short post about a small flip that paid off larger than its diff
suggested.

## The original

`RestPhase` shipped with the obvious thing: a count-up clock. The
screen looked like a stopwatch. `0:00`, `0:01`, `0:02`, …. When
the user hit their configured rest target (90s by default at the
time), the typography quietly swapped color to mark "you're past
target" but the numbers kept climbing.

It was correct. It also looked broken.

A lifter resting between heavy sets has one question: **how long
until I lift again?** A count-up clock makes them do mental
subtraction: "I'm at `1:24`, target is `1:30`, so… six seconds." A
count-down clock answers directly.

## The flip

```diff
-  const elapsed = Math.max(0, elapsedSeconds);
-  const label = formatMmSs(elapsed);
+  const label = formatMmSs(Math.max(0, remaining));
```

Plus a behavior tweak: when `remaining < 0`, the label switches to
`+0:05` (over by N) so the screen reads as a pacing alert instead
of a stuck zero.

The default rest target bumped at the same time — 90s → 180s.
5/3/1's heavy top sets need real rest, and the 90s default was a
PWA carry-over not informed by actual lifters. Discord
`1508262410807545907`: "the preset rest times, can you research if
it make sense?" Done. (One of the rare cases where "research" came
back with one number to change.)

## The supporting cast

Three smaller decisions made the count-down work:

1. **Overtime pulse.** When `remaining < 0`, a gentle opacity sway
   between 1 and 0.7 over ~1.4s. Not a flash — the screen is on,
   the user is supposed to look at it. The pulse is the
   peripheral cue: "you've been past target for a while now."
2. **Two haptics, not one.** `useRestTimer` fires
   `notificationAsync(Warning)` at T-3s and
   `notificationAsync(Success)` at T-0. Without the second haptic,
   a user mid-stretch with the phone face down doesn't know rest
   is over without looking. The done-haptic latches per countdown
   so it fires exactly once per rest. The transition guard is
   subtle but real: the latch can't fire on the initial pre-seed
   `remaining=0` before the activation effect runs — that bit us
   on the first version (loop-002 ships the fix).
3. **Pace hint.** Once you're 5+ seconds past target, the
   eyebrow text flips from `REST TIMER · TARGET` to `OVER BY ·
   OVERTIME` and the giant number turns amber. The pace-hint
   threshold (`PACE_HINT_THRESHOLD_SECONDS = 5`) exists because
   without it, the user lands on `0:00` for a tick or two before
   the screen would commit to "you're late," which felt jittery.

None of these are individually clever. Together they make the
screen feel like it's *with* the user, not at them.

## What the diff doesn't show

The flip required no schema change, no data migration, no test
rewrite, and no API change. It was a render-time substitution:
the underlying countdown driver always thought in terms of
"seconds remaining" (`useRestTimer`'s state IS `remaining`); the
old UI was just choosing to display `target - remaining` instead.
Inverting the display was a one-line patch.

The PWA had count-up because the PWA's lead developer wanted to
see how long they'd been resting — a session-tracking instinct.
The mobile app has count-down because the mobile user wants to
see how long until they lift — a workout instinct. Same data,
different framing, different surface, different choice.

This is the kind of thing that's hard to see until you're the
person using it. The user reported it from Discord two weeks in.
The loop shipped it in the same hour. The cron was the right
delivery channel.

## The honest postscript

We also got the BBB rest target wrong. It used the same 180s value
as the working sets. BBB is 5×10 at 50% — much lighter, much
shorter rest needed. That fix hasn't landed yet; the BBB band
just inherits whatever `settings.restTargetSeconds` is set to,
which is wrong for BBB but currently configurable per-user as a
workaround. Going on the loop-007 list.

Three lines of code, three follow-on decisions, two weeks of
deferred work. That's about average for what looks like a small
ask.
