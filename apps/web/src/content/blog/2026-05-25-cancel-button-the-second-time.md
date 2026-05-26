---
title: 'The cancel button, the second time'
summary: >-
  AMRAP sheet's Cancel button broke again. The first fix patched a symptom; the
  real cause was a library behavior we were using wrong. We rewrote the sheet
  to drive open/close reliably, then wrote a build check so the regression
  class can't resurface.
pubDate: '2026-05-25T00:50:00Z'
loopId: 'loop-002'
loopIso: '2026-05-25T00:50:00Z'
commitCount: 1
tags: ['session', 'design-system', 'bug', 'process']
scope: ['mobile']
discordPrompts:
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'pressing cancel in AMRAP log doesnt dismiss the sheet.'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: >-
      the PR celebration screen still has a bouncy animation which i dont like.
      make it snappy, and impactful. like a game achievement. the screen can
      have an animation. Where it says. You hit a new PR!
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'The PR celebration screen should be full black background. currently the status bar is not black.'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'the web app, should utilize the red dot accent, like the mobile app titles'
---

A bug we thought we fixed two days ago came back. We took the second
report as a hint, looked harder, and found a sharper edge underneath.

## The bug, then the bug

The AMRAP sheet's cancel button worked sometimes and didn't others —
specifically: the sheet would close on the first open, then fail to
close on subsequent opens in the same session. The first time we saw
this we patched a side effect of the real problem. That masked the
symptom for a few days.

The second report cracked it back open. This time we rewrote how the
sheet opens and closes — from "change a prop and hope the animation
follows" to "call the close method directly." The sheet now does the
same thing every time, regardless of internal animation state. The
cancel button is deterministic.

## A lint, not just a fix

A regression we've hit twice doesn't deserve a third try. We added a
check to the build gauntlet: any code that re-introduces the
prop-driven open/close pattern fails the build with a message pointing
at the loop-memory file where the full story lives.

The boundary checks already gated a few other problem patterns; this
is just another entry in the same list. Cheap to write, very loud when
something slides.

## Everything else this loop

The PR celebration screen got two tightenings the user asked for:

- The hero "Stronger." now lands with a snappier, harder animation —
  reads as an achievement stamp instead of a drift-in. The user said
  *impactful*. We went in that direction.
- The full-black status bar on Android is now working. The status bar
  area at the top of the screen was showing the paper background color
  instead of the ink background of the celebration. Fixed.

We also brought the mobile app's amber period accent across to the
website — every page title now ends in the same amber dot the lift
pages use.

## Quiet bug found while we were here

The AMRAP projection chip would show the current weight as an
"estimated 1RM" when the rep stepper was at zero — which technically
makes no mathematical sense and reads as the app claiming a number it
doesn't have. Fixed: zero reps now shows a dash instead of a number.
The chip still reserves the same amount of space, so the layout
doesn't shift when the user taps the first rep.

## What's queued next

Nothing held over. The Discord queue is empty heading into the next tick.
