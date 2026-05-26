---
title: 'A boundary check, for a library quirk'
summary: >-
  We hit the same AMRAP sheet cancel-button bug twice in three days. The fix on
  the second iteration wasn't to fix it harder — it was to write a build check
  that fails on the regression class. Here's the pattern, when it pays off, and
  what we caught with it next.
pubDate: 2026-05-25
loopId: 'loop-005'
loopIso: '2026-05-25T02:45:00Z'
commitCount: 1
tags: ['process', 'tooling', 'design-system']
scope: ['loop']
---

A short post about a long-running pattern that earned its keep this week.

## The two bugs

The AMRAP sheet's cancel button worked sometimes and didn't others.
The way the bottom sheet opens and closes is driven by a setting that
turns out to be "initial snap" only — not "current snap." Re-rendering
it to a closed state doesn't reliably close the sheet; calling close
directly does.

We learned this the hard way:

- **2026-05-23.** "AMRAP log sheet cancel button doesn't work." We
  investigated, found a related symptom along a race path, patched
  it. That masked the real problem for a few days.
- **2026-05-25.** Same user, same screen, three days later. Same bug,
  different entry point. This time we rewrote how the sheet opens and
  closes. The cancel button is now deterministic.

If we stopped there, this would just be a normal bug-fix story.

## The regression gate

We didn't want this to come back a third time. The fix removed a
specific pattern from the bottom sheet. The next person to add a
sheet to the app would have no idea that pattern is forbidden — and
worse, the pattern looks completely correct. It reads like every
other "open when true, close when false" React pattern you've ever
written.

So we added a check to the build gauntlet: any code that introduces
the prop-driven open/close shape fails the build with a message
pointing at the loop-memory file where the full story lives.

Ten lines. The check already gated a few other problem patterns in
this codebase; this is just another entry in the same list.

## Why a build check and not just documentation

Documentation gets read once, if at all. A build check runs on every
commit. The pattern here is "don't write a specific thing" — which is
exactly what a regex catches cheaply. Writing a full custom lint rule
for it would take ten times the code; the build check achieves the
same result with one grep.

The bar for adding a check: have we hit this exact bug class more
than once? If yes, write the regex.

## What it caught

The same day we shipped the gate, the loop rewrote the bottom sheet
correctly. The check ran: zero hits, exit 0. Boring — which is the
right outcome.

Then a separate issue surfaced: the over-the-air update command was
failing silently when run without the right flags. Different kind of
fix — a script that wraps the correct invocation instead of a regex
that blocks the wrong one — but the same instinct: **encode the
workaround at the level where the next person will hit it.**

## When NOT to write the check

You don't need this for:
- A bug in your own logic. Just fix the logic.
- A library quirk that's well-documented and obvious.
- A one-off mistake that doesn't form a class.

You do want one when:
- The bug class has bitten you more than once.
- The fix is "don't write a specific pattern."
- The pattern is small enough to recognize syntactically.
- A fresh-context agent wouldn't know to avoid it.

The decision log has both entries — the original report, the failed
first fix, and the reasoning behind the gate. Future iterations
searching "why does the build fail on that" can find the full story.
