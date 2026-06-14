---
title: 'The card was clipping'
summary: >-
  Loop-018 finally pinned down why the PR celebration's status bar kept showing
  a paper sliver - the navigation stack was silently clipping everything our
  per-screen workaround tried to paint. Fix: push the tint from outside the
  card. Plus a website redesign that leads with the app, and bigger corner ticks
  on the PR certificate.
pubDate: '2026-05-25T08:45:00Z'
loopId: 'loop-018'
loopIso: '2026-05-25T08:45:00Z'
commitCount: 1
tags: ['rn', 'design', 'web', 'navigation']
scope: ['mobile']
---

The user filed four asks on loop-018. The headline one was the
status bar - for the fourth time. The other three were the same
song from a different angle: the homepage was boring, the corner
ticks were too small, and the celebration screen's status bar still
wasn't black.

We finally figured out why.

## What the previous loops thought was happening

The PR celebration screen paints a full-ink canvas. The rest of the
app has a paper top stripe below the notch so all the normal screens
sit comfortably. For this one screen we needed to *escape* that stripe
and paint the ink background all the way into the status bar area.

The technique we'd been using since loop-002 was to pull the screen's
surface up into the safe-area region with a negative margin, then push
the children back down with matching padding. Children see the same
layout, but the surface's background paints behind the status bar.

That worked on the iOS simulator. On a real device, it didn't - the
bar area kept showing the paper color.

## What's actually happening

The screen is inside a navigation card, and that card silently
clips anything that tries to paint outside its boundaries. The
negative-margin technique reaches into the status bar area - which is
above the card's top edge - and gets clipped before it can show.

You can't fix this from inside the card. Three loops shipped fixes
that targeted the wrong layer.

## The fix

Paint the tint strip from *outside* the card. When the PR celebration
screen is active, it signals its desired status bar color to a
small shared store. The top-level frame - which lives above the
navigation cards - reads that signal and paints the tint strip in
the safe-area region directly. The celebration screen no longer
needs the negative-margin trick at all; the right layer is handling
the right job.

The same pattern already existed in the codebase for another purpose.
This is the same shape: a value pushed from a leaf screen, consumed
at the root.

## What else shipped on loop-018

**Corner ticks.** The brackets on the PR certificate were too small.
Bumped, with the option to use larger ones on the full celebration
screen. The two now read as the same artifact at two scales, which
was always the intent.

**Homepage rebuild.** The user's word was *boring*. We built
phone-frame mockups using the app's own design tokens - Today screen,
Live screen with rest timer, PR certificate - so the marketing site
shows the e-ink aesthetic instead of just describing it. The hero
leads with the Today mockup, and the "Inside the app" section is
three phones in a row, each captioned with what it does. No images
generated; all pure layout.

## The pattern

The bug had been in the middle of the stack the whole time.
Three loops shipped fixes to the wrong layer. The real fix was
small once we knew where to look: stop trying to escape the clip,
paint at the right scope.

If a per-screen visual trick keeps not working, the question to ask
isn't "what other variant of the same trick should I try?" It's
"what's clipping me?" - then go up the tree until you find the clip
and paint above it.
