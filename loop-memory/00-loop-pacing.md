---
name: loop-pacing
description: How each /loop iteration should be scoped. The cron interval is a cadence, not a deadline  - finish the work properly even if it spans the next cron tick.
---

# Loop pacing  - finish the work, don't watch the clock

## The cadence is not a deadline

The user's `/loop 30m` (or whatever interval) does NOT cap a single iteration. The cron just queues the next iteration; an in-flight iteration is not interrupted, and the next one runs after the current one finishes. So:

- **Pick 12–15 substantive items per iteration when there's work to fill it.** The user stated this explicitly during the active-build phase. The target was set when the codebase had a long backlog and Discord asks landed daily.
- **Steady-state mode (Margin's amendment, loop-012):** when the queue is empty AND the codebase is steady (no recent regressions, no obvious gaps), shipping 2–4 honest items is correct. Forcing 12–15 in a steady-state loop manufactures surface area and inflates the diff without earning it. The cron stays the messenger; the loop is the message. Honest "looked, found nothing in X / Y / Z" beats fake feature inflation. The decision-log entry from loop-012 captures the criteria for switching modes.
- **Don't stop because the wall clock is approaching the interval.** Finish the work. The next tick will run when it can.
- **Don't defer items because "it takes too long".** Tackle items end-to-end, with tests, in this iteration.
- **Don't :+1: an item in `#task-queue` unless you intend to ship it THIS iteration.** :+1: means "tackling now"; :white_check_mark: means "shipped". Acknowledged-for-later is a footgun  - the user has called it out.

If something genuinely can't ship this iteration (e.g. needs a PNG asset you can't generate, or a design spec you have no input for), say so plainly in the Discord summary and don't :+1: it.

## Loop categories (every iteration)

The category list lives in [`loop-criteria.md`](loop-criteria.md)  - read it fresh every iteration. The user edits that file between loops to change what each iteration must cover. With 12–15 items per iteration, hitting at least one of each category is easy.

Plus: every Discord `#task-queue` item the user filed since the last iteration. Acknowledge with :+1: and ship.

## What works

- **Run typecheck / lint / test / bundle-check in parallel via `run_in_background`** while writing the next files. Don't block on green between items.
- **Stage Discord :+1: BEFORE doing the work**, then :white_check_mark: at the end. Easy to forget the second pass otherwise.
- **Sleep ≥0.5s between Discord reaction PUTs.** Back-to-back PUTs return 429 silently and the reaction never lands. Always poll the message back at the end and retry any missing reaction.
- **Aggressive parallelism with the Edit + Write + Bash tools**  - many small files can be touched in a single tool-use block.
- **Audit pass: scan for repeated patterns each iteration.** Three near-identical files is a sign there's a primitive to extract.

## What to skip

- New npm dependencies (high risk of bundle break  - see CLAUDE.md harness gap).
- Anything touching `~/Development/531-pwa/` (forbidden  - read-only reference).
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

## OTA is now CI-handled (expedition 32)

- **Do NOT run `pnpm release-ota` from the loop.** The GitHub Actions workflow
  `.github/workflows/ota.yml` fires on every push to `main` and handles OTA
  automatically. Step 5 of the auto-improve skill no longer has an OTA block.
- CI has the `EXPO_TOKEN` secret. The loop doesn't and shouldn't need it.
- Manual fallback (CI down): `pnpm release-ota` still works but is not the
  normal path.

## Expo SDK 55  - read the docs first

CLAUDE.md says Expo has changed. Before touching any Expo plugin / config / native import, fetch the versioned docs: https://docs.expo.dev/versions/v55.0.0/

## Update loop-memory every iteration

`loop-memory/` is how this loop teaches itself. Every iteration should leave at least one entry better than it found it:

- **When the user corrects you**  - drop the lesson into a memory file the same turn. If the correction contradicts an existing line, rewrite the line (don't append a note next to a wrong claim). The 30m-ceiling correction is the canonical example.
- **When you discover a real bug-class** (hooks-after-return, sheet-onClose-race, Discord 429 silent-drop)  - record it so the next iteration's audit pass can grep for it.
- **When you find a codebase fact worth caching** (new primitive, new accessor, new convention)  - add or update `01-known-codebase.md` instead of re-discovering it next iteration.
- **When an item genuinely cannot ship from this seat**  - record why in `02-pending-assets.md` (or similar) so future iterations don't keep trying.
- **When an anti-pattern repeats across iterations**  - append to the list below. Patterns matter more than incidents.

Practical rule: if the iteration produced a lesson you'd want a fresh-context Claude to know on the next tick, write it. Memory updates ship in the same commit as the code work  - one extra file in `git add`, no separate process.

The memory files themselves:

| File | Purpose |
|------|---------|
| `00-loop-pacing.md` | This file. How to scope iterations + anti-patterns. |
| `loop-criteria.md` | Per-iteration coverage categories. User edits between loops; the skill reads it fresh. |
| `01-known-codebase.md` | Pre-computed codebase facts (primitives, accessors, conventions). |
| `02-pending-assets.md` | Work that can't ship from this seat (image assets, etc.). |

Add new files freely when a topic doesn't fit existing ones  - keep each focused.

## Discord API gotchas

- **Cloudflare 1010 on `urllib`**  - Python `urllib.request` without a
  spoofed User-Agent gets rejected by Cloudflare with `error code: 1010`
  even when the bot token is valid. Either use `curl` (which sends
  `curl/...` UA by default  - that one passes) or set a UA header
  explicitly, e.g. `'User-Agent': 'DiscordBot (https://example.com, 1.0)'`.
- **Reaction PUTs return 204 silently when rate-limited**  - back-to-back
  PUTs hit 429 with no body; the reaction never lands. Always poll the
  message back at end-of-loop and retry any missing reactions.

## Blog pubDate rule (expedition 14)

- **Always use `date -u +"%Y-%m-%dT%H:%M:%SZ"` for blog post `pubDate`.**
  Agent-generated timestamps are guesses and break sort order on the listing
  pages. The verso agent now runs this bash command before writing the file.
  The `commission-expedition-log` skill passes `loopIso` obtained from the
  same command. Don't let the LLM pick a time.

## Expedition number computation bug (expedition 15)

- **Always read at least 1000 characters when scanning for `expedition:` in
  blog post frontmatter.** Some posts have long `summary:` blocks that push
  the `expedition:` field past byte 500. The `grep` command with default read
  window silently misses them. Use Python with `fp.read(1000)` or the
  updated recipe in `auto-improve/SKILL.md`.
  
## `expo-notifications` fingerprint change (expedition 15)

- **Adding `expo-notifications` to the mobile app changes the EAS OTA
  fingerprint.** Existing native builds that matched the prior fingerprint
  will not receive the OTA update. Expo Go testers are unaffected. Note this
  in the Discord summary whenever a native module is added.

## Math.round vs round() in display conversions (expedition 71 + 78)

- **Any code that converts a value from storage units to display units and then shows it to the user must use `round(value, displayU)` from `domain/units`, NOT `Math.round()`.** `Math.round` produces unsnapped integers; `round()` snaps to the plate increment (5 lb / 2.5 kg). The same bug class appeared in expedition 71 (onKindChange), expedition 78 (persistedValue), and the first do-work tick 2026-06-01 (`useGoalState` `defaultValueFor` 1rm-branch seed, `Math.round(currentTm/0.9)` -> `round(currentTm/0.9, displayU)`; that branch is unreachable today so the last one was a latent/consistency fix). Each time the fix is identical. Each loop, check: if you see `Math.round(displayWeight(...))`, `Math.round(convert(...))`, or `Math.round(<a TM/1RM weight>)` anywhere in the features layer, that's the bug. NOTE: `Math.round` on a *volume aggregate* (sum of weight x reps, e.g. `useSessionCompleteData` workingVolume) or a *percentage* (`Math.round(pct*100)`) is correct and NOT this bug: only bar weights a lifter loads get plate-snapped.

## Jest "Force exiting" warning (expedition 77)

- **`expo-notifications` keeps alive an internal timer in the Jest environment.** This causes
  the `Force exiting Jest` + `A worker process has failed to exit gracefully` warning at the end
  of every test run. It is **not caused by our code**  - all 1113+ tests pass cleanly. The warning
  cannot be suppressed without patching `expo-notifications` internals or adding a global
  `afterAll(() => jest.clearAllTimers())` which would interact badly with tests that rely on fake
  timers. **Do not investigate this each loop**  - it is a known, benign, pre-existing issue.

## `jq` not available (expedition 19)

- **`jq` is not installed in the loop environment.** Use Python for all JSON parsing:
  ```bash
  curl ... | python3 -c "import json,sys; data=json.load(sys.stdin); ..."
  ```
  The Discord channel recipes in `discord-channels.md` use `jq`  - mentally substitute the Python pattern above. All other Discord curl recipes are fine; only the JSON parsing step needs Python.

## Public repo cleanup checklist (expedition 20, updated expedition 29)

**Expedition 29 status:** dead `design-reference/` path references cleaned from all contributor docs and skill files. `docs/screenshots/` placeholder directory removed. Internal loop-tracking labels stripped from public ARCHITECTURE.md. Three hardcoded `['squat','bench','deadlift','press']` fallback arrays replaced with `[...LIFTS]`; one `lift === 'squat' || lift === 'deadlift'` check replaced with `LOWER_BODY.has(lint)`. The "design-reference/" ghost is fully exorcised  - don't re-introduce it.

**Expedition 33 status (public repo hygiene for imminent open-source release):** Added GitHub issue templates (bug_report.yml, feature_request.yml, config.yml), PR template (.github/PULL_REQUEST_TEMPLATE.md), and SECURITY.md. Full credential/secret audit passed clean  - no tokens, personal paths, or sensitive URLs in tracked files. All 4 layer CLAUDE.md files exist. License label is correct (Source Available) in web pages and footer. The `_workspace_archive/` is not tracked. All homelab refs in skill files are guarded by optional env vars. The checklist items from expedition 20 are all satisfied.

## Public repo cleanup checklist (expedition 20)

When preparing the repo for public release, check:

- `_workspace_archive/` is gitignored but may be tracked  - run `git ls-files _workspace_archive/` and `git rm -r --cached` if it is.
- Hardcoded personal endpoints (e.g. homelab TTS URLs) in skill files  - replace with `${ENV_VAR:-}` patterns so they're no-ops when not set.
- `git clone <repo>` placeholder in CONTRIBUTING.md  - replace with the actual GitHub URL from `git remote -v`.
- License label in website footer/process  - must match `LICENSE` file (Source Available ≠ MIT).
- Missing CLAUDE.md files referenced in architecture docs  - create them or remove the dead links.
- Hex color literals (`#000`, etc.) in `design/primitives/`  - use `colors.*` tokens instead.

## Anti-patterns observed in past iterations

- **Treating "30m" as a hard ceiling.** It isn't. Six iterations averaged 3–5 items each when the target was 12–15. Fixed in this memory.
- **:+1: + defer.** Acknowledging a Discord ask without shipping it is worse than not :+1:'ing  - the user has to chase it. Don't.
- **Stopping at the first green CI.** That's an excuse to call it done. The real signal is the item list: did we ship 12+ substantive things?
- **Not updating memory after a correction.** If the user has to repeat the same lesson on a future iteration, the memory failed. Always write the lesson down the turn it lands.
- **Skipping `pnpm verify` before commit when the pre-commit hook isn't installed.** The hook at `scripts/install-hooks.sh` is opt-in  - a fresh clone has an empty `.git/hooks/pre-commit`. Loop-016 shipped a red typecheck this way (a discriminated-union widening  - fixture rows typed `'working' | 'amrap'`, added a `kind: 'bbb' as const` row). Loop-017 fixed it. **Always run `pnpm typecheck && pnpm test` at minimum before committing from a loop, even if the diff looks safe.** If `.git/hooks/pre-commit` is empty on a fresh seat, install it first: `bash scripts/install-hooks.sh`.
