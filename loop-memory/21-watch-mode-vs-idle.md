---
name: watch-mode-vs-idle
description: Watch-mode is not "work-exhausted." No new directive is not the same as no genuine work. Before the do-work loop holds or idles, it must run a real self-audit; only the absence of confirmed genuine findings justifies a quiet tick.
---

# Watch-mode is not "work-exhausted" - audit before declaring idle

**The failure mode.** A loop can settle into a quiet watch-mode: it concludes that all
non-gated work is *exhausted* and anything left is gated on Alex, so it holds and suppresses
its end-of-tick post. The premise is usually empirically false. A maturing codebase always
carries latent correctness and quality debt; a single honest self-audit pass over
`apps/mobile/` and `apps/web/` will surface real bugs and real quality slices, including
user-facing honesty bugs (a hardcoded fake metric on a screen, an off-by-one in a time helper,
a `Math.round` where the domain wanted banker's rounding) that no new directive announced.

**Why it happens.** "No new `#task-queue` slip" and "all *backlog items* are blocked" are NOT
the same as "no genuine work." The SOUL effort bar already requires every tick to ship at
least one bounded, behavior-preserving code-quality slice and never to coast on a blocker.
Watch-mode is the right tool for suppressing *noise* - do not post "still waiting" every
interval - but it must never become an excuse to stop *looking*.

## How to apply

- Before entering or continuing a quiet tick, run (or have recently run) a real self-audit
  pass. Only the absence of *confirmed genuine findings* - not the absence of new directives -
  justifies holding.
- A blocked lead item means pull the next ready item from `do-work/work/backlog.md`. If the
  backlog looks thin, **AUDIT to refill it**: the audit-to-backlog path is itself the refill
  mechanism. The audit produces new todo items; the next tick works them.
- Suppress per-tick *posts* when genuinely idle, but keep *finding*. Re-arming the loop after
  being offered a pause is a "keep working" signal: resume active work, do not re-enter a
  passive hold.
- Keep the SOUL effort bar honest in both directions: never manufacture busywork, AND never
  declare exhaustion without having looked. Adversarial verification on each finding (is it
  real? is the fix safe? is there genuine value?) is what keeps an audit from degrading into
  busywork of its own.

Related: `20-prioritization-guardrails.md` and `19-self-edit-protocol.md`.
