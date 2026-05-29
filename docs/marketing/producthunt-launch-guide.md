---
tactic: 7
channel: Product Hunt
status: draft
ready_to_post: false
trigger: 2-3 weeks after iOS App Store live
drafted: 2026-05-29 (Expedition 41)
---

# Product Hunt Launch Guide

## Timing

- Post Wednesday or Thursday (highest daily traffic on PH)
- Post at 12:01am Pacific Time — PH resets at midnight PT, early posts accumulate votes all day
- Do not post Monday or Friday
- Do not post the same week as a major tech launch (check PH trending that week first)

## Account preparation (do before iOS launch)

- Create a Product Hunt account if Alex doesn't have one
- Complete the profile: bio, Twitter/X link, website (531strength.com)
- Engage with 3-5 other products in the week before launch — upvote, leave thoughtful comments. A new account with zero activity launching a product is a yellow flag to voters.
- If possible, have 3-4 people who have tried the app ready to upvote and leave a comment on launch morning. These should be genuine users, not coordinated shills. Real first-day comments beat empty upvotes.

---

## The listing

**Product name:** 531 Strength

**Tagline (60 chars max):**
> Free 5/3/1 tracker — no account, local-only, plate math done.

**Alternative tagline options:**
> Built by a Claude agent on a cron. Free. No account. For 5/3/1 lifters.
> The focused 5/3/1 tracker — BBB math, plates, rest timer. Free.

**Description (the main body — ~200 words):**

531 Strength is a focused tracker for Jim Wendler's 5/3/1 + Boring But Big program. It does the math and gets out of the way.

**What it does:**
- Computes your working weights from training maxes (5/3/1 percentages, BBB volume)
- Plate calculator: shows exactly what goes on the bar, per side, in lbs or kg
- AMRAP logging with e1RM and PR detection
- Rest timer with haptic alert and screen-awake during sessions
- Session receipt at the end: sets, reps, PRs, next week queued

**What it doesn't do:**
- No account, no cloud sync, no social features
- No ads, no subscription, no analytics
- Data stays on your device (SQLite)

**The unusual backstory:** This app was built by a Claude Code agent on a 30-minute cron — 50+ iterations of autonomous design, implementation, QA, and a dev blog post written by the same system per loop. The human role: specify direction, review, merge. Full process at 531strength.com/process.

Free. No account required. iOS and Android.

---

**Links:**
- iOS App Store: [link]
- Android Play Store: [link]
- Website: 531strength.com
- GitHub: [link]

**Gallery (in order):**
1. Demo video — 45-60 second screen recording (see below — this is now the #1 priority asset)
2. Today screen — showing the day's workout (main + BBB sets)
3. Live session — plate visualization with rest timer active
4. Session receipt — post-workout summary with PR chip
5. History view — cycle progression over time

**Demo video guidance (Expedition 42 update — this is now the highest-priority asset):**

Research on PH 2026 launches confirms: products with a gallery video get significantly more upvotes and engagement than those with only screenshots. The algorithm rewards engagement (comments, replies, saves) over raw upvote counts — and video is the primary driver of that engagement.

Spec for the video:
- 45-60 seconds (no longer)
- Must work with no sound — PH auto-plays muted, so anything that relies on audio is wasted
- First 5 seconds must show the most impressive thing: plate math decomposing a working weight, or the AMRAP logging flow
- Suggested sequence: open app → Today screen shows the program loaded → tap into Live session → plate visualization appears → log a set → rest timer counts down with haptic (show the vibration UI) → AMRAP set logged with e1RM calculation → session receipt appears with PR chip

If a screen recording isn't ready before launch, static screenshots are acceptable but will underperform. Flag this as a task for the loop: capture a 45-60 second screen recording on device before Product Hunt launch day.

---

## First comment (hunter's comment — post immediately after launch)

This should go in the comments from Alex's account, immediately at 12:01am:

---

Hey r/PH — I built 531 Strength because I run the 5/3/1 program and couldn't find an app that did the math cleanly without the bloat.

The core: training maxes → working weights calculated → plate math shown per side → log your sets → AMRAP reps → rest timer → session receipt. That's the whole loop.

The unusual part: I didn't write the code. A Claude Code agent harness on a 30-minute cron built it — 50+ iterations. The dev blog on 531strength.com/blog is written by the same system, one post per loop. Full process at 531strength.com/process.

It's free because I built it for myself and wanted other lifters to have it. SQLite on-device, no account, no data collection.

Happy to answer questions about the 5/3/1 program, the app, or the agent loop — whichever is interesting to you.

---

## Day-of checklist

- [ ] Post at 12:01am PT (Wednesday or Thursday)
- [ ] Post hunter's first comment immediately
- [ ] Share in 1-2 relevant Slack/Discord communities where members who lift will find it authentic (not spam lists)
- [ ] Share on X/Twitter from Alex's account with a link back to the PH listing
- [ ] Reply to every comment on launch day — engagement velocity matters
- [ ] Do not ask for upvotes explicitly (PH rules prohibit this)
- [ ] If the app gets comments from 5/3/1 practitioners, engage specifically — they're the real audience

## What Product Hunt voters respond to

Based on successful fitness app launches:
- Specificity about the problem (lifters recognize "6am plate math before coffee")
- The free + no-account combination is a differentiator — lead with it
- The agent-built backstory is unusual enough to generate curiosity, but the app's value must stand on its own
- Screenshots of the actual app performing the stated function — not marketing renders

## Realistic expectations

Product Hunt is a channel for awareness, not conversion. A mid-tier launch (#5-15 on the day) gets 500-2000 website visits. Some of those convert to downloads. The more durable outcome is: the PH listing appears in Google results for "531 strength app", and the comments section serves as a permanent testimonial thread. This matters more at 3 months than on launch day.

A top-3 launch (#1-3 of the day) requires coordinated early voting and a product that is broadly accessible — 531 Strength is niche by design. Set expectations at mid-tier. If it outperforms, great.
