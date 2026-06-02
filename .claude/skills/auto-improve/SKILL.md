---
name: auto-improve
description: Deprecated alias for the autonomous improvement loop, renamed to /do-work on 2026-06-01. Invoking /auto-improve (directly or under /loop) should redirect to the /do-work skill. Kept as a stub so existing /loop invocations and cron entries that still say "auto-improve" continue to work.
---

# auto-improve (deprecated alias for /do-work)

This skill was renamed. The autonomous improvement loop for the 531 app now lives in the **`do-work`** skill at `.claude/skills/do-work/SKILL.md`.

If you reached this stub (a `/loop /auto-improve` or a cron entry that still uses the old name), invoke the `do-work` skill and follow it instead. Everything the old loop did (read Discord `#task-queue` and `#loop-criteria` pins, pick 12 to 15 substantive items, ship end-to-end, commit and push, post the `#auto-improvements` summary, the Verso TTS departure, commission the Expedition field-log) is in do-work, now organized around `do-work/SOUL.md`, `do-work/DOCTRINE.md`, and the work-graph at `do-work/work/backlog.md`, with proof-by-type and a scoped self-edit gate.

The migration is recorded in `docs/decision-log.md` and the ADR in `do-work/DOCTRINE.md`. This stub can be removed once no caller references the old name.
