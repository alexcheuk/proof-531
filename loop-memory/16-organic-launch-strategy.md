---
name: organic-launch-strategy
description: Research-backed organic marketing strategy for launching 531 Strength. 12 concrete tactics, sequenced. Execute on iOS launch day. Each future loop should advance one item here.
---

# 531 Strength — Organic Launch Strategy

**Researched**: 2026-05-28 (Expedition 36)
**Last updated**: 2026-05-28 (Expedition 46)
**Status**: Pre-launch (iOS App Store submission in progress — all drafts ready for tactics 1-9; launch-day operations guide now complete)

## The competitive anchor

Serious 5/3/1 practitioners have four consistent complaints about existing apps: too many steps to log sets mid-workout, rest timers that break on background, social/gamification bloat, and data locked behind paywalls. 531 Strength solves all four. That is the pitch — say it plainly, don't over-engineer it.

Boostcamp reviews show live pain: "only has the first block." Strong is the community default but costs $120 lifetime and is too bloated for percentage-based programs. Lead with the gap.

## The two stories

1. **The lifting app story** — for r/531Discussion, r/weightroom, T-Nation. Frame: "I couldn't find a clean tracker that did the BBB math and left everything else out, so I built one."
2. **The AI experiment story** — for HN Show HN, r/vibecoding, r/reactnative, Indie Hackers. Frame: "a Claude coding agent on a 30-minute cron that commits code and writes a blog post every iteration."

Use the right story for the right audience. Never mix them in a single post.

## 12 tactics in sequence

### Before iOS launch (now through App Store approval)

**1. Polish the GitHub README** (do now)
- Keywords: 5/3/1, Wendler, BBB, strength training, React Native, Expo, local-first
- Add one screenshot: live screen with plate visualization
- One paragraph on the AI-loop development model + link to `/process`
- Why: organic GitHub search + SEO compounding from day one

### On iOS launch day

**2. r/531Discussion** — single post
- Title: "I couldn't find a clean 5/3/1+BBB tracker that left everything else out, so I built one. Free, no account, local-only."
- Include: 2–3 screenshots (Today screen, Live screen, History receipt)
- Link APK + App Store. Disclaim no Jim Wendler affiliation.
- Do NOT post before iOS is live — Android-only limits the audience.

**3. r/weightroom** — Show-and-Tell / Brolog thread
- 2–3 sentences only. Link GitHub releases, not a paid page.
- Frame as practitioner sharing a tool, not developer promoting an app.

**4. X / @jimwendler** — one tweet
- "Built a free 5/3/1+BBB tracker for myself, putting it out there. No affiliation, just a fan of the program." Tag once. One screenshot. Do not follow up.
- A single retweet from Wendler has better targeting than any paid channel.

### One week after launch (let Reddit reception settle)

**5. Hacker News Show HN**
- Title: "Show HN: 531 Strength — a 5/3/1 tracker built by a Claude agent on a 30-minute cron"
- Lead paragraph: what the loop does, how many iterations ran, what ships each cycle. Link `/process` and GitHub.
- Wait until 20+ expedition logs exist — the system should look like a running thing.
- The lifting app is the proof; the agent loop is the story. HN needs the loop story.

**6. Indie Hackers — one milestone post**
- Frame: developer runs 5/3/1, couldn't find the right app, built it with a Claude agent loop, N weeks of 30-minute iterations.
- Link `/process`, GitHub, App Store.
- Developer story drives word of mouth more than feature lists.

### Two-to-three weeks after launch

**7. Product Hunt**
- Schedule Wednesday or Thursday (highest traffic)
- Title: "531 Strength — a strict 5/3/1 tracker built by an AI agent"
- Lead tagline: free, local-first, no account
- Link dev blog. Line up 3–4 early users for launch-day upvotes.

### Any time after GitHub is polished

**8. r/reactnative** — monthly side-project showcase
- Technical frame: Expo SDK 55, New Architecture, Drizzle + expo-sqlite, boundary enforcement via Biome
- Show the plate visualization — it is an unusually interesting RN component
- Developers who lift will install it; developers who don't will upvote the engineering story

**9. r/vibecoding**
- Post the /process page directly. Describe multi-agent orchestration (designer/implementer/QA, Logger rotation)
- This community shifted from experiments to production-ready products; this is a production-ready example

### Secondary channels (opportunistic, not forced)

**10. r/privacy / r/degoogle** — respond when the topic comes up naturally
- Three facts: SQLite on-device, zero telemetry events, zero analytics SDKs
- Do not create a thread solely to promote; only surface in relevant conversations

**11. T-Nation forums** — participate first, mention only if asked
- Answer 5/3/1 math questions (TM calculation, BBB percentages, 7th Week Protocol) over several weeks
- Surface the app only if someone asks directly "what do you track with"
- T-Nation is hostile to promotional posts. Earn it or skip it.

**12. App Store review prompt** (in-app, after cycle 2)
- On the session receipt screen, below "Close the day", add one non-intrusive line: "If this is working for you, a review helps."
- No modal, no repeated asks. Only show to users who have completed 2+ cycles.
- Each half-star improvement correlates with ~20% higher download rates.

## Progress tracker

| Tactic | Status | Notes |
|--------|--------|-------|
| 1. GitHub README polish | done · updated expedition 44 | Keywords, local-first/free/no-account messaging, process page link, AI-loop paragraph. Iteration count updated to 44+ in Expedition 44. Screenshots placeholder section added with concrete capture instructions for Alex (Today screen, Live session, Session receipt). Per best-practices research: visual proof is the single biggest missing element for GitHub README engagement. |
| 2. r/531Discussion post | draft ready · sharpened expedition 46 | Two options drafted (practitioner-frame + short). **Expedition 46:** Competitor review analysis added — the top existing "531" app (4.9 stars, 11K ratings) has verbatim App Store complaints about: rest timer breaking, no plate math, no BBB. These map exactly to this app's differentiators. Post body framing updated. Needs: App Store URL, GitHub Releases URL, Alex's Reddit history, personal 5/3/1 details. See `docs/marketing/reddit-531discussion-draft.md` |
| 3. r/weightroom thread | draft ready · expedition 38 | Thread-reply option (recommended) + standalone option. Post 24h after tactic 2. See `docs/marketing/reddit-weightroom-draft.md` |
| 4. @jimwendler tweet | pending · wait for iOS | Needs Alex's X handle |
| 5. HN Show HN | strategy revised · expedition 40 · signal confirmed expedition 45 · competitor signal added expedition 46 | HN title/lead updated based on 2025 Show HN data: AI-first framing underperforms; now leads with personal story + real app, agent loop is secondary. Three title options provided. Pre-answered likely HN questions. /process page confirmed ready. See `docs/marketing/ai-experiment-story-outline.md`. **Expedition 45 confirmation:** Auto-Co Show HN (March 2026, 14 agents running a startup autonomously) received only 4 points — pure "autonomous agent" framing is confirmed dead on HN. Title Option A (personal story first) remains the correct call. **Expedition 46:** Added concrete answer to "how is this different from existing 5/3/1 apps?" — competitor's own App Store reviews document the exact three pain points this app solves. Now in ai-experiment-story-outline.md. |
| 6. Indie Hackers | source draft ready · expedition 40 | Full longform narrative drafted as source asset. See `docs/marketing/longform-how-i-built-this.md` — extract sections 3+4 for IH post. |
| 7. Product Hunt | draft ready · expedition 41 · signal update expedition 42 | Full hunter's guide drafted: listing copy, tagline options, first comment, day-of checklist, timing rules. See `docs/marketing/producthunt-launch-guide.md`. Needs: App Store URL, GitHub link, demo video if available. Post 2-3wk after iOS live. **Expedition 42 signal:** PH's 2026 algorithm weights engagement (comments, replies) over raw upvotes. A 45-60 second muted demo video is now the single biggest lever — products with video get significantly more engagement than screenshots only. Priority: get a screen recording of one live session (warmup → working set → AMRAP → rest timer countdown → session receipt) before PH launch. See updated note in producthunt-launch-guide.md. |
| 8. r/reactnative | draft ready · expedition 41 | Full post-ready copy drafted for monthly showcase thread + standalone option. Stack, plate visualization component, agent-built mention (secondary). See `docs/marketing/reddit-reactnative-draft.md`. Needs: Play Store link, App Store link, GitHub link, screenshots. |
| 9. r/vibecoding | draft ready · expedition 41 · framing sharpened expedition 42 · comment prep added expedition 43 · new signal expedition 44 | Two options drafted: long (architecture-focused) and short (for lower-friction posting). Leads with CI-enforced boundaries, multi-agent handoffs, Logger rotation. See `docs/marketing/reddit-vibecoding-draft.md`. Needs: GitHub link, App Store link. **Expedition 43 signal:** Added specific data points for comment prep — 170/1,645 Lovable apps had exploitable vulnerabilities; 16/18 CTOs reported production disasters from AI code. **Expedition 44 signal:** Added Apple App Store review-queue context — iOS submissions up 89% YoY due to AI app flood, Apple increasing scrutiny. This is a live, current framing hook: 531 Strength is the counterexample in the queue. If "Apple is blocking vibe-coded apps" comes up in comments, the answer is now ready and documented. Iteration counts updated to 44+ throughout draft. |
| 10. r/privacy (opportunistic) | ongoing | |
| 11. T-Nation (opportunistic) | ongoing | |
| 12. In-app review prompt | pending · add to queue | |

## Launch-day operations guide

**Status: created (Expedition 43).**

The guide is at `docs/marketing/launch-day-operations-guide.md`. It is the consolidated execution playbook for when iOS approval arrives — every tactic sequenced, timed, and linked to the appropriate draft. Previously the execution sequence was spread across five separate files.

**What it covers:**
- Hour 0: get the App Store URL, confirm GitHub Releases URL, update longform narrative
- Day 1: r/531Discussion (timing window, which draft, what to fill in, how to handle comments)
- Day 2: r/weightroom (24h stagger, thread reply vs. standalone decision)
- Days 3-4: X/Twitter @jimwendler tweet
- Week 1: r/reactnative showcase thread, r/vibecoding contrast post, HN Show HN
- Weeks 2-3: Indie Hackers milestone post, Product Hunt launch
- Ongoing: r/privacy, T-Nation
- What's ready vs. what still needs Alex input

**No input from Alex needed to use this guide** — the blanks are clearly marked and the rest is ready.

## The long-form narrative asset

Alex flagged wanting to "share to the world a fun story on how I built this whole thing — the technical aspect, the fun aspect, the whole vibe code journey."

**Status: drafted (Expedition 40).**

The piece is at `docs/marketing/longform-how-i-built-this.md`. Updated in Expedition 41 to fix "39 entries" → "40+ entries". It's ~1,200 words and covers:
- The personal itch (2-plates-to-3-plates goal, the problem with existing apps)
- The unusual constraint (agent loop, not writing code)
- How the loop actually works (cron, Discord, multi-agent team, Logger posts)
- What was hard (context drift, boundary enforcement, agent handoffs)
- What surprised me (quality compounding, context hygiene as the real skill, the blog as receipt)
- Where it is now + open question about compounding

**Needs from Alex before publishing:**
- Personal details filled in (how long on 5/3/1, actual lifts — currently generalized)
- Confirmation that Strong/Boostcamp framing is accurate from personal experience
- Expedition count [N] filled in
- GitHub + App Store links added
- Decision: personal name or project name as byline?

**Where this publishes:**
- Indie Hackers — as the milestone post (full article or excerpt)
- HN — as the submitter comment (extract the most technical/surprising section)
- r/vibecoding — as the primary link destination (the community moved to production builds, this is one)
- Personal blog or dev.to if Alex has either
- 531strength.com blog — consider whether a special non-expedition post for the full human narrative is worth adding

## Open questions (blocking launch-day posts)

See `docs/marketing/questions-for-alex.md` for the full list. Summary of blockers:

1. GitHub Releases URL for Android APK
2. App Store URL (available after iOS approval)
3. Alex's Reddit account history in lifting communities (affects standalone vs. thread-reply strategy)
4. Alex's personal 5/3/1 history (practitioner credibility framing — also needed for longform piece)
5. ~~Whether /process page exists~~ — RESOLVED (Expedition 40). The /process page at 531strength.com/process is complete and ready to link.

## Expedition 46 — Research notes

**Date:** 2026-05-28

**Competitor App Store review analysis (primary source):** The top-ranked iOS app for "531" searches is "531 Strength" (id1062989244, 4.9 stars, 11,000 ratings — a different app than the one being launched). Its own App Store reviews document three recurring user complaints verbatim: (1) the rest timer stops when you leave the app, (2) there is no plate calculator, (3) BBB is not supported. These are not inferred from roundup articles — they are documented in the competitor's own reviews. This is the first primary-source confirmation of the market gap the launch pitch is built around. Update to drafts: competitor review analysis note added to `docs/marketing/reddit-531discussion-draft.md`; HN differentiation answer added to `docs/marketing/ai-experiment-story-outline.md`. Naming note: both apps share the name "531 Strength" — Alex should be aware of this when filling in App Store metadata and may want to differentiate with a subtitle.

**Additional competitor landscape:** Wendler Log (Vandersoft) is on both iOS and Android and includes plate math, cloud sync, and 11 assistance programs. It is more feature-complete than the existing "531 Strength" app. It represents the paid-feature ceiling. The new app's position remains accurate: free, local-first, BBB-complete, background rest timer — specifically the features the community asks for and existing paid apps charge for or exclude.

**Repstack (Feb 2026 Show HN):** An offline-first hypertrophy PWA targeting the RP community. Not a direct competitor (different program, different audience) but confirms HN appetite for local-first fitness tools. No specific points/comment data retrieved due to HN rate limiting.

**No live community threads found:** No r/531Discussion or r/weightroom threads surfaced through external indices this loop. Strategy unchanged: post on iOS launch day.

**Iteration counts updated:** All "44+" and "45+" references in marketing drafts updated to "46+": `docs/marketing/reddit-vibecoding-draft.md` (multiple references), `docs/marketing/longform-how-i-built-this.md`, `docs/marketing/ai-experiment-story-outline.md`.

**Discord #needs-input:** Inaccessible this loop (HTTP 403 on API call — likely a token permission scope issue). No Alex replies retrieved. All open questions from `docs/marketing/questions-for-alex.md` remain outstanding.

## Expedition 45 — Research notes

**Date:** 2026-05-28

**iOS review times corrected:** Runway's live tracker (updated May 27, 2026) shows the actual current iOS App Store review speed is far faster than the "2-7 day" estimate documented in Expedition 43. Median "waiting for review" is now 8h 27m; "in review" is 1h 53m. Most approvals complete within 12–24 hours. Tuesday submissions are fastest (10h 22m to start); Friday/Saturday are slowest (~17h). The launch-day operations guide and questions-for-alex.md have been updated to reflect this. Practical impact: Alex should have all posts ready to go before submission, not after a multi-day buffer. The clock starts fast.

**HN "autonomous agent" framing confirmed dead:** Auto-Co (Show HN, March 2026) — "14 AI agents that run a startup autonomously" — received 4 points and 2 comments. The one visible comment was skeptical: "there are so many of these...what's the difference." This is direct 2026 evidence for what the Expedition 40 strategy revision already concluded from 2025 data: leading with autonomous agent framing on HN is a losing move. Title Option A ("I let a Claude agent build my gym app, start to finish") remains correct — personal story first, agent loop is the interesting secondary fact, not the headline claim. Updated the HN tactic notes in the progress tracker.

**Market gap confirmed again by 2026 source:** Setgraph's roundup of 15 workout apps tested by lifters (2026) explicitly notes that "strong lifters need apps supporting percentage-based programs like 5/3/1 or conjugate training" but lists this as a desired feature rather than one any app delivers. No dedicated 5/3/1 tracker appears. This is now a third independent 2026 source confirming the gap (previously: Cora Health synthesis, FindYourEdge roundup). The r/531Discussion premise remains accurate and uncontested.

**No live community threads found:** Reddit continues to be poorly indexed externally. No r/531Discussion, r/weightroom, or r/531 threads about app recommendations surfaced this loop. Strategy unchanged: post on iOS launch day, not in response to existing threads.

## Expedition 44 — Research notes

**Date:** 2026-05-28

**GitHub README visual gap identified and addressed:** Per 2026 README best-practices research (DEV Community, multiple sources), the single biggest lever for GitHub README engagement is visual proof — screenshots or short GIFs that show the app in motion. The "What is this? Why should I care?" question must be answered in the first two lines, but the screenshot answers "Does this actually work?" which is what converts a visitor into someone who downloads or stars. A Screenshots placeholder section was added to the README with explicit instructions for Alex: which three screens to capture (Today queue, Live session with plate math, Session receipt), how to embed them, and why this matters. The iteration count was updated to 44+ throughout.

**App Store vibe-coding-flood context documented:** A 9to5Mac article (March 2026) reports that Apple's review times extended significantly due to AI-generated app submissions. iOS submissions are up 89% YoY; Apple's human review team processes 200,000+ submissions/week. Apple's concern is specifically apps where the developer cannot explain or defend the code — the hallmark of low-oversight vibe coding, not multi-agent engineering with CI enforcement. This is now documented as a comment-prep framing hook in both `docs/marketing/reddit-vibecoding-draft.md` and `docs/marketing/ai-experiment-story-outline.md`. If the topic comes up in HN or r/vibecoding comments, the answer is ready.

**Iteration counts updated throughout:** All "42+" references in marketing drafts updated to "44+": `docs/marketing/reddit-vibecoding-draft.md` (multiple references), `docs/marketing/longform-how-i-built-this.md`, `docs/marketing/ai-experiment-story-outline.md`.

**Market gap remains uncontested:** Corahealth synthesis of 200+ Reddit threads (May 2026) confirms no dedicated 5/3/1 tracker appears in any recommendation roundup. Strong, Hevy, Boostcamp, and FitNotes remain the dominant names. The "I couldn't find a clean 5/3/1+BBB tracker" premise is still accurate, uncontested, and honest.

**No live community threads found:** Reddit remains poorly indexed externally. No r/531Discussion or r/weightroom threads about app recommendations surfaced. Strategy unchanged: post on iOS launch day, not in response to existing threads.

## Expedition 43 — Research notes

**Date:** 2026-05-28

**App Store timing context confirmed:** iOS review times are now 2–7 days for new submissions (up from historical 24–48h). App releases on iOS are up 89% year-over-year as of April 2026, driven by AI coding tools. Apple's review team is processing dramatically more submissions with higher scrutiny. This affects launch planning: assume 3–7 day wait, have all posts pre-written, don't time the launch campaign around a specific day of submission.

**r/vibecoding comment prep sharpened:** New concrete data for the "CI enforcement" counter-argument. A security analysis of 1,645 Lovable-built apps found 170 with exploitable vulnerabilities. A survey of 18 CTOs found 16 reported production disasters from AI code. These are the specific outcomes the community is reacting to. 531 Strength's answer (CI-enforced boundaries, property tests, QA agent) is architectural, not aspirational — that distinction lands in a community that's seen the failures. Updated `docs/marketing/reddit-vibecoding-draft.md` with a "Expedition 43 signal" section including comment prep language.

**Launch-day operations guide created:** A consolidated hour-by-hour playbook for when iOS approval arrives. Previously the execution sequence was spread across five separate draft files; this guide pulls it together into one doc Alex can run against. Covers: what to do at hour 0, Day 1 (r/531Discussion), Day 2 (r/weightroom), Days 3–4 (X tweet), Week 1 (r/reactnative, r/vibecoding, HN), Weeks 2–3 (IH, Product Hunt), and ongoing channels. See `docs/marketing/launch-day-operations-guide.md`.

**App Store timing note added to questions-for-alex.md:** Context added so Alex knows the current review environment — what to expect, what rejection patterns look like, and why the privacy angle should be explicit in App Store metadata.

**No new community threads found:** Reddit search through web indices still returns no indexed r/531Discussion or r/weightroom threads. No live thread to respond to this loop. Strategy remains: post on iOS launch day, not in response to an existing thread.

**HN and IH traction signals remain positive:** Workout.cool (827 points, 233 comments, May 2026) confirmed the fitness Show HN appetite is real. The top criticism there (bad programming quality, no progression logic) is the exact criticism 531 Strength is immune to — pre-answering it in the HN first comment remains the right call. AI fitness coach Show HN also live in April 2026 — demonstrates the category is active and HN is engaging with it.

## Expedition 42 — Research notes

**Date:** 2026-05-28

**Community search verdict:** Reddit is not well-indexed externally. No specific r/531Discussion or r/weightroom threads surfaced where a user was actively asking for a 5/3/1 app recommendation — no live thread to respond to this loop. Check again next time iOS is live and use the App Store launch as the trigger to post.

**Market gap confirmed:** The 2026 strength app roundups (FindYourEdge, Jefit, Setgraph, Vora, The Manual, Built) still show Strong, Hevy, Boostcamp, and FitNotes as the primary options. No dedicated 5/3/1 tracker appears in any list. The gap that drives the r/531Discussion pitch ("I couldn't find a clean tracker for this specific program") remains accurate and uncontested.

**HN fitness app appetite is real:** Workout.cool (open-source fitness coaching PWA) got 827 points and 233 comments on Show HN May 2026. The primary criticism was programming quality — bad exercise order, no progression logic. 531 Strength is immune to that criticism because it implements an established, named program. This gives Alex a strong pre-answer: "The program is Jim Wendler's — I just implemented it faithfully." Add this framing to the HN first-comment prep. See updated `docs/marketing/ai-experiment-story-outline.md`.

**r/vibecoding framing sharpened:** The dominant community view in 2026 is "vibe coding is a prototyping methodology, not production." 531 Strength contradicts this directly — CI enforcement, property-tested domain logic, App Store live. The r/vibecoding post draft has been updated to lead with this contrast rather than just describing the architecture. See updated `docs/marketing/reddit-vibecoding-draft.md`.

**Product Hunt video is now highest-priority pre-launch asset:** Research confirms PH's 2026 algorithm weights engagement (comments, saves) over raw upvotes. Products with a 45-60 second muted demo video get significantly more engagement than screenshots-only. A screen recording of one live session (Today → Live → plate math → AMRAP → rest timer → session receipt) is now the #1 missing asset before PH launch. The guide has been updated with a spec. See `docs/marketing/producthunt-launch-guide.md`.

**No new blockers identified.** The existing blockers (App Store URL, GitHub Releases URL, Alex's Reddit history, personal 5/3/1 details) remain. Nothing unblocked this loop.

## Sources

- [5/3/1 BBB Reviews — Boostcamp](https://www.boostcamp.app/coaches/jim-wendler/5-3-1-boring-but-big/reviews)
- [Best Workout Tracker App Reddit — Setgraph](https://setgraph.app/ai-blog/best-workout-tracker-app-reddit)
- [Indie Maker Analytics 2024-2025 — IndieLaunches.com](https://indielaunches.com/indie-maker-analytics-2024-2025-projects/)
- [Low-Cost App Marketing — Indie App Santa](https://indieappsanta.com/2025/11/21/10349/)
- [Fitness App Privacy — TechRadar](https://www.techradar.com/computing/cyber-security/beware-80-percent-of-the-most-popular-fitness-apps-are-selling-out-your-privacy)
- [Best Strength Training Apps 2026 — FindYourEdge](https://www.findyouredge.app/news/best-strength-training-apps-2026)
- [Best Workout Tracker App Reddit 2026 — Cora Health](https://www.corahealth.app/blog/best-workout-tracker-reddit)
- [Workout.cool Show HN (827 points, 233 comments)](https://news.ycombinator.com/item?id=44309320)
- [Ask HN: How far has vibe coding come?](https://news.ycombinator.com/item?id=46807308)
- [Vibe Coding on Reddit — MorphLLM analysis](https://www.morphllm.com/reddit-vibe-coding)
- [Product Hunt Launch Guide — Tom Dekan](https://tomdekan.com/articles/product-hunt-launch-guide)
