---
name: self-edit-protocol
description: How the do-work loop changes itself safely. The scoped self-edit gate - which edits commit freely, which must pass the do-work-auditor, and which escalate to Alex. Read before touching SOUL.md, DOCTRINE.md, or the do-work skill.
---

# Self-edit protocol

How the loop changes itself safely. The gate is **scoped**: most self-edits are free, a
named set is auditor-gated, and the constitution waits for Alex.

## What is free vs gated

- **Free (commit directly):** edits to `loop-memory/` learnings and to
  `do-work/work/backlog.md`. These are the loop's working knowledge and its task graph;
  tuning them is the normal job. No gate. Just commit.
- **Gated (auditor must approve):** edits to `do-work/SOUL.md`, `do-work/DOCTRINE.md`, or
  the do-work SKILL itself. These change how the loop behaves or what it is, so they pass
  the `do-work-auditor` before they land.
- **Escalation-class (Alex must bless):** constitution-level changes and one-way doors.
  Even after an auditor APPROVE, a constitution change waits for Alex's blessing in Discord
  `#needs-input` before it is treated as settled.

## The gate procedure (for gated edits)

1. **Draft** the change on disk as a normal diff. Do not commit yet.
2. **Dispatch** the `do-work-auditor` agent with the diff plus a one-line description of
   what it changes and why. The auditor reads SOUL/DOCTRINE and returns a `VERDICT:`.
   - **APPROVE** -> commit the change. Conventional commit; note "self-edit, auditor-approved".
   - **REJECT** -> revise per the stated reasons and re-gate, or drop the change.
   - **ESCALATE** -> it touches the constitution or a one-way call. Post the question to
     `#needs-input` and wait. The next tick reads Alex's answer and acts.
3. **Never** commit a gated self-edit the auditor did not approve. **Never** edit the
   constitution without Alex.

## Why this is safe

All self-edits are git commits, so every change is reversible: by the next audit, by a
later tick, or by Alex directly. The gate is not there to make changes hard; it is there so
that the two things the loop must not quietly drift - its north star (SOUL) and its
operating constitution (DOCTRINE) - cannot move without a second set of eyes.

Minting a new agent or skill follows the same gate **if it changes how the loop behaves**. A
purely additive helper with no behavior change to the loop may skip straight to a normal
commit.

Related: see `docs/INTENT.md` (the separate Alex-owned drift check that SOUL cross-references)
and `20-prioritization-guardrails.md`.
