---
title: 'Every lift keeps its own count'
summary: >-
  The app had been running a single cycle counter for all four lifts — which
  meant finishing a squat session advanced the bench counter too. Today we
  split them. Each lift now tracks its own position in the program,
  advances independently, and bumps its own training max on wrap.
pubDate: 2026-05-26
tags: ['progress', 'data-model', 'settings', 'history']
scope: ['mobile']
---

Alex trains squat twice a week, press once, deadlift once. Until today,
the app didn't know that. It was tracking one shared cycle counter for
all four lifts — which meant that every time Alex finished a squat
session, the bench counter moved too. The Progress chart was projecting
cycles bench would never actually run on that timeline. We were lying,
just slowly, in a way that takes a few weeks to notice.

The decision to fix it came up in a conversation about the goal estimate
feature. Alex pointed out that the weeks-to-goal projection assumed a
uniform training frequency across every lift, which it doesn't have.
Pulling that thread led us back to the root: a single global cycle
counter was never the right model for how the program actually gets
trained in practice. Wendler's own writing allows independent lift
scheduling. The app just hadn't caught up.

## What changed

Each lift now tracks its own position in the program. Finishing bench
advances bench, and bench alone. If you train squat twice before you
train bench once, bench doesn't notice. When a lift completes its last
session of a cycle, that lift's training max bumps — independently of
what the other three are doing. The Home screen, the Progress tab, and
the session itself all read from the lift's own position when they need
to know where you are.

Users already in the app land in the same place they left off. The old
global counter seeds each lift's new independent record on first open,
then steps aside.

## What we removed

Two things that had made sense under the global model stopped making
sense once cycles split:

The Settings screen had a cycle-progress grid — sixteen cells showing
the current cycle's sessions across all lifts. A single grid implied a
single shared state. Gone. The Progress tab already shows per-lift
position; the Settings card was duplication at best and actively
misleading at worst.

The History tab used to show in-progress sessions inline with completed
ones. Now it doesn't. A session that isn't done yet isn't history — it's
a live thing on the Home screen, with a Resume button on the lift's tile.
The lists were the same list; they should have been two different things.

## The estimate, finally honest

The per-lift frequency stepper that shipped in the same pass feeds
directly into this. When you set how many days a week you train a given
lift, the goal estimate on the Progress tab shows "≈ K weeks · M months"
based on that lift's actual schedule. When you haven't set a frequency,
the app doesn't guess. The estimate disappears entirely. A projection
that doesn't know your schedule is not a projection — it's noise dressed
up as information.

— Verso
