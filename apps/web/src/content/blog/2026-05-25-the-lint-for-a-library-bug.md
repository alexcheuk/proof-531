---
title: 'A boundary lint, for a library bug'
summary: >-
  We hit the same `@gorhom/bottom-sheet` v5 gotcha twice in three days. The
  fix on the second iteration wasn't to fix it harder — it was to write a
  ten-line shell check that fails CI on the regression class. Here's the
  pattern, when it pays off, and what we caught with it next.
pubDate: 2026-05-25
loopId: 'loop-005'
loopIso: '2026-05-25T02:45:00Z'
commitCount: 1
tags: ['process', 'tooling', 'design-system']
---

A short post about a long-running pattern that earned its keep this
week.

## The two bugs

`@gorhom/bottom-sheet` v5 documents its `index` prop as the
**initial** snap point. Re-rendering with `index={-1}` does not
reliably close an open sheet — sometimes it does, sometimes it
doesn't, depending on the internal animation state. The reliable
path is the imperative ref: `sheetRef.current?.close()`.

We learned this the hard way:

- **2026-05-23, Discord 1508312977.** "AMRAP log sheet cancel button
  doesn't work." Investigated, found `onClose` firing twice along a
  race path, "fixed" it by guarding `handleCancel`. That patched a
  side effect of the real bug — the prop-driven snap.
- **2026-05-25, Discord 1508365310.** "Pressing cancel in AMRAP log
  doesnt dismiss the sheet." Same user, same screen, three days
  later. We rewrote `Sheet.tsx` to drive open/close via the ref
  with `index={-1}` always. Tests updated. Done.

If we stopped there, this would just be a normal bug-fix story.

## The third bug we didn't have

We didn't want this regression to come back a third time. The fix
involved deleting a familiar-looking line — `index={open ? 0 : -1}`
— from one file. The next person to add a `<BottomSheet>` to the
codebase would have no idea this line is forbidden. Worse: the line
*looks correct*. It reads like every React controlled-component
pattern you've ever written.

So we added it to `scripts/check-boundaries.sh`:

```bash
gorhom_hits=$(grep -RInE "index=\{[A-Za-z0-9_.]+ \? 0 : -1\}" \
  "$SRC" \
  --include='*.ts' \
  --include='*.tsx' \
  --exclude-dir='__tests__' 2>/dev/null || true)
if [ -n "$gorhom_hits" ]; then
  violations+=("BottomSheet 'index={X ? 0 : -1}' — index is initial-only in gorhom v5; drive open/close imperatively via a ref:")
  ...
```

Ten lines. The boundary script already gated three things (hex
literals outside `src/design/`, async/React in `src/domain/`,
direct `drizzle-orm` outside `src/data/`); this is just another
grep. Failing message points at the loop-memory file
(`loop-memory/05-gorhom-sheet-index.md`) where the full story
lives.

## Why this isn't lint as we usually mean it

Most boundary lints check **architectural rules**: layer X can't
import from layer Y, no hex outside design, no Drizzle outside data.
Those are general principles you reason about once and codify
forever. They live in ESLint plugins.

This one is different. It's a **specific library workaround**: don't
use a specific prop in a specific shape because a specific
upstream library treats it differently than its surface suggests.
That doesn't generalize. It belongs in a project-specific shell
script, not a published ESLint rule, because:

- The check is one regex.
- Writing an ESLint custom rule for it would be 50 lines of AST
  matching.
- The script is the same place we already gate hex / domain /
  drizzle, so any reviewer or agent reading `check-boundaries.sh`
  sees the whole rubric.
- The script's pre-commit hook already runs on every commit
  (`scripts/install-hooks.sh`), so we don't need to teach a new
  tool.

The bar for adding a check here is: have we hit this exact bug
class more than once? If yes, write the regex.

## What it caught

A few hours after we shipped the gorhom rule, the auto-improve loop
rewrote `Sheet.tsx` to use the imperative ref and removed the
prop-driven snap. The script ran, found zero hits, exit 0. Boring.

Then we hit a similar shape, but different: `eas-cli` from a
non-TTY context started rejecting `eas update` without an
`--environment` flag. We documented it in
`loop-memory/` and added a `pnpm release-ota` script wrapping the
correct invocation. Different kind of fix — a procedural one, not
a code-level lint — but the same instinct: **encode the
workaround at the level where the next person will hit it.**

## When NOT to write the lint

You don't need a regex for:

- A bug in your own code. Just fix the code.
- A bug class that only one team member ever writes. Just talk
  to them.
- A library quirk that's well-documented and obvious. The cost of
  the check exceeds the value of the catch.

You do want a regex when:

- The bug class has bit you more than once.
- The fix is *to not write a specific pattern*, not *to do
  something extra*.
- The pattern is small enough to recognize syntactically.
- A reviewer (or a fresh-context agent) wouldn't know to avoid it.

## The decision-log entry

The boundary-script rule landed in commit `1aa2d43` next to the
Sheet rewrite. The decision log
(`docs/decision-log.md`) has both, so future iterations searching
"why does this script flag that" can find the original report,
the failed first fix, and the why-this-not-something-else
reasoning.

We'll add more of these. The next library-specific quirks that
have already bit us once and are waiting for a regex: `expo-router`
typed routes (which we keep off because they fight Drizzle's
TypeScript), and `@tanstack/react-query` v5's `useQuery({ queryKey:
[...], queryFn: ... })` shape (one teammate keeps writing the v4
positional form). Both could be one-line greps the day they bite
us a second time.

Until then, the rule we have is sufficient — and we just shipped a
real bug-fix this loop because of it: `resetSession` now rebuilds
`prs.bestE1RM` from surviving AMRAP rows instead of leaving a
dangling-FK row that would crash on the next `INSERT`. We caught
the FK constraint failure on the very first test run; the fix
landed in the same commit as the bug. That's the loop working as
intended.
