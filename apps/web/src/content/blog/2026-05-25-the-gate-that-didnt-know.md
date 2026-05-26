---
title: 'The gate that didn''t know'
summary: >-
  Five fixes shipped from one ad-hoc session: a rapid-tap race that sent
  the user Home instead of BBB after AMRAP, the cancel-session feature
  removed end-to-end, plus three PR-celebration / AMRAP-header polish
  passes. The race is the interesting one.
pubDate: '2026-05-25T11:01:21-07:00'
tags: ['session', 'rn', 'bug', 'product']
scope: ['mobile']
discordPrompts:
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: >-
      During a session, if i press All the CTA really quickly, all the
      way to Logging an amrep rep, it does not go to the BBB screen. it
      just goes straight back to the Home screen
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'Remove cancel session feature completely'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: >-
      in AMREP live screen, put the AMREP badge above the "As many reps
      as possible…" line. dont use em dash in the sentence.
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'remove skip to receipt in pr celebration'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'in PR celebration, make you hit a new PR bigger, remove stars.'
---

Five asks. Four were UI. The first one was an integration bug, and
it's the one worth a paragraph.

## The race in the exit gate

"If I press all the CTAs really quickly, all the way to logging an
AMRAP rep, it does not go to the BBB screen. It just goes straight
back to the Home screen."

The Live screen has two things watching the session at the same time.
One routes to the BBB prompt screen after you save your AMRAP reps.
The other is a defensive exit gate — if the session gets deleted or
cancelled from somewhere else while you're mid-rep, it bounces you
home so you don't get stranded on a meaningless mid-session screen.

The trouble is that when you tap fast, the session's "completed"
status lands in the database before the routing effect has a chance
to fire. The exit gate sees "session is complete, this isn't a case
I know to ignore" and sends you home. The BBB routing effect then
fires a tick later and tries to navigate to the BBB screen — but
you're already on Home, and the race is on.

The fix: tell the exit gate about the cases it should ignore.
"I'm routing to BBB" and "I'm routing to the PR celebration" are
both states the exit gate should stand down for. The gate keeps its
job — it still catches "session deleted from another surface" — but
it stops second-guessing the routing logic when the session is
closing normally.

The fast taps mattered because they squeezed multiple steps into
the same render window. On a slow tap, each step had time to settle
before the next one started.

## Cancel session, out

"Remove cancel session feature completely."

Restart wipes the set records and keeps the session going from set 1.
Cancel marked the session abandoned and dropped the user on the home
screen. With Restart available, Cancel was a second destructive option
that read as the same gesture with a confusing nuance between them.

Restart is the only mid-session escape now. Either you're training,
or you're starting this session over. There's no third option.

## The three polish passes

**AMRAP header.** The "AMRAP" badge was inline with the lift title.
It wanted to live with the coaching line instead — stacked above
"As many reps as possible. Push for a PR, leave 1 in the tank." The
badge is now there. Also: the em dash in that sentence is gone. Two
shorter sentences read cleaner than one with a bridge.

**PR celebration.** Two changes. The "Skip to receipt" link is gone
— the screen is a moment, not a junction, and the user can go back
if they really want to skip. And the "YOU HIT A NEW PR" eyebrow grew
up: bigger, no stars, the way a header should behave when it's been
acting like one all along.

## What's queued next

Nothing held over. The cancel feature's gone; the exit gate knows
what to ignore; both screens read the way the user wants them to.
