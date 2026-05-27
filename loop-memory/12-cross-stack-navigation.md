---
name: cross-stack-navigation
description: Crossing from the (session) stack to the (tabs) navigator with `router.replace` alone leaves the session stack mounted underneath. Always pop it first with `router.dismissAll()`.
---

# Cross-stack navigation needs `dismissAll` first

`router.replace('/(tabs)/<tab>')` from a screen inside the (session)
stack does NOT pop the session stack — it only replaces the topmost
screen. The result on Android is a paper-on-paper transition that
briefly (and on some flows, persistently) shows the prior session
screen's surface peeking through the tab's content. Symptoms reported
as "a black screen that can't be dismissed" when the prior session
screen was the PR celebration (ink-0 surface).

**Rule:** when navigating from the (session) stack to a (tabs)
destination, dismiss the session stack first.

```ts
if (router.canDismiss()) router.dismissAll();
goTo.<tab>(router, ...);            // or router.replace('/(tabs)/...')
```

`canDismiss()` returns `false` when there's nothing on top of the
tabs root — the call is a no-op outside a nested stack, so the guard
is cheap and the rule is uniform.

## Sites where this matters today

- `SessionCompleteScreen.handleClose` — Close the day routes to
  Progress. Fix landed in loop-017 (Discord 1508935241).

Any future close-the-day-and-go-to-X flow should follow the same
pattern. `goTo.progress` itself was left alone so the Home → Progress
case (no session stack to pop) keeps its current behavior.

## When NOT to use this

Hops INSIDE the (session) stack (`/session/live` → `/session/bbb` →
`/session/complete`) use `router.replace` with `replace: true` and
should NOT dismissAll — the next screen lives in the same navigator
and there's nothing to pop.

## Related bug — stale cache on SessionCompleteScreen

A second symptom from the same loop-017 cluster: AMRAP →
PR-celebration → BBB → Close the day occasionally landed the user on
Home instead of the receipt because `SessionCompleteScreen` used to
bounce home whenever `session.status !== 'completed'`. The
per-session cache (`SESSION_KEY(id)`) is not invalidated by
`BbbPromptScreen`'s `Mark complete` step (it touches set-logs,
sessions list, and lifetime volume — not per-session), so the
receipt occasionally read a stale `in_progress` row and bounced. The
fix:

- `useSessionCompleteData` now exposes `cancelled` instead of
  `notCompleted`. Only an explicit cancelled status (or a missing
  row) bounces; a stale `in_progress` waits for the refetch.
- `BbbPromptScreen.onMarkComplete` also invalidates
  `SESSION_KEY(sessionId)` so the cache is guaranteed fresh on the
  way to the receipt.

Both belt-and-braces; either alone would have closed the gap.
