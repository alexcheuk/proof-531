---
title: 'The gate that didn''t know'
summary: >-
  Five fixes shipped from one ad-hoc session: a rapid-tap race that sent
  the user Home instead of BBB after AMRAP, the cancel-session feature
  removed end-to-end, plus three PR-celebration / AMRAP-header polish
  passes. The race is the interesting one — two effects listening to
  the same state, neither knowing the other was already routing.
pubDate: 2026-05-25
tags: ['session', 'rn', 'bug', 'product']
discordPrompts:
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: >-
      During a session, if i press All the CTA really quickly, all the
      way to Logging an amrep rep, it does not go to the BBB screen. it
      just goes straight back to the Home screen
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'Remove cancel session feature completely'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: >-
      in AMREP live screen, put the AMREP badge above the "As many reps
      as possible…" line. dont use em dash in the sentence.
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'remove skip to receipt in pr celebration'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'in PR celebration, make you hit a new PR bigger, remove stars.'
---

Five asks. Four were UI. The first one was an integration bug, and
it's the one worth a paragraph.

## The race in the exit gate

"If I press all the CTAs really quickly, all the way to logging an
AMRAP rep, it does not go to the BBB screen. It just goes straight
back to the Home screen."

The Live screen has two effects that both watch the session row's
status. One owns the post-AMRAP redirect — when `phase` becomes
`'awaiting-bbb'`, invalidate the session-shaped queries and
`router.replace('/session/bbb')`. The other is a defensive exit
gate — if `sessionStatus !== 'in_progress'` (deleted from another
surface, cancelled from elsewhere) bounce home so we don't strand
the user on a now-meaningless mid-session screen.

The gate had one excluded phase: `'complete'`. Anything else, it
acted.

The trouble is the order of events inside `onSaveAmrap`:

```ts
await appendSetLog(db, { kind: 'amrap', ... });
await invalidatePostAmrap(queryClient, sessionId);
setLastLogged(...);
clearRestSnapshot(sessionId);
await completeSession(db, sessionId);                    // status flips in DB
await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
setPhase(inserted.isPR ? 'pr-celebration' : 'awaiting-bbb');
```

The DB write happens *before* `setPhase`. By the time the awaiting-bbb
effect fires its own `invalidateSessionSurface` and waits on the
SESSION_KEY refetch, that refetch returns `status: 'completed'`.
React schedules a re-render with the new status, the exit gate
listener runs first on that render, sees `phase === 'awaiting-bbb'`
(not in the exclude list) and `sessionStatus !== 'in_progress'`,
and fires `goTo.home(router)`. The awaiting-bbb effect's
`.then(routeToDestination)` resolves a tick later and calls
`router.replace('/session/bbb')` — but by then the user is already
on a re-rendered Home screen, and which `router.replace` wins
depends on timing the test harness can't fake.

The fast taps mattered because they squeezed every step into the
same React commit window. On a slow tap path, the SESSION_KEY
refetch had time to settle before the awaiting-bbb effect even
mounted; the gate ran in a quiet render and saw nothing wrong.

Fix is one line wider:

```ts
if (phase === 'complete' || phase === 'awaiting-bbb' || phase === 'pr-celebration') return;
```

The two routing-owning phases are now in the gate's exclude list.
The gate keeps its job — it still catches "session deleted from
another surface" — but it stops second-guessing the routing
effects on their own renders.

The lesson sits in the same family as a thing we keep relearning:
**when two effects subscribe to the same state, one should own the
transition and the other should bail.** It's the same shape as the
status-bar tint last loop (paint at the right scope, not from
inside the clip). Here: route from the right effect, not from any
effect that happens to be re-rendering.

## Cancel session, out

"Remove cancel session feature completely."

The two-tap cancel sheet had been on Live, then on Today, then
quietly redundant after Restart landed. Restart wipes the set logs
and keeps the session at set 1; cancel marked the row `cancelled`
and dropped the user home. With Restart in place, cancel was the
second destructive flow on the same screen, and the two read as the
same gesture with a confusing nuance between them.

So out went `CancelPill`, `CancelConfirmSheet`, the `cancelSession`
accessor, the `'cancel-confirm'` phase in the live-screen state
machine, the SessionTopBar `RightAction` `'cancel'` variant, the
`useTodaySessionActions` cancel methods, and all the cancel-flow
tests. The `'cancelled'` status enum value stays in the DB schema
for legacy rows — nothing writes it anymore, but the schema cost of
removing it isn't worth the cleanup.

Restart is the only mid-session escape now. Either you're training,
or you're starting this session over. There's no third option.

The decision log entry calls this out as a deliberate scope-cut —
the feature wasn't broken, the model was too forking.

## The three polish passes

**AMRAP header.** The MonoBadge "AMRAP" chip was inline with the
"Squat now." headline; the coaching line ("As many reps as
possible — push for a PR, leave 1 in the tank.") sat below.
The badge wanted to live with the coaching, not the title. Lifted
it down, stacked it above the coaching line, and swapped the em
dash for a period. Two sentences read cleaner than one with a
bridge.

**PR celebration.** Two changes. First, the secondary "Skip to
receipt" link is gone — the screen is a moment, not a junction,
and the user can hardware-back if they really want to skip.
Second, the eyebrow grew up. It used to be 11pt mono on a
65%-paper tint, with `★` glyphs flanking "YOU HIT A NEW PR". Now
it's 22pt mono in full paper, no stars. The eyebrow has been
acting more like a headline anyway — the "Stronger." underneath
is more punctuation than headline. Scale matches function.

## What shipped

Two commits on `main`:

- `b247bac` — the five fixes
- `2852acd` — the decision-log entries

The first commit also took `pnpm run ci` green (873/873 tests
pass, typecheck + lint clean), and an `eas update` to the
`preview` branch went out the door before the decision log was
even written. Standard order is "test → ship → log;" the log was
the last hop.

## What's queued next

Nothing held over. The cancel feature's gone; the gate knows what
to ignore now; the AMRAP screen and the PR celebration both read
the way the user wants them to.
