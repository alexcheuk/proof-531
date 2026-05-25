---
name: loop-pacing
description: How each /loop iteration should be scoped. The cron interval is a cadence, not a deadline — finish the work properly even if it spans the next cron tick.
---

# Loop pacing — finish the work, don't watch the clock

## The cadence is not a deadline

The user's `/loop 30m` (or whatever interval) does NOT cap a single iteration. The cron just queues the next iteration; an in-flight iteration is not interrupted, and the next one runs after the current one finishes. So:

- **Pick 12–15 substantive items per iteration when there's work to fill it.** The user stated this explicitly during the active-build phase. The target was set when the codebase had a long backlog and Discord asks landed daily.
- **Steady-state mode (Margin's amendment, loop-012):** when the queue is empty AND the codebase is steady (no recent regressions, no obvious gaps), shipping 2–4 honest items is correct. Forcing 12–15 in a steady-state loop manufactures surface area and inflates the diff without earning it. The cron stays the messenger; the loop is the message. Honest "looked, found nothing in X / Y / Z" beats fake feature inflation. The decision-log entry from loop-012 captures the criteria for switching modes.
- **Don't stop because the wall clock is approaching the interval.** Finish the work. The next tick will run when it can.
- **Don't defer items because "it takes too long".** Tackle items end-to-end, with tests, in this iteration.
- **Don't :+1: an item in `#task-queue` unless you intend to ship it THIS iteration.** :+1: means "tackling now"; :white_check_mark: means "shipped". Acknowledged-for-later is a footgun — the user has called it out.

If something genuinely can't ship this iteration (e.g. needs a PNG asset you can't generate, or a design spec you have no input for), say so plainly in the Discord summary and don't :+1: it.

## Loop categories (every iteration)

The category list lives in [`loop-criteria.md`](loop-criteria.md) — read it fresh every iteration. The user edits that file between loops to change what each iteration must cover. With 12–15 items per iteration, hitting at least one of each category is easy.

Plus: every Discord `#task-queue` item the user filed since the last iteration. Acknowledge with :+1: and ship.

## What works

- **Run typecheck / lint / test / bundle-check in parallel via `run_in_background`** while writing the next files. Don't block on green between items.
- **Stage Discord :+1: BEFORE doing the work**, then :white_check_mark: at the end. Easy to forget the second pass otherwise.
- **Sleep ≥0.5s between Discord reaction PUTs.** Back-to-back PUTs return 429 silently and the reaction never lands. Always poll the message back at the end and retry any missing reaction.
- **Aggressive parallelism with the Edit + Write + Bash tools** — many small files can be touched in a single tool-use block.
- **Audit pass: scan for repeated patterns each iteration.** Three near-identical files is a sign there's a primitive to extract.

## What to skip

- New npm dependencies (high risk of bundle break — see CLAUDE.md harness gap).
- Anything touching `~/Development/531-pwa/` (forbidden — read-only reference).
- Anything in `docs/superpowers/specs/` or `plans/` (forbidden).
- "While I'm here" refactors that aren't on the planned list AND aren't a category-required audit. Stay scoped, but the planned list should already be ambitious.

## Pre-commit gauntlet (still required)

Before commit, all green:

```bash
pnpm typecheck
pnpm lint
pnpm test
# If touched any import graph / route / primitive:
pnpm bundle-check
```

If a fail, fix and re-run before committing. Never commit red.

## Expo SDK 55 — read the docs first

CLAUDE.md says Expo has changed. Before touching any Expo plugin / config / native import, fetch the versioned docs: https://docs.expo.dev/versions/v55.0.0/

## Update loop-memory every iteration

`loop-memory/` is how this loop teaches itself. Every iteration should leave at least one entry better than it found it:

- **When the user corrects you** — drop the lesson into a memory file the same turn. If the correction contradicts an existing line, rewrite the line (don't append a note next to a wrong claim). The 30m-ceiling correction is the canonical example.
- **When you discover a real bug-class** (hooks-after-return, sheet-onClose-race, Discord 429 silent-drop) — record it so the next iteration's audit pass can grep for it.
- **When you find a codebase fact worth caching** (new primitive, new accessor, new convention) — add or update `01-known-codebase.md` instead of re-discovering it next iteration.
- **When an item genuinely cannot ship from this seat** — record why in `02-pending-assets.md` (or similar) so future iterations don't keep trying.
- **When an anti-pattern repeats across iterations** — append to the list below. Patterns matter more than incidents.

Practical rule: if the iteration produced a lesson you'd want a fresh-context Claude to know on the next tick, write it. Memory updates ship in the same commit as the code work — one extra file in `git add`, no separate process.

The memory files themselves:

| File | Purpose |
|------|---------|
| `00-loop-pacing.md` | This file. How to scope iterations + anti-patterns. |
| `loop-criteria.md` | Per-iteration coverage categories. User edits between loops; the skill reads it fresh. |
| `01-known-codebase.md` | Pre-computed codebase facts (primitives, accessors, conventions). |
| `02-pending-assets.md` | Work that can't ship from this seat (image assets, etc.). |

Add new files freely when a topic doesn't fit existing ones — keep each focused.

## Discord API gotchas

- **Cloudflare 1010 on `urllib`** — Python `urllib.request` without a
  spoofed User-Agent gets rejected by Cloudflare with `error code: 1010`
  even when the bot token is valid. Either use `curl` (which sends
  `curl/...` UA by default — that one passes) or set a UA header
  explicitly, e.g. `'User-Agent': 'DiscordBot (https://example.com, 1.0)'`.
- **Reaction PUTs return 204 silently when rate-limited** — back-to-back
  PUTs hit 429 with no body; the reaction never lands. Always poll the
  message back at end-of-loop and retry any missing reactions.

## Anti-patterns observed in past iterations

- **Treating "30m" as a hard ceiling.** It isn't. Six iterations averaged 3–5 items each when the target was 12–15. Fixed in this memory.
- **:+1: + defer.** Acknowledging a Discord ask without shipping it is worse than not :+1:'ing — the user has to chase it. Don't.
- **Stopping at the first green CI.** That's an excuse to call it done. The real signal is the item list: did we ship 12+ substantive things?
- **Not updating memory after a correction.** If the user has to repeat the same lesson on a future iteration, the memory failed. Always write the lesson down the turn it lands.
