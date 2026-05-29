---
tactic: 2
channel: r/531Discussion
status: draft
ready_to_post: false
trigger: iOS live on App Store
drafted: 2026-05-28
---

# r/531Discussion — Launch Post Draft

## Research notes

Direct Reddit search through web indices returned no results for this subreddit — it is not well-indexed externally. The following is based on: (1) what the strategy doc already captured from competitive research, (2) general patterns for niche lifting subreddits, (3) what questions for Alex are at the bottom of this file, and (4) App Store review analysis of the top competitor.

**Expedition 56 — Feature additions:** Two features shipped since the original draft that belong in the post. (1) TM Test Week (7th Week Protocol): the standard deload is replaced by Wendler's actual testing protocol — test-day sets at 85%, 95%, and 100% of TM, log reps, and the next TM is set from there. This is the "real" implementation detail that separates the app from apps that just skip Week 4. (2) Lift rollback: if a training max is too aggressive, the settings screen has a one-tap rollback with cycle count selector. Community shorthand for this is "running a TM that's too heavy" — r/531Discussion has recurring threads on this. Both features added to Option A body above.

**Expedition 46 — Competitor review analysis (high value):** The existing "531 Strength" app (App Store id1062989244, 4.9 stars, 11,000 ratings — the top result when searching "531" on iOS) has three documented pain points in its own App Store reviews: (1) rest timer stops when you leave the app, (2) no plate calculator, (3) no BBB support. These are verbatim from user reviews, not inferred. This is strong evidence that the new app addresses real, documented demand rather than hypothetical gaps. For the r/531Discussion post body, the framing "I tried the existing apps — [specific pain point] — so I built this" is now supported by primary evidence from the competitor's own reviews.

General pattern for r/531Discussion (inferred from comparable niche lifting communities):
- The community is practitioners, not browsers. Posts that get traction are about the program itself: TM calculation questions, block reports, AMRAP set discussions, BBB variant questions.
- App posts are rare and treated with suspicion unless the poster is clearly a practitioner, not a developer promoting.
- The winning framing is "I had a problem, I solved it, here it is if you want it" — not "check out my app."
- Disclaim non-affiliation with Wendler explicitly and early. The community is protective of the program's IP and reputation.
- Keep the title honest. Don't oversell. Let the screenshots do the talking.

---

## Option A — Practitioner frame (recommended)

**Post title:**
> I couldn't find a clean 5/3/1+BBB tracker that did the math and left everything else out, so I built one. Free, no account, local-only.

**Body:**

Running BBB for about a year. Tried Strong, Boostcamp, a few others. Strong costs $120 and wants me to manage a program template instead of just logging sets. Boostcamp is close but the UI is busy and the BBB block cuts off. Ended up with a notebook, which worked until I got tired of doing plate math in my head at 6am.

So I built my own.

**What it does:**
- 5/3/1 percentages + BBB volume auto-computed from your training maxes
- Plate math shown per side (for your bar weight, your plates, lb or kg)
- AMRAP logging with e1RM and PR detection
- Rest timer between sets, haptic at T-3s, screen stays awake
- Session receipt at the end — sets, reps, PRs, next week queued
- 7th Week Protocol (TM Test Week) built in — the deload week is replaced with the actual Wendler protocol, not just a lighter version of the main sets
- Lift rollback in settings — if you've been grinding at a TM that's too high, one tap drops it back and recalculates from there

**What it doesn't do:**
- No account, no cloud sync, no social, no gamification
- No coaching nudges, no suggested programs beyond 5/3/1+BBB
- No ads, no paywalls, no analytics
- Data stays on your device in a local SQLite database

Android: [GitHub Releases link — fill in]
iOS: [App Store link — fill in on launch day]

Not affiliated with Jim Wendler or Wendler LLC. Just a fan of the program.

Screenshots: attach these three from docs/marketing/screenshots/:
1. Screenshot_20260527-001435.png — Today screen (Bench, Cycle 2 Day 1, cycle progress grid, TM and e1RM stats, RESUME SESSION button)
2. Screenshot_20260527-003320.png — Live session pre-set (Bench, 155 LB x5, plate visualization showing 45+10 per side = 55 lb, full set list with AMRAP on set 03)
3. Screenshot_20260527-003642.png — Session receipt (In the book. Stronger. 222 LB est. 1RM, new record stamp, +25 LB vs previous best, CLOSE THE DAY)

These three tell the complete story: what the program looks like before you start, what the bar looks like during a set, and what you get when you finish.

---

## Option B — Shorter, more direct

**Post title:**
> Built a free 5/3/1+BBB tracker — no account, no paywall, local-only. Sharing it.

**Body:**

Ran out of patience with existing options — too expensive, too many features I didn't need, or the BBB block wasn't complete. Built my own. Sharing it here in case it's useful to anyone else.

Android APK on GitHub Releases. iOS on the App Store.

Not affiliated with Jim Wendler. Free, local SQLite, no sign-in.

[screenshots]

---

## Posting guidance

- Post on iOS launch day, not before. Android-only post gets half the audience.
- Post between 7am–10am US Eastern on a Tuesday or Wednesday (best engagement window for lifting subreddits).
- Do not cross-post to r/weightroom the same day — stagger by at least 24 hours, use different copy (see tactic 3 draft).
- If the post gets traction, reply to every comment within the first 2 hours. Engagement velocity matters.
- If asked about future features, be honest: "I'm focused on getting the 5/3/1+BBB core right. Feature requests noted." Don't promise a roadmap.
- If asked about affiliation: "No affiliation with Jim Wendler or Wendler LLC. I just run the program."

## Questions for Alex

See `/repos/1/docs/marketing/questions-for-alex.md` for what's needed before this post goes live.
