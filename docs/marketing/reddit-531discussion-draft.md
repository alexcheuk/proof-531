---
tactic: 2
channel: r/531Discussion
status: draft
ready_to_post: true
trigger: Android live on Google Play (done as of Expedition 83). iOS App Store submission still in progress - post now or wait for iOS parity (Alex's call).
drafted: 2026-05-28
last_reviewed: 2026-06-28 (Expedition 92)
---

# r/531Discussion -  Launch Post Draft

## Research notes

Direct Reddit search through web indices returned no results for this subreddit -  it is not well-indexed externally. The following is based on: (1) what the strategy doc already captured from competitive research, (2) general patterns for niche lifting subreddits, (3) what questions for Alex are at the bottom of this file, and (4) App Store review analysis of the top competitor.

**Expedition 56 -  Feature additions:** Two features shipped since the original draft that belong in the post. (1) TM Test Week (7th Week Protocol): the standard deload is replaced by Wendler's actual testing protocol -  test-day sets at 85%, 95%, and 100% of TM, log reps, and the next TM is set from there. This is the "real" implementation detail that separates the app from apps that just skip Week 4. (2) Lift rollback: if a training max is too aggressive, the settings screen has a one-tap rollback with cycle count selector. Community shorthand for this is "running a TM that's too heavy" -  r/531Discussion has recurring threads on this. Both features added to Option A body above.

**Expedition 46 -  Competitor review analysis (high value):** The existing "531 Strength" app (App Store id1062989244, 4.9 stars, 11,000 ratings -  the top result when searching "531" on iOS) has three documented pain points in its own App Store reviews: (1) rest timer stops when you leave the app, (2) no plate calculator, (3) no BBB support. These are verbatim from user reviews, not inferred. This is strong evidence that the new app addresses real, documented demand rather than hypothetical gaps. For the r/531Discussion post body, the framing "I tried the existing apps -  [specific pain point] -  so I built this" is now supported by primary evidence from the competitor's own reviews.

**Expedition 62 -  Liftosaur competitive intelligence (new):** Liftosaur (free, iOS/Android/web) now has built-in 5/3/1 BBB support. This changes the competitive landscape slightly -  "Boostcamp's BBB block cuts off" was previously the free-tier story, and Liftosaur is now an alternative. However, Liftosaur is architecturally a Progressive Web App (PWA) wrapped as a native installer. Its own GitHub issue tracker (issue #66, Nov 2023) documents that the Android rest timer fails to notify when the screen is off or the app is in background -  the exact failure mode the launch pitch is built around. The developer confirmed this is a PWA limitation. As of 2026 research, this remains unresolved for background timer notifications on iOS (PWAs on iOS still cannot deliver background sound/notification when the timer hits a threshold). The post body doesn't need to name Liftosaur -  but if asked in comments "what about Liftosaur?", the answer is: BBB support exists, but it's a PWA wrapper and the rest timer breaks when you leave the app. That's the documented limitation, not an opinion.

General pattern for r/531Discussion (inferred from comparable niche lifting communities):
- The community is practitioners, not browsers. Posts that get traction are about the program itself: TM calculation questions, block reports, AMRAP set discussions, BBB variant questions.
- App posts are rare and treated with suspicion unless the poster is clearly a practitioner, not a developer promoting.
- The winning framing is "I had a problem, I solved it, here it is if you want it" -  not "check out my app."
- Disclaim non-affiliation with Wendler explicitly and early. The community is protective of the program's IP and reputation.
- Keep the title honest. Don't oversell. Let the screenshots do the talking.

---

## Option A -  Practitioner frame (recommended)

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
- Session receipt at the end -  sets, reps, PRs, next week queued
- 7th Week Protocol (TM Test Week) built in -  the deload week is replaced with the actual Wendler protocol, not just a lighter version of the main sets
- Lift rollback in settings -  if you've been grinding at a TM that's too high, one tap drops it back and recalculates from there

**What it doesn't do:**
- No account, no cloud sync, no social, no gamification
- No coaching nudges, no suggested programs beyond 5/3/1+BBB
- No ads, no paywalls, no analytics
- Data stays on your device in a local SQLite database

Android: https://play.google.com/store/apps/details?id=com.alexcheuk.fivethreeone
iOS: Coming soon (App Store submission in progress)

Not affiliated with Jim Wendler or Wendler LLC. Just a fan of the program.

Screenshots: use the three newer high-quality screenshots from docs/screenshots/ (added Expedition 77):
1. screenshot-6.png -  Today screen (Bench, C2D1, plate visualization, START SESSION button)
2. screenshot-7.png -  Live AMRAP (Bench now., AMRAP sheet open, e1RM calculation live)
3. screenshot-8.png -  Session receipt with embedded PR certificate (In the book., +25 LB)

These three tell the complete story: what the program looks like before you start, what the AMRAP sheet looks like mid-set, and what you get when you finish. Prefer these over the older Screenshot_20260527-*.png files -  the new screenshots are higher quality and show the same flows.

---

## Option B -  Shorter, more direct

**Post title:**
> Built a free 5/3/1+BBB tracker -  no account, no paywall, local-only. Sharing it.

**Body:**

Ran out of patience with existing options -  too expensive, too many features I didn't need, or the BBB block wasn't complete. Built my own. Sharing it here in case it's useful to anyone else.

Android APK on GitHub Releases. iOS on the App Store.

Not affiliated with Jim Wendler. Free, local SQLite, no sign-in.

[screenshots]

---

## Posting guidance

- Android is live on Google Play (as of Expedition 83). iOS App Store submission is in progress. Alex's call whether to post now or wait for iOS parity.
- If posting Android-only: note "iOS coming soon" at the bottom of the post body.
- Post between 7am-10am US Eastern on a Tuesday or Wednesday (best engagement window for lifting subreddits).
- Do not cross-post to r/weightroom the same day - stagger by at least 24 hours, use different copy (see tactic 3 draft).
- If the post gets traction, reply to every comment within the first 2 hours. Engagement velocity matters.
- If asked about future features, be honest: "I'm focused on getting the 5/3/1+BBB core right. Feature requests noted." Don't promise a roadmap.
- If asked about affiliation: "No affiliation with Jim Wendler or Wendler LLC. I just run the program."

## Questions for Alex

See `/repos/1/docs/marketing/questions-for-alex.md` for what's needed before this post goes live.
