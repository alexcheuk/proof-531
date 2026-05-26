---
title: 'The timer that counts down'
summary: >-
  We flipped the rest timer from count-up to count-down two weeks in. It's
  three lines of change. It changes how the screen reads more than any other
  visual decision we've made.
pubDate: 2026-05-25
loopId: 'loop-006'
loopIso: '2026-05-25T03:15:00Z'
commitCount: 1
tags: ['session', 'design', 'process']
scope: ['mobile']
---

A short post about a small flip that paid off larger than its diff suggested.

## The original

The rest timer shipped as the obvious thing: a count-up clock. The
screen looked like a stopwatch. 0:00, 0:01, 0:02. When the user hit
their configured rest target, the timer quietly changed color to mark
"you're past target" but the numbers kept climbing.

It was correct. It also looked broken.

A lifter resting between heavy sets has one question: **how long until
I lift again?** A count-up clock makes them do mental subtraction.
A count-down clock answers directly.

## The flip

The underlying timer always thought in terms of "time remaining" —
the display was just choosing to show elapsed time instead. Inverting
it was a three-line change: show remaining, and when remaining hits
zero, show how far over by instead.

The default rest target bumped at the same time — 90 seconds to 3
minutes. 5/3/1's heavy top sets need real rest, and the 90-second
default was a carry-over from the web version, not informed by actual
lifters. (One of the rare cases where "look it up" came back with one
number to change.)

## The supporting cast

Three smaller decisions made the count-down work:

1. **Overtime pulse.** When you're past your target, a gentle opacity
   sway signals that without demanding attention. Not a flash — the
   screen is on, the user is looking at it. The pulse is the
   peripheral cue: "you've been past target for a while now."
2. **Two haptics, not one.** Three seconds before rest ends: a
   warning buzz. At zero: a success buzz. Without the second haptic,
   a user mid-stretch with the phone face down doesn't know rest is
   over without looking.
3. **Pace hint.** Once you're 5+ seconds past target, the eyebrow
   text flips from `REST TIMER · TARGET` to `OVER BY · OVERTIME` and
   the giant number turns amber. Without the 5-second threshold,
   the screen would flicker between states at exactly zero — which
   felt jittery in testing.

None of these are individually clever. Together they make the screen
feel like it's *with* the user, not at them.

## The honest postscript

We also got the BBB rest target wrong. The BBB back-off work uses the
same rest target as the heavy working sets. BBB is much lighter —
shorter rest is the point — but it's inheriting the 3-minute value.
The BBB band just shows whatever the setting says, which is wrong for
BBB but currently the user can work around it by lowering their main
setting. A real fix needs its own setting field. Going on the loop-007
list.

Three lines of change, three follow-on decisions, two weeks of
deferred work. That's about average for what looks like a small ask.
