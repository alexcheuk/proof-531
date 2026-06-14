---
name: web-em-dash-debt
description: The apps/web corpus em-dash situation. Prose em dashes swept (option C, tick-8). Remaining: blog sign-off rendering lines + CI guard coverage for apps/web pending WEB-SIGNOFF A/B reply.
---

# Web em-dash debt (found 2026-06-01, tick-2; updated tick-8, Exp 86)

## Status (as of tick-10, Expedition 88) - CLOSED

WEB-SIGNOFF is now fully resolved. Option A auto-proceeded after 9 ticks of silence. See below for what
was done and what the final state looks like. This file is kept for historical reference.

## Original status (tick-8, Expedition 86)

**Option C auto-proceeded** in tick-8 after 6 ticks of silence on the WEB-SIGNOFF escalation
(DOCTRINE: reversible escalations auto-proceed after ~3 ticks). 99+ prose em dashes swept from
`apps/web/src/pages/` and `apps/web/src/components/` using a scoped replacement that:

- Replaced `—` with ` - ` in all prose/comments/strings
- Then normalized double-spaces (`  -  ` -> ` - `) from surrounding spaces
- Preserved placeholder glyphs: `<span class="reps">—</span>`, `<span class="set">—</span>`,
  `dash.textContent = '—'`, `<span style={...}>—</span>` in PhonePlateBar
- Preserved sign-off rendering lines: `— {loggerName}`, `— archived through expedition`,
  `— {scribeFor(featured)}` in blog listing templates (pending A/B decision)

Astro build verified clean. CI check-no-em-dash passes.

## What remains

**Blog A/B question (WEB-SIGNOFF backlog item):** Alex has not yet replied to choose:
- Option A: normalize all blog post sign-offs to ` - Name, Logger of Expedition N` (spaced hyphen)
- Option B: bless the em dash as a sign-off-only exception with a SOUL hard-line carve-out

**Sign-off rendering lines in framework templates** (3 lines preserved in tick-8):
- `apps/web/src/pages/blog/expedition-logs.astro` line 60: `— archived through expedition N`
- `apps/web/src/pages/blog/expedition-logs.astro` line 94: `— {loggerName}, Logger of Expedition N`
- `apps/web/src/pages/blog/index.astro` line 276: `— {scribeFor(featured)}`

These render the sign-off attribution in the listing pages. Once A/B is resolved, normalize
these three lines to match (or carve out).

**CI guard for apps/web:** NOT YET added because the 3 remaining sign-off lines would trigger it.
Add `apps/web/**` to `scripts/check-no-em-dash.sh` only after those lines are resolved.

## The rule for future ticks

**Do NOT run a blind find-replace of `—` on the web corpus.** This tick did a careful scoped
sweep. The placeholder glyphs are:
- `<span class="reps">—</span>` - "no reps" in matrix cells
- `<span class="set" style="color: var(--ink-3);">—</span>` - "no data" in ledger cells
- `dash.textContent = '—';` - plate-calculator "no result" display
- `<span style={...}>—</span>` in PhonePlateBar.astro - caption "no data" glyph

If you need to re-sweep, use the same Python approach: mark placeholders, replace `—` with ` - `,
restore placeholders, then normalize double spaces.

## CI em-dash guard coverage (current as of tick-8, Exp 86)

`scripts/check-no-em-dash.sh` greps for U+2014 and is the enforcement arm of the SOUL hard line.
Its scope:

- `do-work/`, `loop-memory/`, `docs/decision-log.md`: covered from the start.
- `apps/mobile/src/`: swept and added in tick-5 (LOOP-EMDASH-MOBILE).
- `docs/marketing/`: swept (396 violations across 13 files) and added in tick-7 (LOOP-EMDASH-MARKETING).
- `apps/web/**`: swept (prose only) in tick-8 - NOT yet in CI guard (3 sign-off rendering lines remain).

When you sweep a new corpus clean, add it to the script's grep roots and to the SCOPE comment in
the same commit, so the guard and the reality stay in lockstep.
