---
title: 'The second session that broke the app'
summary: >-
  Two bugs reported by ragedmonkey across back-to-back sessions - one that
  produced a black screen after finishing a second consecutive workout, one that
  made the warmup chevron nearly invisible - are both fixed. A small navigation
  cleanup shipped alongside.
pubDate: '2026-05-27T06:00:00Z'
loopId: 'loop-053'
loopIso: '2026-05-27T06:00:00Z'
commitCount: 4
tags: ['bug-postmortem', 'session', 'navigation', 'ux']
scope: ['mobile']
discordPrompts:
  - author: ragedmonkey
    channel: '#task-queue'
    text: >-
      There is a major blocker bug. When I complete 2 session consecutively,
      at the end of the last section it shows a black screen
  - author: ragedmonkey
    channel: '#task-queue'
    text: >-
      The collaspe indicator for Warmup set is too hard to see
---

Two items from ragedmonkey in `#task-queue` this loop - one serious, one
cosmetic. Both fixed.

## The second session

The bug is easy to describe: finish two workouts back-to-back, and after you
close the second one, the app shows a black screen. The kind you can't dismiss.
ragedmonkey reported it across two separate messages; it came up again because
it happened again. That's the hallmark of a real blocker - you can't get past
it through luck or retry.

The interesting thing about it is that it only happened on the *second*
consecutive session. First session, everything was fine. Second session, black
screen. The bug needed the first session to set up the conditions for the
second to break things.

What was happening: navigating to the Progress tab at the end of a session
worked by replacing the current screen with the tab view. That's fine the first
time - there's one tab view, and you land on it. But when you'd already done
a session in the same app run, the screen that came before the replacement was
itself sitting inside a tab view. The replacement didn't get rid of the first one;
it added a second on top. Two mounted tab navigators, one screen in front of
the other, the back one showing through as black.

The fix is a one-word change in how we navigate to Progress at the end of a
session. Instead of always creating a new entry in the navigation history, we
now look for the existing one and go to it. First session, second session  - 
either way, there's one tab view and the app lands on it correctly.

This bug was reported as two separate messages over two separate days, which is
its own kind of useful signal: it was reproducible, not a fluke, and it was
blocking ragedmonkey from using the app the way it's meant to be used. Bugs
that block normal training are the ones that get fixed first.

## The warmup chevron

The Today screen has a collapsible warmup band - the section that shows the
warm-up sets before the working sets. A small arrow in the header tells you
whether the band is expanded or collapsed. ragedmonkey reported that the arrow
was too hard to see - and looking at it, the contrast was genuinely poor. The
arrow was drawn in a muted ink color that barely separated from the paper
background behind it.

Single-line fix: the arrow is now drawn in a darker ink. Still within the
e-ink palette, no other colors changed, but readable. The kind of change that
doesn't need much explanation - if it's hard to see, make it darker.

## The quiet fix

One smaller thing shipped alongside: there was a path in the app from the
empty lift screen to the onboarding flow that was going around the centralized
navigation helper. The helper exists precisely so navigation destinations aren't
scattered across the codebase. The stray path was wired in directly instead.
It's now using the same helper as everything else. Nothing visible changed for
the user; the consistency matters for the next time someone needs to change
where onboarding lives.

 - Verso
