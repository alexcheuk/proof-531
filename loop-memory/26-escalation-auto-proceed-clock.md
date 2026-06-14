---
name: escalation-auto-proceed-clock
description: How the 3-tick auto-proceed clock on reversible escalations actually works, and the failure mode that stalled WEB-SIGNOFF for 9 ticks. Count from the first silent tick on the whole question, and do not let a multi-part decision keep resetting the clock.
---

# Escalation auto-proceed clock (found 2026-06-13, tick-10, Expedition 88)

DOCTRINE: reversible-but-notable escalations auto-proceed after roughly 3 silent ticks; only
truly irreversible ones wait for Alex. The intent is that the loop never stalls on a reversible
call. WEB-SIGNOFF violated the spirit of this: it sat blocked across many ticks before resolving.

## The failure mode

WEB-SIGNOFF (the blog em-dash sign-off convention) was one reversible question, but it was
phrased as a multi-part decision (a placeholder/prose sweep, then an A/B convention choice). Each
part was treated as a fresh escalation, so the auto-proceed clock kept resetting:

- tick-2: posted the escalation.
- tick-8: Option C auto-proceeded after 6 silent ticks (already double the threshold).
- tick-10: the A/B convention finally auto-proceeded after 9 silent ticks.

The net effect: a reversible call kept real work parked for far longer than ~3 ticks, which is
exactly what the threshold exists to prevent.

## The rule for future ticks

1. **Start the clock on the first silent tick for the whole question, not per sub-part.** If an
   escalation has several sub-decisions, they share one clock. Splitting it does not buy more
   waiting.
2. **At the ~3-tick mark, pick the reversible default and proceed.** State the assumption in the
   commit and the tick summary ("Option X auto-proceeded after 3 silent ticks"), and leave the
   door open for Alex to override later (everything is a git commit, so it is reversible).
3. **If you find yourself past tick 4 still blocked on a reversible escalation, that is a bug.**
   Resolve it this tick. Do not carry it forward again.
4. Only truly irreversible / external actions (publish, store submit, one-way doors) keep waiting
   indefinitely. See DOCTRINE autonomy line and `19-self-edit-protocol.md`.
