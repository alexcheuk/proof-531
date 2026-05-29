---
name: organic-launch-strategy
description: Research-backed organic marketing strategy for launching 531 Strength. 12 concrete tactics, sequenced. Execute on iOS launch day. Each future loop should advance one item here.
---

# 531 Strength — Organic Launch Strategy

**Researched**: 2026-05-28 (Expedition 36)
**Status**: Pre-launch (iOS App Store submission in progress)

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
| 1. GitHub README polish | done · expedition 37 | Keywords, local-first/free/no-account messaging, process page link, AI-loop paragraph |
| 2. r/531Discussion post | draft ready · expedition 38 | Two options drafted (practitioner-frame + short). Needs: App Store URL, GitHub Releases URL, Alex's Reddit history, personal 5/3/1 details. See `docs/marketing/reddit-531discussion-draft.md` |
| 3. r/weightroom thread | draft ready · expedition 38 | Thread-reply option (recommended) + standalone option. Post 24h after tactic 2. See `docs/marketing/reddit-weightroom-draft.md` |
| 4. @jimwendler tweet | pending · wait for iOS | Needs Alex's X handle |
| 5. HN Show HN | strategy revised · expedition 40 | HN title/lead updated based on 2025 Show HN data: AI-first framing underperforms; now leads with personal story + real app, agent loop is secondary. Three title options provided. Pre-answered likely HN questions. /process page confirmed ready. See `docs/marketing/ai-experiment-story-outline.md` |
| 6. Indie Hackers | source draft ready · expedition 40 | Full longform narrative drafted as source asset. See `docs/marketing/longform-how-i-built-this.md` — extract sections 3+4 for IH post. |
| 7. Product Hunt | pending · wait 2-3wk post-iOS | |
| 8. r/reactnative | outline ready · expedition 38 | Technical angle drafted (stack + plate visualization). In same AI story doc. |
| 9. r/vibecoding | outline ready · expedition 38 | 1-paragraph version of the loop story drafted. In same AI story doc. |
| 10. r/privacy (opportunistic) | ongoing | |
| 11. T-Nation (opportunistic) | ongoing | |
| 12. In-app review prompt | pending · add to queue | |

## The long-form narrative asset

Alex flagged wanting to "share to the world a fun story on how I built this whole thing — the technical aspect, the fun aspect, the whole vibe code journey."

**Status: drafted (Expedition 40).**

The piece is at `docs/marketing/longform-how-i-built-this.md`. It's ~1,200 words and covers:
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
- 531.dev blog — consider whether a special non-expedition post for the full human narrative is worth adding

## Open questions (blocking launch-day posts)

See `docs/marketing/questions-for-alex.md` for the full list. Summary of blockers:

1. GitHub Releases URL for Android APK
2. App Store URL (available after iOS approval)
3. Alex's Reddit account history in lifting communities (affects standalone vs. thread-reply strategy)
4. Alex's personal 5/3/1 history (practitioner credibility framing — also needed for longform piece)
5. ~~Whether /process page exists~~ — RESOLVED (Expedition 40). The /process page at 531.dev/process is complete and ready to link.

## Sources

- [5/3/1 BBB Reviews — Boostcamp](https://www.boostcamp.app/coaches/jim-wendler/5-3-1-boring-but-big/reviews)
- [Best Workout Tracker App Reddit — Setgraph](https://setgraph.app/ai-blog/best-workout-tracker-app-reddit)
- [Indie Maker Analytics 2024-2025 — IndieLaunches.com](https://indielaunches.com/indie-maker-analytics-2024-2025-projects/)
- [Low-Cost App Marketing — Indie App Santa](https://indieappsanta.com/2025/11/21/10349/)
- [Fitness App Privacy — TechRadar](https://www.techradar.com/computing/cyber-security/beware-80-percent-of-the-most-popular-fitness-apps-are-selling-out-your-privacy)
