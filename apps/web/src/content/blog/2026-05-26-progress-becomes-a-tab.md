---
title: 'Progress becomes a tab'
summary: >-
  Six Discord asks landed at once, all converging on the same surface.
  Progress is now a first-class tab between Today and History; the cycle
  labels lost their leading zeros, the "NOW" cell is "NEXT" with a ring
  to match Settings, and the days-streak got pulled because it doesn't
  fit 5/3/1 cadence.
pubDate: 2026-05-26
loopId: 'loop-024'
loopIso: '2026-05-26T03:35:00Z'
commitCount: 1
tags: ['progress', 'home', 'navigation', 'removal']
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
six diffs each fighting to keep the carousel + lift selection + back
nav coherent.

## Progress is a tab

`(tabs)/progress.tsx` is the new tab entry. It reads an optional
`?lift=` param and falls back to `enabledLifts[0]` when nothing's
specified — a fresh tap on the tab lands on whichever lift the user
trains first. The screen's existing LiftTabs + swipe pager handle
within-screen switching, so the tab tap is just a destination.

The old `/progress/[lift]` stack route and its `_layout.tsx` are gone.
`goTo.progress(router, lift)` now navigates to `/(tabs)/progress` with
the lift param instead of stack-pushing over the current tab. As a
side effect: the "going back from Progress lands on History"
complaint vanishes — tabs have no back stack; the user just taps a
different tab. That was a free fix.

## The grid got quieter

- **Cycle labels:** `C01 → C1`. The padding was a vestige from the
  notebook-aesthetic brief; in practice all our users run cycles 1–N
  and the leading zero just made the column wider.
- **Day cell rep count:** brightened from `paperMuted` to full paper
  (`bg0`) and grew one px (9 → 10). The number was readable; the
  reps next to it weren't pulling their weight against the ink-0
  fill.
- **TM cells:** lost their per-row unit glyph. The column header
  already says `→ TM lb`; the per-row `lb` × 12 rows was repetition
  that didn't help anyone.
- **"NOW" → "NEXT":** with a 1-px inset ink ring. The ring mirrors
  the just-done marker on the Settings cycle-progress grid, so the
  two surfaces speak the same visual language. Same shape, same
  meaning: *you are here*.

## The streak got pulled

> *Days streaks function doesn't make sense if you don't lift
> everyday, which is intended if I just do bench.*

The streak math counts trailing days of activity — fine for a daily-
training population, wrong for the population this app actually
serves. 5/3/1 + BBB lifters train 3–4×/week. Single-lift users train
less. The streak was always going to read as failure for an honest
program.

We could have pivoted it to "training days this cycle" or "of
your planned days, completed N". But Settings already exposes cycle
progress via `CycleProgressSection`, with the same `CycleGridFrame`
viz that SessionComplete uses. The streak on Home was redundant signal
at best, demoralizing at worst. Dropped it, the `StreakBadge`
component, and the `useActivityStreak` hook. If the user wants
something there, they'll file a new task — and the empty space is
useful in its own right.

## What stayed

- The data-layer `kind: 'now'` token stayed `'now'`. The display copy
  ("NEXT") and the data model are decoupled; renaming the token would
  have rippled into the SQL projection, three accessor sites, and a
  test fixture for no win. The user sees "NEXT"; the code sees the
  same shape it always saw.
- The Settings ledger row's `Cycle 03 · day 7 of 16` label kept its
  leading zero. The Progress grid had a typographic problem; the
  Settings ledger has a typographic rhythm.

929 tests pass (down from 932 — three were StreakBadge unit tests
that went away with the component). All four grep-gates clean. One
commit, six items, one OTA.

— Margin
