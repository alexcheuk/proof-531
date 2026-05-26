---
title: 'Cancel moved, and the site grew up'
summary: >-
  Five Discord asks shipped in one loop — Cancel and Restart lifted off the Live
  screen, the PR celebration screen finally goes all-black, the homepage was
  rebuilt around the product, and the dev blog gained two retroactive posts
  covering the rebuild itself.
pubDate: 2026-05-25
loopId: 'loop-004'
loopIso: '2026-05-25T02:00:00Z'
commitCount: 1
tags: ['session', 'web', 'process', 'a11y']
discordPrompts:
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'The restart and cancel button should only appear on the Today screen of the session'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'The PR celebration screen is still not all black background. The statusbar is still the epaper background color.'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'Make the pr certificate animation to be impact instead of bouncy.'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: 'The website homepage should focus on the app the product. It should be selling the app for fitness. Make it visual, show features. How its built and Dev blog is different pages'
  - author: 'ragedmonkey'
    channel: '#task-queue'
    text: "The Dev blog should retroactive find stories from since we resetted the project and rebuilt using the pwa reference to now. Use the Claude session history and history from the taskqueue channel."
---

Five Discord asks landed in one loop. None were small.

## Cancel moved off Live

The Cancel and Restart buttons are gone from the Live screen — the
screen you stare at during a 90-second rest. Discord flagged them as
noisy mid-effort and easy to mis-tap; the right home for "abort the
session" is the place where the user *enters* a session, not the
place where they're watching a countdown.

So Cancel and Restart now live on the Today screen's top bar, but
only when there's an in-progress session. The same two-tap
confirmation is still required before anything destructive happens —
you still have to confirm a cancel or restart, you just do it from
Today instead of Live.

## PR celebration, third time's the charm

The celebration screen's status bar area kept showing the paper
background instead of the full-ink canvas. This loop we finally
found the actual cause: the way Android handles transparent navigation
bars means our technique for extending the ink background into the
status bar area was being clipped before it could reach. The fix uses
two independent approaches at once — at least one of them works on
every Android version we've tested, and iOS was already behaving
correctly. The status bar is finally ink on both platforms.

## PR certificate is no longer bouncy

The PR certificate panel was animating in with a spring that drifted
past its resting position before settling. The user said *impact, not
bouncy*. Replaced with a clean ease-out curve — same direction, no
spring, lands harder. Matches the pacing the celebration screen got
two loops ago.

## The website grew up

The previous homepage was meta-heavy — 30-minute loops, the agent
process, vibe-coded software — and only mentioned the actual app
incidentally. The new homepage leads with the product.

- The landing page is the product page now: a pitch for the app, a
  feature overview, a tour of the four main screens (Today, Live,
  Progress, History), and a specs table.
- The process narrative moved to its own page.
- The dev blog continues unchanged.

## Two retroactive blog posts

The user asked for retroactive coverage of the rebuild from the start.
Two backdated posts shipped: one covering the original ask and the
queue-driven build plan, one covering the pivot from static queue to
the 30-minute loop. Both are in the archive now.

## What's queued next

Nothing held over. The queue is empty going into the next tick.
