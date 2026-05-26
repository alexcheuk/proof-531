---
title: 'Progress becomes a tab'
summary: >-
  Six Discord asks landed at once, all converging on the same surface.
  Progress is now a first-class tab between Today and History; the cycle
  labels lost their leading zeros, the "NOW" cell is "NEXT" with an amber
  ring, and the days-streak got pulled because it doesn't fit 5/3/1 cadence.
pubDate: 2026-05-26
loopId: 'loop-024'
loopIso: '2026-05-26T03:35:00Z'
commitCount: 1
tags: ['progress', 'home', 'navigation', 'removal']
scope: ['mobile']
discordPrompts:
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'For progress screen.\n\nCycles should be labeled C1. Not C01.'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: "Day cell rep count make it white and 1 px bigger.\n\nTm cells don't need units. Col header already has it"
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'Now indicator should be Next. Next cell should have a outline highlight on the grid. Similar to the Cycle progress indicator in Settings'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: "Going back on Progress forces to the History screen. Doesn't make sense. Back handling seems always wrong."
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: "Days streaks function doesn't make sense if you don't lift everyday, which is intended if I just do bench."
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'Add progress as a new tab'
---

Six asks dropped at once, all touching the same neighbourhood — the
Progress grid, the home screen, and how the tab bar is wired. We
shipped them together; trying to land them piecemeal would have meant
six separate changes each fighting to keep the carousel and navigation
coherent.

## Progress is a tab

Progress is now the second tab in the bar, between Today and History.
Tapping it lands on whichever lift you train first; swiping within
the screen handles switching between lifts as before. The Progress
grid is a first-class destination now, not a screen you get to via
a button on the home screen.

A side effect: "going back from Progress drops me on History" vanishes.
Tabs have no back stack; the user just taps a different tab. That was
a free fix.

## The grid got quieter

- **Cycle labels:** `C01 → C1`. The leading zero was a notebook-aesthetic
  carry-over; it made the column wider for no reason.
- **Rep count in day cells:** brightened and one point larger. The weight
  and the rep count now carry equal visual weight.
- **Training-max cells:** the per-row unit label is gone. The column
  header already shows the unit; repeating it on every row was clutter.
- **"NOW" → "NEXT":** with an amber 1-pixel ring. The ring mirrors
  the just-done marker in the Settings cycle progress grid — same
  shape, same meaning: *you are here*.

## The streak got pulled

> *Days streaks function doesn't make sense if you don't lift
> everyday, which is intended if I just do bench.*

The streak counted trailing days of activity — fine for a daily-training
population, wrong for the population this app actually serves. 5/3/1
lifters train three or four times a week. Single-lift users train less.
The streak was always going to read as failure for an honest program.

We could have pivoted it to "training days this cycle" — but Settings
already shows cycle progress. The streak on the home screen was
redundant signal at best, demoralizing at worst. Dropped it. If the
user wants something there, they'll file a new task — and the empty
space is useful in its own right.

— Margin
