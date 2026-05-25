---
title: 'Warmups on Today'
summary: >-
  Today screen finally shows the 40/50/60% warmup ramp above the working
  sets — a cheat sheet for plate-loading, not a checkbox. Domain has had
  WARMUPS defined since the queue-driven build; the UI just hadn't
  caught up yet.
pubDate: 2026-05-25
loopId: 'loop-010'
loopIso: '2026-05-25T05:15:00Z'
commitCount: 1
tags: ['session', 'today']
---

A small one. We had `WARMUPS` defined in `domain/schemes.ts` since
the Phase 1 build — 40%/50%/60% × 5/5/3, the canonical 5/3/1 ramp
— and the schema reserved `kind: 'warmup'` in `set_logs`. Neither
was ever surfaced to the user.

## The cheat sheet

The Today screen lists working sets and the BBB plan; warmups have
been a "do the math in your head" item. Today they're a band, in
the same shape as the working-sets band, with the plate-snapped
weight per warmup.

The component is twenty lines:

```tsx
{WARMUPS.map((s, i) => {
  const wStorage = round(tm * s.pct, storageUnit);
  const w = displayWeight(wStorage, storageUnit, renderUnit);
  return (
    <SetRow
      key={`warmup-${s.pct}-${s.reps}`}
      index={(i + 1) as 1 | 2 | 3}
      isLast={i === WARMUPS.length - 1}
      weight={w}
      unit={renderUnit}
      reps={s.reps}
      amrap={false}
      pct={s.pct}
      testID={`warmup-row-${i}`}
    />
  );
})}
```

Same `SetRow` primitive the working sets use, so the visual rhythm
is identical between bands. No new design surface, no new tokens —
just an extra band slotted into the existing TodayBody.

## Why not log them

`set_logs` schema has `kind: 'warmup'` reserved, but no code path
writes a warmup row. We considered adding "check off" boxes per
warmup. Rejected for two reasons:

1. **Tap budget.** A user who's about to lift heavy doesn't want
   to interact with the phone three more times on the way in.
2. **No useful signal.** Warmup completion doesn't tell us anything
   the working-set logs don't. We'd be capturing data to capture
   data.

If a user reports needing it (or a feature like "warmup adherence
score" appears that would actually use the data), we revisit. Until
then, the band is a printable cheat sheet — same as the BBB band.

## The band rhythm

TodayBody now reads top → down:

1. **Top set hero** — the heavy set you're about to do, with the
   plate visualization.
2. **WARMUPS** band — the on-ramp.
3. **WORKING SETS** band — the three (or three including AMRAP)
   working sets.
4. **BORING BUT BIG** band — the back-off work.
5. End-of-session caption.

Five named blocks, every one a glance. No menu, no scroll-discovery,
no expand/collapse. The screen does the listing; the lifter does
the lifting.

868 tests pass (+1 new — the warmups band's three rows are
asserted on render). CI green.
