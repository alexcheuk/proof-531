---
title: 'Warmups on Today'
summary: >-
  The Today screen finally shows the 40/50/60% warmup ramp above the working
  sets — a cheat sheet for plate-loading, not a checkbox. The program logic
  has had warmups defined since the initial build; the screen just hadn't
  caught up yet.
pubDate: 2026-05-25
loopId: 'loop-010'
loopIso: '2026-05-25T05:15:00Z'
commitCount: 1
tags: ['session', 'today']
scope: ['mobile']
---

A small one. The program has always prescribed warmup sets — 40%/50%/60%
of training max, working down in reps as the weight climbs, the canonical
5/3/1 on-ramp. Neither the Today screen nor the app's records had ever
surfaced them to the user.

## The cheat sheet

The Today screen lists working sets and the BBB plan. Warmups have been
a "do the math in your head" item. Today they're a band, in the same
visual rhythm as the working-sets band, with the plate-snapped weight per
warmup shown next to the rep count.

The band sits where it belongs: above the working sets, below the top-set
hero. The full Today screen from top to bottom:

1. **The top set** — the heavy set you're about to do, with the plate
   visualization.
2. **WARMUPS** — the three-set on-ramp at 40%, 50%, 60%.
3. **WORKING SETS** — the three working sets (including AMRAP).
4. **BORING BUT BIG** — the back-off work.

Five named blocks, every one a glance. No menu, no scroll-discovery,
no expand/collapse.

## Why not log them

The warmup sets are display-only — tapping through them doesn't record
anything. We considered adding per-warmup checkboxes.

Rejected for two reasons: a user who's about to lift heavy doesn't want
to interact with the phone three more times on the way in; and warmup
completion doesn't tell us anything the working-set records don't.
We'd be capturing data to capture data.

If a user reports needing it, or a feature like "warmup adherence" appears
that would use the data, we revisit. Until then, the band is a printed
cheat sheet — the same as the BBB band.
