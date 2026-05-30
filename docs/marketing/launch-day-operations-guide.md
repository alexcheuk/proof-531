---
status: draft
purpose: Consolidated execution guide for iOS launch day — what to do, in what order, at what time
drafted: 2026-05-28 (Expedition 43)
updated: 2026-05-28 (Expedition 45)
trigger: iOS App Store approval notification received
---

# Launch-Day Operations Guide

When the iOS approval email arrives, this is the playbook. Every tactic has a draft ready — this doc tells you which one to run, when, and what to fill in.

**iOS review speed note (updated Expedition 45):** Current Runway data (updated May 27, 2026) shows median "waiting for review" is 8h 27m and "in review" is 1h 53m. Most approvals complete within 12-24 hours now, not the 2-7 day window that was common in early 2026. This means the clock starts fast — be ready to act the day you submit, not a week later. The exception: if submission arrives on a Friday, expect the weekend delay (Friday and Saturday submissions take up to 17h to start review). Ideal submission day: Tuesday or Wednesday, morning US Eastern.

**Before you do anything else:** Fill in the two blanks that appear in every post:
- `[App Store link]` — available in App Store Connect immediately after approval (format: `https://apps.apple.com/app/id[number]`)
- `[GitHub Releases link]` — the canonical URL for the Android APK (should already exist; confirm before iOS goes live)

---

## Hour 0 — Approval lands

1. **Screenshot the approval email.** You'll want this for the IH and dev blog post.
2. **Get the App Store URL** from App Store Connect. Copy it somewhere you can paste it fast.
3. **Update the longform narrative** (`docs/marketing/longform-how-i-built-this.md`): fill in `[N]` expedition count and add the App Store and GitHub links. This becomes the source asset for every long-form platform.
4. **Confirm the GitHub Releases URL** for the Android APK is live and points to the current production build.

---

## Day 1 — r/531Discussion post (most important launch action)

**When:** 7am–10am US Eastern, Tuesday or Wednesday. If approval lands on a different day, wait for the next Tuesday or Wednesday window. Do not rush this into a Monday or Friday post — lifting subreddits have lower engagement at the week boundary.

**What to post:** Option A from `docs/marketing/reddit-531discussion-draft.md` (the practitioner-frame version).

**Fill in before posting:**
- `[GitHub Releases link — fill in]` → your Android APK URL
- `[App Store link — fill in on launch day]` → the new iOS URL
- Replace "Running BBB for about a year" with your actual timeframe if different
- Attach 2–3 screenshots: Today screen, Live session screen with plate visualization, Session receipt

**Account to use:** Your personal Reddit account if you have any r/531Discussion or r/weightroom history. A brand-new account posting an app is a yellow flag. If your account is new, the post needs to be even more low-key and practitioner-framed.

**After posting:** Stay available for the first 2 hours to reply to comments. Engagement velocity matters. If asked about future features: "Focused on getting the 5/3/1+BBB core right — open to feedback." If asked about affiliation: "No relation to Wendler or Wendler LLC."

---

## Day 2 — r/weightroom mention

**When:** 24 hours after r/531Discussion post, not same day.

**What to post:** Option A from `docs/marketing/reddit-weightroom-draft.md` — the 2-sentence thread reply in the active Show-and-Tell / Brolog / Tools thread. Do not create a standalone thread.

**Before posting:** Check the r/weightroom sidebar for the current recurring thread. If there's no appropriate thread active, wait until one appears rather than creating a new post.

**Do not** reuse the r/531Discussion copy word-for-word. The r/weightroom mention is shorter and even more practitioner-toned.

---

## Day 3 or 4 — X/Twitter tweet (optional, high-upside)

**When:** After r/531Discussion post has had 24+ hours to settle.

**What to tweet:**
> Built a free 5/3/1+BBB tracker for myself — plate math, AMRAP logging, rest timer, no account. Sharing it. [App Store link] [GitHub link]
> Not affiliated @jimwendler — just a fan of the program.

**One screenshot attached.** Don't follow up or ask for RT. One mention of @jimwendler is the whole bet — a single RT from that account has better targeting than any paid channel. Do it once and move on.

**Account:** Needs your personal or project X/Twitter handle. See `docs/marketing/questions-for-alex.md` item 7 if this isn't resolved.

---

## One week after iOS launch — r/reactnative showcase thread

**When:** The first available monthly showcase thread in r/reactnative after iOS is live. Check the subreddit sidebar for the current thread.

**What to post:** The showcase thread reply from `docs/marketing/reddit-reactnative-draft.md`.

**Fill in:** Play Store link, App Store link, GitHub link, and attach screenshots (Today screen, Live session with plate visualization, Session receipt). A GIF or screenshot of the plate visualization component is the most compelling visual for this audience.

**Note:** This is a developer audience. Technical specifics (Expo SDK 55, New Architecture, Drizzle, Reanimated 4, CI boundary enforcement) are what get upvotes here. The agent-built angle is a brief footnote, not the lead.

---

## One week after iOS launch — r/vibecoding post

**When:** Separate day from the r/reactnative post. Different audience, different copy, don't cross-post same day.

**What to post:** Option A from `docs/marketing/reddit-vibecoding-draft.md` — the contrast-lead version ("r/vibecoding says vibe coding is for prototypes...").

**Fill in:** GitHub link, App Store link, and update the "70+" iteration count to the actual current count at posting time.

**Tone note:** This community is skeptical of AI-built apps for production use. The hook is the contrast: "you say this can't be production — here's the evidence it can." Specificity about CI enforcement and property testing is what lands here, not "I used Claude to build an app."

---

## One week after iOS launch — Hacker News Show HN

**When:** Weekday, 8am–10am US Eastern. One of the best windows for Show HN traction. Not same day as r/vibecoding or r/reactnative.

**What to post:** Title option A from `docs/marketing/ai-experiment-story-outline.md`:
> Show HN: 531 Strength — I let a Claude agent build my gym app, start to finish

**First comment (post immediately after submission):** The submitter comment from `docs/marketing/ai-experiment-story-outline.md` — fill in `[N]` with current iteration count and add App Store and Play Store links.

**Key pre-answer to have ready in comments:**
- If asked "is the program any good?" → "The program is Jim Wendler's — I implemented it faithfully. One of the most respected strength training systems in use."
- If asked "did you write any code?" → "Minimal emergency fixes. The constraint was mostly held."
- If asked "is the app actually good?" → "I use it for real workouts. The proof is the feature specificity: plate math, AMRAP detection, BBB percentages. Toy demos don't have per-side plate visualization."

---

## Two to three weeks after iOS launch — Indie Hackers milestone post

**When:** After HN post has settled. Separate week.

**What to post:** Extract sections 3 and 4 from `docs/marketing/longform-how-i-built-this.md` — "How the loop actually works" and "What was hard." Frame as a milestone post: app live on both stores, N iterations, here's what the process actually taught me.

**Fill in:** Personalize the 5/3/1 history section — how long you've been running the program, actual lifts. The IH audience responds to authentic developer stories, not generic copy.

---

## Two to three weeks after iOS launch — Product Hunt

**When:** Wednesday or Thursday at 12:01am Pacific Time (PH resets at midnight PT — early posts accumulate all day).

**Full guide:** `docs/marketing/producthunt-launch-guide.md` has the complete listing, tagline options, description, first comment, and day-of checklist.

**Highest-priority pre-PH task:** Record a 45–60 second muted screen recording of one live session (Today → Live → plate visualization → log a set → rest timer → AMRAP → session receipt). Products with gallery video significantly outperform screenshot-only listings on PH's 2026 engagement-weighted algorithm. See the demo video spec in the launch guide.

**Account prep (do before PH day):** Have a PH account with activity (upvotes and comments on a few other products in the week before launch). A zero-activity account launching a product is a yellow flag to voters.

---

## Ongoing — Opportunistic channels

**r/privacy / r/degoogle:** Only when a relevant thread appears naturally. Don't create a new thread. Drop three facts in a comment: SQLite on-device, zero analytics SDK, zero telemetry events.

**T-Nation:** Participate in 5/3/1 math discussions first (TM calculation, BBB percentages, 7th Week Protocol). Only mention the app if someone directly asks what you use to track. This community is hostile to promotional posts; earn it or skip it.

---

## What the loop can prepare before launch day (no Alex input needed)

The following are ready to execute immediately on iOS live:
- r/531Discussion draft: `docs/marketing/reddit-531discussion-draft.md`
- r/weightroom draft: `docs/marketing/reddit-weightroom-draft.md`
- r/vibecoding draft: `docs/marketing/reddit-vibecoding-draft.md`
- r/reactnative draft: `docs/marketing/reddit-reactnative-draft.md`
- HN Show HN title + first comment: `docs/marketing/ai-experiment-story-outline.md`
- Product Hunt full guide: `docs/marketing/producthunt-launch-guide.md`
- Longform narrative (source for IH and HN): `docs/marketing/longform-how-i-built-this.md`

**Remaining gaps to fill before any post goes live:**
1. App Store URL (available immediately after iOS approval)
2. GitHub Releases URL for Android APK — confirm this exists and is public
3. Current expedition count `[N]` — fill in with actual count at posting time
4. Personal 5/3/1 details for practitioner posts (how long, which lifts) — improves r/531Discussion credibility
5. Alex's Reddit account history — standalone post vs. thread reply decision for r/weightroom
6. Alex's X/Twitter handle — needed for the @jimwendler tweet
