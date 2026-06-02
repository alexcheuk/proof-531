---
name: prioritization-guardrails
description: Two judgment traps the do-work loop must avoid every tick. A reporting directive must not bend WHAT gets prioritized; do not unilaterally delete intentional-but-unused code. Companion to the SOUL effort bar and the self-edit protocol.
---

# Prioritization guardrails

Two judgment traps the loop has hit and must keep avoiding. Write them down so each tick
does not re-derive them. Companions to `19-self-edit-protocol.md` and the SOUL effort bar.

## A reporting directive must NOT bend WHAT work gets prioritized

A directive about *how to report* (for example "post screenshots of changed screens to
`#auto-improvements`") creates an implicit pull toward screenshot-able, visible work just so
there is something to show. **Resist it.** Reporting conventions are output formatting, never
work-selection inputs.

Prioritize by value. Satisfy a reporting convention only when the chosen work happens to
qualify, and say so plainly when it does not. A non-visual change gets "non-visual change,
no screenshot" in the summary, not a manufactured UI tweak to fill the screenshot slot.

- The trap, concretely: the screenshot directive tempts a visible mobile-app change, but the
  genuinely valuable visual work this tick might be the locked e-ink palette in `docs/DESIGN.md`,
  which is Alex-owned and off-limits to piecemeal re-skinning. The right move is to ship the
  genuine hygiene or correctness slice and note that nothing visually changed. Letting
  presentation distort priorities risks the calm, polished UX that the app is built on.

The same shape applies to the dev-blog: the Expedition log is a pure downstream side-effect of
a tick, written at the Record step. It must never pull the loop toward blog-friendly work.

## Do NOT unilaterally delete intentional-but-unused code - escalate wire-in-or-remove

A code-quality loop's reflex is "dead code -> delete." But **apparently-unfinished feature
code** (built, exported, and plausibly intentional, just not wired up) encodes Alex's product
intent. Deleting it silently loses that signal even though git makes it "reversible."

Distinguish two cases:

- **Dead code** - clearly orphaned or superseded, no plausible future caller. Safe to remove,
  auditor-gated under the self-edit protocol if it touches loop machinery.
- **Unfinished-feature code** - built and exported and plausibly intentional, just not yet
  wired in. Do not touch. Escalate as "wire it in, or remove?" to `#needs-input` and let the
  next tick act on Alex's answer.

When unsure which case you are in, escalate. The cost of an unnecessary escalation is a slip
in `#needs-input`; the cost of a wrong deletion is a lost piece of product intent.

- The trap, concretely: a 531 RN screen or component that exists under `apps/mobile/src/features/`,
  is exported, and renders nowhere (for example a built-but-unwired set-history or PR-detail
  view) reads like work-in-progress for a route not yet linked. File it as a wire-in-or-remove
  decision rather than deleting it.
