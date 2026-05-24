---
name: loop-pacing
description: Quick reference for what each /loop iteration should aim for to stay productive within 30 minutes.
---

# Loop pacing — survive the 30-minute window

## Budget (30 min)

- 3 min — read this file + `loop-memory/` + Discord `#task-queue` + audit
- 18 min — implement 6-12 small/medium tasks in parallel where safe
- 5 min — run typecheck/lint/test, commit, push
- 4 min — Discord summary + reactions + slack

## What works

- **Pick small, surgical wins.** A 30-min loop fits ~6–10 focused edits, not one giant refactor. Refactor work spans loops.
- **Run typecheck/lint/test in parallel via `run_in_background`** while writing the next files. Don't block on green.
- **Stage Discord react :+1: BEFORE doing the work.** Easy to forget at the end.
- **Defer image-asset work** (icons, splash images). Can't generate PNGs from this seat; only edit `app.json` config.

## What to skip

- New npm dependencies (high risk of bundle break — see CLAUDE.md harness gap).
- Anything touching `~/Development/531-pwa/` (forbidden — read-only reference).
- Anything in `docs/superpowers/specs/` or `plans/` (forbidden).
- "While I'm here" refactors. Stay on the picked tasks.

## Always-on checks

Before commit, the four-step gauntlet:

```bash
pnpm --filter @fivethreeone/mobile typecheck
pnpm lint
pnpm --filter @fivethreeone/mobile test
# If touched any import graph / route / primitive:
pnpm bundle-check
```

## Forbidden Expo APIs without docs

CLAUDE.md says Expo has changed — fetch SDK 55 docs before touching any Expo plugin / config / import. https://docs.expo.dev/versions/v55.0.0/
