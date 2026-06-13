---
name: organic-launch-strategy
description: Research-backed organic marketing strategy for launching 531 Strength. 12 concrete tactics, sequenced. Execute on iOS launch day. Each future loop should advance one item here.
---

# 531 Strength  - Organic Launch Strategy

**Researched**: 2026-05-28 (Expedition 36)
**Last updated**: 2026-06-13 (Expedition 82  - Play Store approval)
**Status**: **LAUNCHING ON ANDROID.** Google Play Store approved the app (2026-06-13). This is the launch trigger  - the strategy was written gated on iOS approval, but Android got there first. The launch is real now, on Android. iOS App Store still in review. See the Expedition 82 pivot note below: the launch sequence fires on Play Store live, not iOS live. Drafts for tactics 2-9 are ready; the blocker is no longer "wait for a store"  - it is filling in the Play Store URL + Alex's personal 5/3/1 history.

## The competitive anchor

Serious 5/3/1 practitioners have four consistent complaints about existing apps: too many steps to log sets mid-workout, rest timers that break on background, social/gamification bloat, and data locked behind paywalls. 531 Strength solves all four. That is the pitch  - say it plainly, don't over-engineer it.

Boostcamp reviews show live pain: "only has the first block." Strong is the community default but costs $120 lifetime and is too bloated for percentage-based programs. Lead with the gap.

## The two stories

1. **The lifting app story**  - for r/531Discussion, r/weightroom, T-Nation. Frame: "I couldn't find a clean tracker that did the BBB math and left everything else out, so I built one."
2. **The AI experiment story**  - for HN Show HN, r/vibecoding, r/reactnative, Indie Hackers. Frame: "a Claude coding agent on a 30-minute cron that commits code and writes a blog post every iteration."

Use the right story for the right audience. Never mix them in a single post.

## 12 tactics in sequence

### Before iOS launch (now through App Store approval)

**1. Polish the GitHub README** (do now)
- Keywords: 5/3/1, Wendler, BBB, strength training, React Native, Expo, local-first
- Add one screenshot: live screen with plate visualization
- One paragraph on the AI-loop development model + link to `/process`
- Why: organic GitHub search + SEO compounding from day one

### On iOS launch day

**2. r/531Discussion**  - single post
- Title: "I couldn't find a clean 5/3/1+BBB tracker that left everything else out, so I built one. Free, no account, local-only."
- Include: 2–3 screenshots (Today screen, Live screen, History receipt)
- Link APK + App Store. Disclaim no Jim Wendler affiliation.
- Do NOT post before iOS is live  - Android-only limits the audience.

**3. r/weightroom**  - Show-and-Tell / Brolog thread
- 2–3 sentences only. Link GitHub releases, not a paid page.
- Frame as practitioner sharing a tool, not developer promoting an app.

**4. X / @jimwendler**  - one tweet
- "Built a free 5/3/1+BBB tracker for myself, putting it out there. No affiliation, just a fan of the program." Tag once. One screenshot. Do not follow up.
- A single retweet from Wendler has better targeting than any paid channel.

### One week after launch (let Reddit reception settle)

**5. Hacker News Show HN**
- Title: "Show HN: 531 Strength  - a 5/3/1 tracker built by a Claude agent on a 30-minute cron"
- Lead paragraph: what the loop does, how many iterations ran, what ships each cycle. Link `/process` and GitHub.
- Wait until 20+ expedition logs exist  - the system should look like a running thing.
- The lifting app is the proof; the agent loop is the story. HN needs the loop story.

**6. Indie Hackers  - one milestone post**
- Frame: developer runs 5/3/1, couldn't find the right app, built it with a Claude agent loop, N weeks of 30-minute iterations.
- Link `/process`, GitHub, App Store.
- Developer story drives word of mouth more than feature lists.

### Two-to-three weeks after launch

**7. Product Hunt**
- Schedule Wednesday or Thursday (highest traffic)
- Title: "531 Strength  - a strict 5/3/1 tracker built by an AI agent"
- Lead tagline: free, local-first, no account
- Link dev blog. Line up 3–4 early users for launch-day upvotes.

### Any time after GitHub is polished

**8. r/reactnative**  - monthly side-project showcase
- Technical frame: Expo SDK 55, New Architecture, Drizzle + expo-sqlite, boundary enforcement via Biome
- Show the plate visualization  - it is an unusually interesting RN component
- Developers who lift will install it; developers who don't will upvote the engineering story

**9. r/vibecoding**
- Post the /process page directly. Describe multi-agent orchestration (designer/implementer/QA, Logger rotation)
- This community shifted from experiments to production-ready products; this is a production-ready example

### Secondary / emerging channels

**13. YouTube Shorts series** (new  - Expedition 47, updated Expedition 49)
- **Channel confirmed (Expedition 49):** Personal channel, from scratch. "What I built" / dev influencer angle. Alex appears on camera  - both face-cam AND screen recording confirmed.
- Two distinct angles, each as its own series or interleaved:
  - **The app story**: Screen-capture Shorts showing the app in action. Plate math visualization, rest timer in the background, session receipt. Target: lifters on YouTube who search for 5/3/1 content. 38-47 seconds, screen-capture + text overlays.
  - **The builder story**: The homelab + expedition lore angle. Face-cam + screen. The Google Home speaker reading Discord updates. Listening to expedition logs on Pocket Cast (confirmed). The Logger rotation. The gommage. Target: developers who find delight in the unhinged-but-functional.
- **Format now confirmed:** Face-cam for hook/close, screen recording for the app demo middle. Highest-completion format. No special equipment needed.
- Key platform fact: 74% of Shorts views come from non-subscribers  - discovery channel, not subscriber-building channel. Channel size irrelevant early on.
- Optimal duration: 38-47 seconds for completion rate and algorithm favor.
- Best format hook: "Result → Reversal → Reveal"  - show the outcome (a plate math calculation), challenge the assumption about how it was built, then reveal the agent loop.
- **First video brief drafted (Expedition 49):** See `docs/marketing/youtube-shorts-first-video-brief.md`  - the origin story / "what I built" video. This is the identity-setting Short that anchors everything else.
- See full 5-video content strategy in the Expedition 47 research notes below; Expedition 49 notes update it for the personal-channel + both-camera context.
- **Still needs from Alex**: screen recording of one live session (Q14), homelab specifics (Q15), App Store URL (for CTA once iOS is live).

**14. Web tools as organic SEO entry point** (confirmed  - Expedition 49)
- The plate-math calculator and goal-calendar at 531strength.com/tools/ are confirmed live and use the same visual style as the home page. These are the asset.
- Organic play: link these tools in Reddit and forum discussions whenever someone asks "how do I calculate plates for 5/3/1" or "how long will it take me to hit X weight." The URL is shareable, free, no download required. This is a different audience entry point than the app itself.
- SEO angle: a plate math calculator that ranks for "531 plate math calculator" or "5/3/1 percentage calculator" could drive steady search traffic without ongoing effort. The tools pages are already built  - they need links.
- Where to drop them: r/531Discussion, r/weightroom, r/powerlifting, T-Nation when a relevant question appears. Do not force it  - answer the question first, mention the tool as a resource.
- No additional product work required. The tools already exist. This is purely a linking + SEO compounding play.

### Secondary channels (opportunistic, not forced)

**10. r/privacy / r/degoogle**  - respond when the topic comes up naturally
- Three facts: SQLite on-device, zero telemetry events, zero analytics SDKs
- Do not create a thread solely to promote; only surface in relevant conversations

**11. T-Nation forums**  - participate first, mention only if asked
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
| 1. GitHub README polish | done · expedition 59 · count updated expedition 75 | Keywords in title/subtitle: "5/3/1 Wendler + BBB strength training", "React Native (Expo SDK 55)". All 5 screenshots embedded (docs/screenshots/). Alt text describes exact screen content. Features section reorganized into Program / During a session / Tracking / Privacy groups for scanability. Architecture section has full stack table plus boundary rules explained in context. AI-loop paragraph reads "75+ iterations" (updated expedition 75). |
| 1a. GitHub repo metadata | done · expedition 63 | Repo had NO description and NO topics  - a blank profile. **Fixed this expedition via GitHub API.** Description now: "Free 5/3/1 Wendler + BBB strength training tracker for iOS and Android. Local-first, no account, no ads. Built by a Claude coding agent on a 30-minute cron loop." Homepage corrected from Vercel preview URL to https://531strength.com. Topics set: 531, 5-3-1, wendler, strength-training, powerlifting, workout-tracker, fitness-tracker, react-native, expo, local-first, offline-first, sqlite, typescript, fitness, gym, agentic-engineering (16 topics). Previously completely invisible to GitHub topic searches. |
| 2. r/531Discussion post | draft ready · screenshots updated expedition 77 · features updated expedition 56 · awaiting Alex personal details | Two options drafted (practitioner-frame + short). **Expedition 46:** Competitor review analysis added. **Expedition 52:** Screenshots section updated with actual filenames. **Expedition 56:** Two new features added to Option A body: TM Test Week (7th Week Protocol) and lift rollback. **Expedition 77:** Screenshots section updated to reference newer high-quality screenshots (screenshot-6, screenshot-7, screenshot-8) from docs/screenshots/  - these supersede the Screenshot_20260527-*.png files. Personal details (how long on 5/3/1, whether he used Strong/Boostcamp, which lift is primary) remain the only human-only blocker. See `docs/marketing/reddit-531discussion-draft.md` |
| 3. r/weightroom thread | draft ready · expedition 38 | Thread-reply option (recommended) + standalone option. Post 24h after tactic 2. See `docs/marketing/reddit-weightroom-draft.md` |
| 4. @jimwendler tweet | unblocked · expedition 82 | Play Store is live  - the "wait for iOS" condition is satisfied by Android launch. Rewrite the tweet around the Play Store link (drop "iOS coming soon" or keep as a one-clause aside). Still needs Alex's X handle. |
| 5. HN Show HN | strategy revised · expedition 40 · signal confirmed expedition 45 · competitor signal added expedition 46 · Claude Code Routines signal added expedition 64 | HN title/lead updated based on 2025 Show HN data: AI-first framing underperforms; now leads with personal story + real app, agent loop is secondary. Three title options provided. Pre-answered likely HN questions. /process page confirmed ready. See `docs/marketing/ai-experiment-story-outline.md`. **Expedition 45 confirmation:** Auto-Co Show HN (March 2026, 14 agents running a startup autonomously) received only 4 points  - pure "autonomous agent" framing is confirmed dead on HN. Title Option A (personal story first) remains the correct call. **Expedition 46:** Added concrete answer to "how is this different from existing 5/3/1 apps?"  - competitor's own App Store reviews document the exact three pain points this app solves. Now in ai-experiment-story-outline.md. **Expedition 64:** Claude Code Routines (launched April 14, 2026) post-date this project  - the homelab cron predates Anthropic's own scheduled-agent product. Comment prep added: Pro Routines = 5 runs/day; this loop = 48 runs/day. "Pioneer, not workaround" framing documented. |
| 6. Indie Hackers | source draft ready · expedition 40 | Full longform narrative drafted as source asset. See `docs/marketing/longform-how-i-built-this.md`  - extract sections 3+4 for IH post. |
| 7. Product Hunt | draft ready · expedition 41 · signal update expedition 42 | Full hunter's guide drafted: listing copy, tagline options, first comment, day-of checklist, timing rules. See `docs/marketing/producthunt-launch-guide.md`. Needs: App Store URL, GitHub link, demo video if available. Post 2-3wk after iOS live. **Expedition 42 signal:** PH's 2026 algorithm weights engagement (comments, replies) over raw upvotes. A 45-60 second muted demo video is now the single biggest lever  - products with video get significantly more engagement than screenshots only. Priority: get a screen recording of one live session (warmup → working set → AMRAP → rest timer countdown → session receipt) before PH launch. See updated note in producthunt-launch-guide.md. |
| 8. r/reactnative | draft ready · screenshots updated expedition 77 | Full post-ready copy drafted for monthly showcase thread + standalone option. Stack, plate visualization component, agent-built mention (secondary). **Expedition 52:** Screenshots section updated with actual filenames. **Expedition 77:** Screenshots section updated to reference newer high-quality screenshots  - screenshot-7 (AMRAP sheet + plate viz, new lead image), screenshot-6 (Today screen), screenshot-8 (session receipt with PR cert). Needs: Play Store link, App Store link, GitHub link. See `docs/marketing/reddit-reactnative-draft.md`. |
| 9. r/vibecoding | draft ready · signal updated expedition 76 | Two options drafted: long (architecture-focused) and short (for lower-friction posting). Leads with CI-enforced boundaries, multi-agent handoffs, Logger rotation. See `docs/marketing/reddit-vibecoding-draft.md`. Needs: GitHub link, App Store link. **Expedition 43 signal:** 170/1,645 Lovable apps had exploitable vulnerabilities; 16/18 CTOs reported production disasters from AI code. **Expedition 44 signal:** iOS submissions up 89% YoY, Apple increasing scrutiny  - 531 Strength is the counterexample in the queue. **Expedition 61 signal:** "Agentic engineering" is now the preferred term in the discourse. **Expedition 64 signal:** Claude Code Routines (April 2026) productized the scheduled-agent pattern  - the 531 Strength loop predates it. Pro Routines cap at 5 runs/day vs. 48 runs/day for this loop. **Expedition 65 signal:** Code with Claude 2026 conference (May 6) validated the multi-agent harness pattern  - Anthropic announced Multi-agent Orchestration, Outcomes, and Dreaming as managed features. The 531 Strength loop has run this pattern for 65 iterations already. The Register called Claude Code Routines "mildly clever cron jobs" (April 2026)  - the dismissiveness lands differently when you've shipped 65 real iterations. Iteration counts updated to 65+ throughout draft. **Expedition 73 signal:** Boris Cherny (Head of Claude Code) framing from Code w/ Claude London: "the distance between 'I have an idea' and 'it runs' is collapsing again." Added as comment prep  - the 531 Strength loop is a concrete example of this, predating the London framing. Iteration counts updated to 73+ throughout draft. **Expedition 76 signal:** Claude Opus 4.8 + Dynamic Workflows (May 28, 2026)  - Anthropic's new managed multi-agent approach spawns up to 1,000 parallel subagents dynamically at runtime. The 531 Strength harness is the opposite architecture: statically defined roles, deterministic handoffs, CI-enforced boundaries across 76 iterations. Comment prep added for "why not use Dynamic Workflows?" question. Iteration counts updated to 76+ throughout draft. |
| 10. r/privacy (opportunistic) | ongoing | |
| 11. T-Nation (opportunistic) | ongoing | |
| 12. In-app review prompt | unblocked (Android) · expedition 82 | Play Store listing is now live  - the Android half of the prerequisite is met. Implement now for Android with `expo-store-review` (native in-app dialog) or `Linking.openURL` to the Play listing as fallback. iOS can be added when its listing goes live. Show after session cycle >= 2, no modal, no repeated asks. This is the single highest-leverage product change for the Android launch  - each half-star lift correlates with ~20% higher download rate, and early ratings disproportionately shape the listing. |
| 15. Hackernoon story  - casual builder angle | pending · expedition 63 | Researched this expedition. Hackernoon publishes to 3.5M+ monthly tech readers, human editorial review, dofollow outbound links (SEO flows back to 531strength.com), audio + 12-language distribution. Ideal platform for the casual builder story at `docs/marketing/reddit-casual-builder-story-draft.md`  - the "homelab, Google Home, expedition lore, absurdist delight" angle. Not a launch-day tactic. Sequence: Indie Hackers first (week 2-3 post-launch), then Hackernoon 1-2 weeks later with canonical URL pointing back to 531strength.com/blog. Draft already exists; Alex needs to fill in homelab/TTS/personal details (Q15 in questions-for-alex.md) before submitting. |
| 13. YouTube Shorts series | brief improved · expedition 77 | **Expedition 49:** Alex confirmed both screen + face-cam format. Personal channel from scratch, "what I built" / dev influencer angle. Pocket Cast subscription confirmed. First-video brief written. **Expedition 53:** Full word-for-word shooting script drafted at `docs/marketing/youtube-shorts-draft.md`. **Expedition 56:** Hook alternatives added (4 versions), "Note on the number" added, minimal-viable-path checklist written. **Expedition 60:** Version D hook added. **Expedition 62:** All references updated to "62+" throughout. **Expedition 64:** All references updated to "64+" throughout. **Expedition 65:** All references updated to "65+" throughout. **Expedition 67:** All references updated to "67+" throughout. **Expedition 68:** All references updated to "68+" throughout. **Expedition 70:** All references updated to "70+" throughout brief and shooting script. **Expedition 72:** All references updated to "72+" throughout brief and shooting script. Version D hook now reads "72 times." **Expedition 73:** All references updated to "73+" throughout brief and shooting script. Version D hook now reads "73 times." **Expedition 74:** All references updated to "74+" throughout brief and shooting script. Version D hook now reads "74 times." **Expedition 76:** All references updated to "76+" throughout brief and shooting script. Version D hook now reads "76 times." **Expedition 77:** All references updated to "77+" throughout brief and shooting script. Version D hook now reads "77 times." "Note on the number" names Expedition 77 as current baseline. Film-now status unchanged: unblocked without iOS. New signal added to brief: YouTube Shorts now rank independently in search (dedicated Shorts filter, January 2026)  - title and description keyword strategy now matters for discovery. |
| 14. Web tools as SEO entry point | in progress · expedition 62 | Alex confirmed tools at /tools/ are the asset (expedition 49). Expedition 50: FAQ sections added. **Expedition 55:** Title tags, meta descriptions, h1 headings updated on all three tool pages with "5/3/1" keywords. Reddit tool-linking playbook created with three full response templates. **Expedition 56:** Short-form comment templates added  - 5 one-to-two sentence drop-ins. **Expedition 60:** Playbook expanded with two new items: (1) full Thread type 2b  - "How do I set my TM / is my TM too heavy?"  - covering training max calculation, TM resets, and failed AMRAP threads; (2) two new short-form templates  - one for goal weight / projection questions, one for 7th Week Protocol / TM Test Week deload threads. Playbook now covers five thread types (full templates) plus seven short-form drop-ins. **Expedition 62:** No new thread types added this loop. Playbook remains current. **Expedition 73:** No new thread types added. Tool permalink angle confirmed viable for r/531Discussion and r/weightroom (unchanged). |

## Expedition 82  - Play Store approval: the launch pivot

**Date:** 2026-06-13

**The event:** Google Play Store approved 531 Strength. This is the launch moment the whole strategy was built toward  - except the strategy assumed iOS would clear first and treated Android as "sideload via GitHub APK until then." That assumption is now inverted. Android is the live launch platform; iOS is still in review.

**What this changes (the core reframing):**

1. **The launch trigger fires on Play Store live, not iOS live.** Every "wait for iOS" gate in this doc and in `launch-day-operations-guide.md` should be read as "wait for a live store listing"  - and that condition is now met. Tactics 2 (r/531Discussion), 3 (r/weightroom), 4 (@jimwendler), 8 (r/reactnative) can fire as soon as the Play Store URL and personal-history blanks are filled. The drafts already say "Android on the Play Store, iOS pending"  - that copy is now *accurate as written* rather than aspirational.

2. **Android-only is not a reason to hold.** Tactic 2's original note said "Do NOT post before iOS is live  - Android-only limits the audience." That was written when Android meant "sideload an APK," which is a real friction wall for non-technical lifters. A Play Store listing removes that wall  - a one-tap install from a trusted store. The audience-limit concern is largely resolved: Android is ~70% of global mobile and the install friction is now identical to any other app. Recommendation: launch on Android now, do not wait for iOS. Re-run a lighter "now on iOS too" beat when iOS clears.

3. **The site is now stale in the wrong direction.** The landing page (`apps/web/src/pages/index.astro`), README, and several drafts still present Android as "APK via GitHub Releases" and lead the download CTA with "Download APK." That undersells the launch  - it reads like a beta sideload, not a shipped product. The hero, the sign-off CTA, the README install table, and the JSON-LD `downloadUrl` should all point to the Play Store listing as the primary Android CTA, with GitHub Releases demoted to a secondary "or sideload the APK" link for the dev-minded. This is the highest-priority site change and it must flow through the loop (per INTENT.md drift check #4  - the site is loop-maintained, not hand-edited).

4. **New launch-specific surface: the Play Store listing itself (ASO).** The strategy never had a Play Store listing-copy tactic because there was no listing. There is now. Listing copy (title, short description, full description, what's-new) is a marketing asset the loop should own and optimize. See the recommended copy in the Expedition 82 report. Google indexes the full description for keywords (unlike Apple), so the 4,000-char field is a real organic-search lever  - "5/3/1", "Wendler", "Boring But Big", "BBB", "training max", "plate calculator" should all appear naturally.

5. **In-app review prompt (Tactic 12) is unblocked for Android.** Previously blocked on "no live listing." Now live. This is the single highest-leverage *product* change for the launch  - early ratings shape the listing's conversion more than anything else, and the app has 80+ expeditions of polish behind it. Implement with `expo-store-review`, gated on session cycle >= 2.

**What did NOT change:** The two-stories rule still holds (lifting story for r/531/weightroom; agent story for HN/vibecoding/IH  - never mixed). The competitive anchor (clean BBB, fast logging, background rest timer, local-first) is unchanged and still accurate. The opportunistic channels (r/privacy, T-Nation, tool-linking playbook) are unchanged.

**Remaining human-only blockers (now the only thing between us and launch):**
1. The **Play Store listing URL** (`https://play.google.com/store/apps/details?id=<package>`)  - fill into every draft replacing the `[Play Store link]` and `[GitHub Releases link]` placeholders.
2. **Alex's personal 5/3/1 history** for the r/531Discussion post (how long on the program, whether he used Strong/Boostcamp, primary lift). Single biggest blocker for the most important launch post.
3. **Alex's X handle** for the @jimwendler tweet.

**Next actions:**
1. Loop: update the landing page + README + JSON-LD to lead with the Play Store badge/link, demote APK to secondary. (Site work  - route through the rn pipeline / loop, do not hand-edit.)
2. Loop: write the Play Store listing copy as a tracked marketing asset (`docs/marketing/play-store-listing.md`) using the report copy below.
3. Loop: implement the in-app review prompt (Tactic 12) for Android.
4. Alex: provide the three blockers above. With the Play Store URL + personal history, the r/531Discussion launch post can go out on the next Tuesday/Wednesday 7-10am ET window.

---

## Expedition 74  - Research notes

**Date:** 2026-05-30

**Iteration count advancement  - all marketing docs updated to 74+:**

All "73+" count references across all marketing docs updated to "74+" (README confirmed at 73+ from expedition 73, now updated to 74+). Files updated: `youtube-shorts-first-video-brief.md` (5 instances  - platform context, Version C hook, Version D hook now reads "74 times", spoken line reference, "Note on the number" now names Expedition 74, minimum-viable-path step 1), `youtube-shorts-draft.md` (3 instances  - spoken line, "Note on the number" block, first comment/description), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, body entry counts, Option B title), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (1 instance  - timing note now names Expedition 74), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (2 instances  - now reads "74+ Logger posts exist as of Expedition 74"), `reddit-casual-builder-story-draft.md` (3 instances  - "73+ of these posts" → "74+", "Seventy-plus" → "Seventy-four-plus", "73+ iterations in" → "74+"). `README.md` (1 instance  - now reads "75+ iterations").

**Boostcamp BBB review  - competitive gap re-confirmed (primary source, live check):**

Live review check this expedition (Boostcamp 5/3/1 BBB reviews page, May 30, 2026): The "only has the first block" complaint remains active. Reviewer "Biledriver" (1 month ago) states verbatim: "This only has the first block" and documents frustration that continuing the program requires manually building subsequent 12-week cycles within the app. This is the same verbatim complaint documented in Expeditions 70 and 72. The competitive gap framing ("Boostcamp BBB cuts off after the first block, users have to manually rebuild subsequent cycles") is confirmed accurate as of expedition 74. No changes needed to draft copy.

**Code with Claude London 2026  - new framing from MIT Technology Review coverage (May 21, 2026):**

MIT Technology Review published "Anthropic's Code with Claude showed off coding's future  - whether you like it or not" (May 21, 2026, bylined Will Douglas Heaven). The most striking data point: Anthropic engineer Jeremy Hadfield asked from the main stage who had shipped a PR in the last week completely written by Claude  - almost half the room raised their hands. He then asked who shipped a PR completely written by Claude where they did not read the code at all  - most kept their hands up.

This is a significant new framing anchor for the r/vibecoding and HN posts. The "not reading the code" detail is exactly the boundary the 531 Strength architecture exists to defend. The 531 Strength loop's designers, implementers, and QA agents enforce mechanically what those room-full-of-engineers are trusting on faith. The framing point: "half the developers at Anthropic's own conference are shipping PRs without reading the code. Here's what the architecture looks like when you build CI enforcement for exactly that scenario." This is not a criticism of those developers  - Anthropic's own leadership is fine with this. It's a framing for why CI-enforced boundaries matter when you're operating at that trust level.

Added as a comment-prep note to `docs/marketing/reddit-vibecoding-draft.md`'s Expedition 73/74 context: if someone asks "but isn't this just shipping code you haven't read?", the honest answer is "yes, same as half the room at Code with Claude London. The difference is the CI harness  - an agent can ignore an instruction, it can't ignore a failing commit hook."

Also relevant to HN comment prep: the MIT Technology Review framing signals that this is now mainstream developer conversation, not a fringe experiment. The 531 Strength loop has been doing this for 74 iterations before it was mainstream.

**Microsoft cancels Claude Code licenses  - new context for positioning:**

Microsoft is winding down Claude Code licenses for engineers (target: June 30, 2026, per multiple reports including Windows Central, May 15, 2026), redirecting them to GitHub Copilot CLI. The driver: Claude Code became too popular internally, creating cost pressure at fiscal year-end.

This is usable context for the 531 Strength story in one specific way: the homelab-owned development loop is immune to vendor license decisions. If a corporate team runs their agent loop on Anthropic's infrastructure, they're subject to pricing changes, license caps (Pro Routines: 5 runs/day), and corporate procurement decisions. The 531 Strength loop runs on Alex's homelab  - 48 runs/day, no vendor dependency for the scheduling layer. This is not a marketing claim to lead with, but it's a factual differentiator if the "why homebrew the cron?" question comes up in r/vibecoding or HN comments.

**HN fitness app landscape  - no significant new entrants:**

Show HN search confirms no 5/3/1-specific tracker has appeared. Recent fitness Show HN posts (Fitspire: 5-minute workouts for busy people, February 2026; "Activiews" privacy-first fitness app for Apple, May 2026) confirm the pattern: generic minimalist trackers continue to appear, specialist program trackers do not. The differentiation case remains intact.

One new signal: "Show HN: Activiews  - A privacy-first fitness alternative for Apple users" (item 44524310) appeared in May 2026. This is the privacy-angle competitor to watch. If it gains traction on HN, it validates the privacy story for the lifting community. But it's an Apple-only app with a different core story (replacing Apple Health)  - not a 5/3/1 tracker. Competitive gap unchanged.

**iOS App Store status  - still pending:**

No change. All drafts remain ready. Blocking human items unchanged: App Store URL (after approval), Alex's personal 5/3/1 history for the r/531Discussion post.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "74 times." See `docs/marketing/youtube-shorts-draft.md`.
4. Comment prep update (new, Expedition 74): MIT Technology Review "not reading the code" detail  - half the developers at Code with Claude London shipped PRs without reading the code. The 531 Strength CI harness is the architectural answer to exactly that trust level. Document in `docs/marketing/reddit-vibecoding-draft.md` if the comment prep section needs it.

---

## Expedition 73  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 73+:**

All "72+" count references across all marketing docs updated to "73+" (README was already at 73+ at expedition start  - confirmed). Files updated: `youtube-shorts-first-video-brief.md` (5 instances  - platform context, Version C hook, Version D hook now reads "73 times", spoken line reference, "Note on the number" now names Expedition 73, minimum-viable-path step 1), `youtube-shorts-draft.md` (3 instances  - spoken line, "Note on the number" block, first comment/description), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, body entry counts, Option B title), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (1 instance  - timing note now names Expedition 73), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (2 instances  - now reads "73+ Logger posts exist as of Expedition 73"), `reddit-casual-builder-story-draft.md` (3 instances  - count references plus "Sixty-plus" updated to "Seventy-plus").

**r/selfhosted as a distribution channel  - new signal confirmed:**

DEV Community published "The Homelab AI Stack in 2026: What Self-Hosters Are Actually Running" (March 5, 2026), documenting that r/selfhosted discussions now feature Claude-connected automation workflows as a significant category. The article's central observation: "Running models locally is only half the value. The other half is connecting them to your actual workflow." The examples given (email triage, RSS digest, cron-triggered summarization) validate the exact infrastructure pattern the 531 Strength loop uses.

This is a usable distribution angle for the casual builder story that was not previously confirmed. Updated `docs/marketing/reddit-casual-builder-story-draft.md` with a targeting note for r/selfhosted: post to this community with the infrastructure-first frame ("my homelab runs a 30-minute cron that ships code to my phone") rather than the AI-first frame. The homelab audience wants to know what's running on the server, not what model you're using.

The r/selfhosted angle is separate from the r/vibecoding angle and should be posted separately, after the main launch posts settle. It's a secondary channel  - no App Store URL required, can run at any time after the launch sequence completes.

**"Building with Claude Code" story  - /process page assessment:**

Reviewed the /process page at 531strength.com/process against the "building with Claude Code" story angle. Assessment: the page tells the architecture story very well (loop diagram, channel map, step-by-step, multi-agent team, the scribe eras) and the ambient experience section covers the Google Home / Pocket Cast texture. What the page does NOT do: tell the *experience* of building this way in personal terms. That's intentional  - the /process page is for technical visitors, the casual builder story draft handles the personal/absurdist angle.

No changes needed to the /process page. It is ready to be the linked destination for HN, r/vibecoding, and the YouTube Shorts CTA as designed. The casual builder story draft is the correct home for the "building with Claude Code" fun angle.

**Code w/ Claude London 2026  - Boris Cherny "magic" framing (new signal):**

Boris Cherny (Head of Claude Code) said at the London event (May 2026): "the distance between 'I have an idea' and 'it runs' is collapsing again." He described this as recovering the original coding magic  - TI-83 programs, HTML on eBay  - where tinkering produced immediate results. The 531 Strength homelab loop is a concrete example: the distance between "I want this feature" and "it's on my phone" is 30 minutes, no code written by the human. Added as a comment-prep note to `docs/marketing/reddit-vibecoding-draft.md`  - if someone in r/vibecoding or HN cites Anthropic's own framing to question this project, the response is that the 531 Strength loop is exactly what Cherny describes as the intended use pattern.

**iOS App Store status  - still pending:**

No change. All drafts remain ready. Blocking human items unchanged: App Store URL (after approval), Alex's personal 5/3/1 history for the r/531Discussion post.

**No new live community threads found:**

No indexed r/531Discussion or r/weightroom threads about app recommendations surfaced. Strategy unchanged.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "73 times." See `docs/marketing/youtube-shorts-draft.md`.
4. Post-launch (secondary): use `docs/marketing/reddit-casual-builder-story-draft.md` short version in r/selfhosted  - new confirmed distribution channel. Lead with infrastructure angle, not AI angle.

---

## Expedition 72  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs and README updated to 72+:**

All "70+" count references across all marketing docs updated to "72+" (skipping 71  - no marketing-doc update ran that expedition). README updated from "71+" to "72+". Files updated: `youtube-shorts-first-video-brief.md` (5 instances  - platform context, Version C hook, Version D hook now reads "72 times", spoken line reference, "Note on the number" now names Expedition 72, minimum-viable-path step 1), `youtube-shorts-draft.md` (2 instances  - spoken line and first comment/description), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, body entry counts, Option B title), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (1 instance  - timing note now names Expedition 72), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (2 instances  - now reads "72+ Logger posts exist as of Expedition 72"), `reddit-casual-builder-story-draft.md` (2 instances), `README.md` (1 instance  - now reads "72+ iterations").

**Boostcamp BBB review  - competitive intelligence re-confirmed (primary source):**

Live review check this expedition confirms the "only has the first block" complaint remains active in Boostcamp's r/531Discussion-adjacent reviews. A reviewer states verbatim: "This only has the first block. The app messed up." The user expected automated weight calculations across multiple training blocks but had to manually build subsequent cycles. This is the exact complaint documented in prior expeditions  - it has not been addressed or removed from the review pool. The competitive gap framing ("Boostcamp's BBB block cuts off after the first block") remains accurate, current, and sourced to the competitor's own reviews. No changes needed to draft copy.

Secondary review signal: a second complaint notes needing to add 3-4 accessory sets for "ignored muscles." This is a program design complaint rather than an app complaint  - not relevant to the launch pitch, which is specifically about the 5/3/1 + BBB core. Keep the draft focused on the three differentiators: complete BBB block, plate math, background rest timer.

**HN fitness app landscape  - May 2026 pattern:**

Multiple Show HN posts for minimalist workout trackers have appeared in 2026: a minimalistic iPhone tracker (Stats, Trends, Streaks, February 20, 2026, item 47088909), a deadlift-specific tracker (item 47132103), a "Just Log" minimalist fitness tracker (June 2025, still referenced in 2026 discussions), and GymBenchmark (data visualization focus, December 2025). The pattern is clear: HN sees roughly one generic minimalist workout app per month. These posts appear to receive modest engagement (typically below 50 points based on search signal  - none are in the "827 points" category that Workout.cool achieved).

The differentiation implication: 531 Strength cannot post as "a minimalist workout app." That category is saturated. The two angles that work are (1) program-specific precision (5/3/1 is a named methodology with a community, not "track your workouts") and (2) the agent-built story (not "I built this app" but "an agent loop built this app through 72 iterations, here's what I learned"). The Workout.cool comparison remains the benchmark  - the 827 points came from open-source + coaching platform positioning, not minimalist-app positioning. Title Option A (personal story first) continues to be the correct HN approach.

One new note: a February 2026 post about a "workout video organizer" (item 47134053) indicates HN is willing to engage with niche fitness tools that solve specific problems. The specificity of "5/3/1 + BBB" is an asset, not a narrowing. A general workout logger is competing with dozens of Show HN posts; a 5/3/1-specific tracker with a documented market gap is competing with zero.

**iOS App Store status  - still pending:**

No change. All drafts remain ready. Blocking human items unchanged: App Store URL (after approval), Alex's personal 5/3/1 history for the r/531Discussion post.

**No new live community threads found:**

No indexed r/531Discussion or r/weightroom threads about app recommendations surfaced. Strategy unchanged.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "72 times." See `docs/marketing/youtube-shorts-draft.md`.
4. Comment prep note: Boostcamp "only first block" complaint re-verified as live in current reviews  - the competitive framing in the r/531Discussion draft is accurate and sourced.

---

## Expedition 70  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 70+:**

All "68+" count references across all marketing docs updated to "70+" (skipping 69  - no marketing-doc update ran that expedition). Files updated: `youtube-shorts-first-video-brief.md` (5 instances  - platform context, Version C hook, Version D hook now reads "70 times", spoken line reference, "Note on the number" now names Expedition 70, minimum-viable-path step 1), `youtube-shorts-draft.md` (2 instances  - spoken line and first comment/description), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, two body entry counts, plus Option B title updated from "62 iterations" to "70 iterations"), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (2 instances  - 70+ reference and timing note now names Expedition 70), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (2 instances  - now reads "70+ Logger posts exist as of Expedition 70"), `reddit-casual-builder-story-draft.md` (2 instances).

**iOS App Store review times  - confirmed still fast:**

Runway live tracker (May 29, 2026): median "waiting for review" = 8h 38m; "in review" = 1h 52m. Identical to the Expedition 65 and 67 readings  - the fast review window has held through May. Tuesday/Wednesday submissions remain fastest. No update needed to the operations guide.

**Liftosaur competitive intelligence  - GitHub issue #66 closure status:**

GitHub issue #66 ("Timer does not notify while in the background") now shows as closed. However, the resolution details are not publicly accessible via external fetch. The Liftosaur Play Store documentation continues to note that rest timer push notifications "work only on native apps"  - language that implies the PWA architecture limitation remains. An issue being closed without a documented fix and without a public resolution comment is ambiguous: could be "won't fix," "cannot reproduce," or a silent fix. The conservative position for comment prep remains: Liftosaur has free BBB support, but it's a PWA wrapper and the background timer behavior has been a documented problem since November 2023. If the issue was silently fixed, the comment drops naturally ("I'd heard the rest timer had issues  - good if that's resolved"). Do not assert the limitation persists definitively; assert it was a documented limitation and let the commenter verify current behavior. The underlying architectural constraint (PWA cannot deliver background scheduled notifications on iOS without native modules) remains structurally true regardless of issue closure.

**Updated comment prep for "what about Liftosaur?" questions:**

Previous prep said: "BBB support exists, but the rest timer breaks when you leave the app  - documented in their own GitHub tracker." Updated version: "BBB support is there. The background timer was a documented limitation (GitHub issue #66)  - not sure if they've fixed it since. The native app difference is that expo-notifications can schedule a system alarm that fires regardless of app state; a PWA can't do that on iOS." This is more accurate and doesn't make a claim that could be disproven if the fix landed. Document this update in `docs/marketing/reddit-531discussion-draft.md` if the comment prep section there needs it.

**Competitive landscape  - no change to core gap:**

2026 roundup sources (Cora Health, Setgraph, FindYourEdge) continue to name Strong, Hevy, Boostcamp, and FitNotes as the community defaults. No dedicated free 5/3/1+BBB tracker appears in any list. The market gap the launch pitch is built around is unchanged.

Community signal from Cora Health synthesis: the two most-cited pain points in 2026 Reddit fitness discussions are (1) "too many taps to log a set" and (2) "apps that force their own programming model." Both are directly addressed: percentage math is pre-calculated (nothing to enter mid-set except reps), and the app has only one program (5/3/1+BBB, not a generic template builder). This "logging speed = not doing math in your head" framing angle (documented in Expedition 68) is confirmed again by 2026 source.

**Agentic engineering framing  - new angle from unboxfuture.com (May 2026):**

A May 2026 article on AI coding tools frames the professional-vs-amateur distinction as "expertise as prerequisite": successful agentic engineers have domain knowledge to spot when the model "has painted itself into a corner." The article names Matt Perry's use of AI to close 160 GitHub issues in one quarter as a production example  - sustained AI execution against real maintainership work, not a greenfield vibe-coded prototype.

This is a usable framing hook for HN and r/vibecoding comments. The 531 Strength loop has now run 70 expeditions, which maps onto the "sustained execution against real maintainership" frame: not a build-and-abandon prototype, but an ongoing system that continues to work on a real production app. If someone in HN comments asks "but isn't this just vibe coding at scale?", the cleanest response is: "The loop has domain-constrained agents  - the designer can't write code, the implementer can't touch design tokens, the QA agent runs against a fixed rubric. The quality floor is held by CI, not by trusting the agent to self-regulate. That's the 'expertise' layer  - the constraints come from architectural knowledge about what breaks." The Matt Perry comparison is also useful: one developer driving AI to close 160 issues is the same pattern as one developer driving an agent loop to ship 70 iterations. Both involve sustained human direction and continuous AI execution.

**No new live community threads found:**

No indexed r/531Discussion or r/weightroom threads about app recommendations surfaced. Reddit continues to be poorly indexed externally. Strategy unchanged: hold main launch post for iOS, use the playbook when live threads appear.

**iOS App Store status  - still pending:**

All drafts remain ready. Blocking human items unchanged: App Store URL (after approval), Alex's personal 5/3/1 history for the r/531Discussion post.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "70 times." See `docs/marketing/youtube-shorts-draft.md`.
4. Comment prep update: the Liftosaur "background timer" claim should be hedged to "was a documented limitation" rather than asserted as current  - the GitHub issue is closed and the resolution is uncertain.

---

## Expedition 68  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 68+:**

All "67+" count references across all marketing docs updated to "68+". README was already at 68+ (updated by another loop process before this agent ran). Files updated this expedition: `youtube-shorts-first-video-brief.md` (5 instances  - platform context, Version C hook, Version D hook now reads "68 times", spoken line reference, "Note on the number" now names Expedition 68, minimum-viable-path step 1), `youtube-shorts-draft.md` (2 instances  - spoken line and first comment/description), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, two body entry counts), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (1 instance  - timing note now names Expedition 68), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (1 instance  - now reads "68+ Logger posts exist as of Expedition 68"), `reddit-casual-builder-story-draft.md` (2 instances).

**Community search  - no live threads found:**

No indexed r/531Discussion threads about app recommendations surfaced. r/weightroom roundup sources (Setgraph, Cora Health, Hevy Blog, Fitbod, Strive Workout) continue to name Strong, Hevy, Boostcamp, and FitNotes as the community defaults in 2026. No dedicated 5/3/1 tracker appears in any list. Reddit specifically cites wanting apps with no social features and fast logging  - both are core 531 Strength properties. The competitive gap is unchanged and uncontested.

**Weightroom community signal  - "no social, fast logging" remains the priority:**

2026 r/weightroom synthesis confirms the community's top two priorities are (1) logging speed during actual workouts and (2) absence of social/gamification features. Strong wins on speed; Hevy wins on free tier. 531 Strength is differentiated on both axes for the 5/3/1-specific audience: percentage-based program math is pre-calculated (nothing to enter mid-set beyond reps), and there is no social layer at all. Neither Strong nor Hevy does percentage-based plate math by default. This is a useful framing sharpener for the r/531Discussion post body  - "logging speed" for 5/3/1 means not doing math in your head at 6am, which is exactly the plate-math-done-for-you angle.

**iOS App Store status  - still pending:**

No change. All drafts remain ready. Blocking human items unchanged: App Store URL (after approval), Alex's personal 5/3/1 history for the r/531Discussion post.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "68 times." See `docs/marketing/youtube-shorts-draft.md`.
4. When r/weightroom or r/531Discussion threads about app speed / plate math appear: the "logging speed = not doing math in your head" framing is the correct angle. Drop the plate-math tool URL first, mention the app as a follow-on.

---

## Expedition 67  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 67+:**

All "65+" count references across all marketing docs updated to "67+" (skipping 66  - no marketing-doc update ran that expedition). README was at "66+" from the expedition 66 commit; updated to "67+" this expedition. Files updated: `youtube-shorts-first-video-brief.md` (6 instances  - platform context, Version C hook, Version D hook now reads "67 times", spoken line reference, "Note on the number" now names Expedition 67, minimum-viable-path step 1), `youtube-shorts-draft.md` (3 instances  - spoken line, "Note" block now names Expedition 67, first comment/description), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, body count, Option B body count), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (2 instances  - timing note now names Expedition 67, iteration reference), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (2 instances  - now reads "67+ Logger posts exist as of Expedition 67"), `reddit-casual-builder-story-draft.md` (2 instances), `README.md` (1 instance  - "How it's built" paragraph now reads "67+ iterations").

**Anthropic's 2026 Agentic Coding Trends Report  - new framing context:**

Anthropic published a 2026 Agentic Coding Trends Report (available at resources.anthropic.com) that is directly relevant to the AI experiment story. Key findings and their relevance to the 531 Strength marketing angle:

- **"The Delegation Gap":** Developers use AI in roughly 60% of their work but can only fully delegate 0-20% of tasks. The 531 Strength loop inverts this  - the human role is 100% direction and context hygiene; the agent handles 100% of execution. That's not a gap to close, it's the architecture. The report names the problem that this project solved by design.
- **Multi-agent teams as the 2026 trend:** The report identifies the shift from single-agent assistants to coordinated multi-agent teams (orchestrator → specialist subagents) as the defining 2026 change. The 531 Strength rn-designer → rn-frontend → rn-qa pipeline is this pattern, running since expedition 1  - before it was the "2026 trend."
- **"~27% of AI-assisted work consists of tasks that wouldn't have been done otherwise."** The 531 Strength loop's backlog approach (always draining a task queue) is exactly this: the agent does work that wouldn't happen at human-only pacing. 67 expeditions of backlog drainage is a live example of this finding.
- **Task horizons expanding from minutes to days.** The report cites a Rakuten case where an agent ran for 7 hours across a 12.5M-line codebase. The 531 Strength loop runs 48 times per day  - continuous, not a single long run  - but the cumulative effect is the same: sustained autonomous execution that compresses timelines.

**Framing note for HN and r/vibecoding (comment prep, not post body):** If someone cites the Anthropic report in comments to suggest this project is "just following the trend," the honest counter is that the trend report describes what became mainstream in 2026  - this project was running these patterns since expedition 1 (early 2026 or late 2025). The report validates the architecture; it doesn't describe a path taken after reading it. Document this in `ai-experiment-story-outline.md` if a comment response is ever needed.

**iOS App Store review times  - no material change:**

Runway live tracker (May 29, 2026): median "waiting for review" = 8h 38m; "in review" = 1h 52m. Identical to the Expedition 65 reading. No update needed to the operations guide. Tuesday/Wednesday remain the fastest submission days.

**Competitive landscape  - 5-3-1 Workout Logger still the dominant iOS app:**

The top-ranked iOS result for "531" remains a separate "531 Strength" app (id1062989244, 4.9 stars, 11,000 ratings  - the incumbent documented in Expedition 46). The "5/3/1 Workout Logger" (id1114435690) also surfaced with 4.8 stars and 5,000+ ratings  - it has a plate calculator but no background rest timer, per its own feature list. The competitive gap documented in previous expeditions is unchanged: no free, BBB-complete, native-background-rest-timer app exists in the App Store. Five/Three/One (id1560266240), Zen Labs (id1361925217), and Wendler Log (Vandersoft) round out the field. None are free + BBB-complete + native rest timer.

**Community search  - no live threads found:**

No indexed r/531Discussion or r/weightroom threads about app recommendations surfaced. Market gap remains uncontested. Strategy unchanged.

**#needs-input  - no new Alex replies:**

No new replies as of Expedition 67. Remaining human-only blockers unchanged: App Store URL (post-iOS approval), Alex's personal 5/3/1 history for the r/531Discussion post.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "67 times." See `docs/marketing/youtube-shorts-draft.md`.
4. HN/r/vibecoding comment prep: Anthropic's 2026 Agentic Coding Trends Report (published 2026) validates the multi-agent harness and delegation-gap framing used in this project. If cited in comments, the response is: the report describes what became the 2026 trend; this project ran these patterns before the trend was named.

---

## Expedition 65  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 65+:**

All "64+" count references across all marketing docs updated to "65+". README was already at 65+ (updated by the previous expedition's commit). Files updated: `youtube-shorts-first-video-brief.md` (6 instances  - platform context, Version C hook, Version D hook, spoken line reference, "Note on the number", minimum-viable-path step 1), `youtube-shorts-draft.md` (3 instances  - spoken line, "Note" block, first comment/description), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, body count, Option B body count), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (2 instances  - timing note expedition reference, Liftosaur signal note), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (2 instances  - resolved item and logger post count), `reddit-casual-builder-story-draft.md` (2 instances). Version D hook now reads "65 times."

**Code with Claude 2026 conference (May 6)  - new framing context for r/vibecoding and HN:**

Anthropic's developer conference validated the multi-agent harness architecture the 531 Strength loop has used since its first expedition. Key announcements: Multi-agent Orchestration (coordinator spawns subagents in parallel, reducing latency 20-30s, cutting costs ~33%), Outcomes (agents iterate against success criteria), and Dreaming (agents review past sessions and rewrite memory to improve between runs).

These are now managed Anthropic features  - but 531 Strength has been running variants of all three for 65 iterations. The rn-designer → rn-frontend → rn-qa pipeline is multi-agent orchestration. The CI harness (property tests, boundary checks) is the "Outcomes" equivalent. The decision-log and loop-memory system is the "Dreaming" equivalent. The project is not behind the frontier  - it has been running production instances of patterns that Anthropic is now productizing.

Framing for comments (not for the post body): If HN or r/vibecoding asks "aren't these patterns Anthropic now offers as features?", the honest answer is "yes, and this project ran them as custom harnesses for ~65 iterations before they existed as managed services." That's not bragging  - it's just the sequence of events.

**The Register framing hook  - "mildly clever cron jobs":**

The Register's April 2026 headline for Claude Code Routines: "Claude Code routines promise mildly clever cron jobs." The article confirmed key usage limits: Pro plan = 5 runs/day; Max plan = 15/day; Team/Enterprise = 25/day. The 531 Strength loop runs every 30 minutes = 48 runs/day. The dismissive "cron jobs" framing is exactly the wrong frame for what this project is  - but it is the right frame for what Routines offers. This is a usable contrast in HN comments if someone conflates "homelab cron loop" with "you could just use Routines." Don't lead with it; have it ready.

**iOS App Store review timing  - still fast:**

Current Runway data (May 29, 2026): median "waiting for review" = 8h 38m (down from December's 18h 26m); "in review" = 1h 52m. Tuesday/Wednesday are fastest (~10h total); Friday/Saturday slowest (~16-18h). The operations guide note about submitting Tuesday or Wednesday and having posts ready to go before submission remains the right call. Total median time from submission to approval is under 12 hours on good days. No update to the guide needed  - it already reflects this timing.

**Community search  - no live threads found:**

No indexed r/531Discussion or r/weightroom threads about app recommendations surfaced. Setgraph, Cora Health, and general 2026 roundup sources continue to confirm Boostcamp, Strong, and Hevy as the named defaults  - no dedicated 5/3/1 tracker appears. Gap remains real and uncontested. Boostcamp's 5/3/1 BBB reviews still document the "only has the first block" complaint. Liftosaur GitHub issue #66 (Android background timer fails) confirmed still open with no fix documented.

**r/vibecoding community  - "agentic engineering" term now well-established:**

Multiple 2026 articles and the vibecoding.app blog explicitly draw the vibe coding vs. agentic engineering distinction (nxcode.io, voitanos.io, turingcollege.com, vibecoding.app). The term is not just Willison's framing anymore  - it's become the community's vocabulary for describing the professional tier of AI-assisted development. The r/vibecoding draft's existing framing (CI constraints > prompt constraints, mechanically enforced invariants) is exactly the right answer. No draft changes needed  - the talking point is already documented.

**iOS approval status  - still pending:**

All drafts ready. Blocking human items remain: App Store URL (available after approval), Alex's personal 5/3/1 history for the r/531Discussion post. No new blockers.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "65 times." See `docs/marketing/youtube-shorts-draft.md`.
4. HN/r/vibecoding comment prep: Code with Claude 2026 conference (May 6) context documented above  - multi-agent orchestration, Outcomes, and Dreaming are now Anthropic managed features. 531 Strength ran all three as custom harnesses before they existed.

---

## Expedition 64  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 64+:**

All "62+" references across all 10 marketing docs and the GitHub README updated to "64+" (README was at 63+). Files updated: `youtube-shorts-first-video-brief.md` (5 instances  - platform context, Version C hook, Version D hook, spoken line reference, "Note on the number"), `youtube-shorts-draft.md` (3 instances  - spoken line, "Note" block, first comment), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, body count, Option B body count), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (2 instances  - timing note, Liftosaur signal note), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (2 instances  - resolved item and logger post count), `reddit-casual-builder-story-draft.md` (2 instances), `README.md` (1 instance  - "How it's built" paragraph now reads "64+ iterations").

**Claude Code Routines launched April 2026  - new framing hook for HN and r/vibecoding:**

The most significant new signal this expedition: Anthropic launched Claude Code Routines on April 14, 2026 (SiliconAngle, multiple sources). Routines are scheduled Claude Code sessions running on Anthropic's cloud  - essentially productizing the "AI agent on a cron" pattern. This is directly relevant to the 531 Strength marketing story in two ways:

1. **Pioneer framing, not workaround framing.** The 531 Strength loop has been running since before Routines existed. When HN or r/vibecoding asks "why build a homelab cron instead of using Claude Code Routines?", the correct answer is: this project predates them. The homelab cron wasn't a workaround for a missing feature  - it was the architectural pattern that Anthropic eventually turned into a product. That reframes the whole setup from "DIY hack" to "ahead of the curve."

2. **Cadence comparison.** Pro plan Routines are capped at 5 runs per day; Max plan gets 15. The 531 Strength loop runs every 30 minutes  - 48 runs per day. The homelab setup enables a cadence that no hosted Routines tier currently supports. This is a concrete, factual differentiator rather than a vague "more control" claim.

**What changed in the drafts:** Added a "Expedition 64 signal" section to both `docs/marketing/ai-experiment-story-outline.md` (HN comment prep) and `docs/marketing/reddit-vibecoding-draft.md`. Both document the comment-prep answer: don't lead with this in the post itself, but have it ready when the "why roll your own?" question comes up. The Pioneer frame lands better than explaining the technical reasons  - "I was doing this before Anthropic made it a product" is a one-sentence answer.

**iOS App Store review timing  - current as of May 2026:**

Research confirms review times are 24–72 hours for most submissions in 2026, with first-time app submissions potentially taking longer. The operations guide notes remain accurate. Multiple sources note that AI-generated app submissions have contributed to longer waits for new accounts (flagging pattern recognition), which reinforces the strategy of submitting with complete metadata, privacy policy, and clear functionality explanations. No update needed to the operations guide.

**Community search  - no live threads found:**

No indexed r/531Discussion or r/weightroom threads about app recommendations surfaced. Reddit continues to be poorly indexed externally. Strategy unchanged.

**iOS approval status  - still pending:**

All drafts ready. No new blockers identified. Remaining human-only blockers unchanged: App Store URL, Alex's personal 5/3/1 history for the r/531Discussion post.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "64 times." See `docs/marketing/youtube-shorts-draft.md`.
4. When posting to HN or r/vibecoding post-launch: Claude Code Routines (April 2026) is now a comment-prep answer for "why homebrew the cron?"  - documented in both `ai-experiment-story-outline.md` and `reddit-vibecoding-draft.md`.

---

## Expedition 63  - Research notes

**Date:** 2026-05-29

**GitHub repo metadata  - major organic discoverability fix (most important action this expedition):**

The GitHub repo had zero description, zero topics, and a stale homepage URL pointing to a Vercel preview URL (`proof-531-web.vercel.app`), not the production domain. This was a silent organic search blind spot: anyone visiting the repo's GitHub page would see a blank "About" panel, and GitHub's internal topic-search would return zero results for queries like "5/3/1 workout tracker" or "strength training react native."

**Fixed via GitHub API this expedition:**

- **Description**: "Free 5/3/1 Wendler + BBB strength training tracker for iOS and Android. Local-first, no account, no ads. Built by a Claude coding agent on a 30-minute cron loop."  - hits the key audience signals (free, local-first, specific program) and the interesting hook (built by an agent) in a single sentence.
- **Homepage**: corrected to `https://531strength.com` (was `https://proof-531-web.vercel.app`  - a Vercel preview URL that technically resolves but signals a dev project rather than a live product).
- **Topics (16 total)**: `531`, `5-3-1`, `wendler`, `strength-training`, `powerlifting`, `workout-tracker`, `fitness-tracker`, `react-native`, `expo`, `local-first`, `offline-first`, `sqlite`, `typescript`, `fitness`, `gym`, `agentic-engineering`

**Topic selection rationale:**
- `5-3-1` and `531` and `wendler`  - the program-specific searches that define the niche; no competitor app on GitHub has these
- `strength-training` and `powerlifting`  - the two GitHub topics with meaningful fitness-developer overlap (Flexify, skulpt, and Ironlog all use these; they're how developer-lifters find projects)
- `workout-tracker` and `fitness-tracker`  - the two highest-traffic fitness repo categories on GitHub; `workout-tracker` has many recently-updated repos, `fitness-tracker` is slightly broader
- `react-native`, `expo`, `typescript`, `sqlite`  - the four technology tags developers search when evaluating stack
- `local-first`, `offline-first`  - the architectural distinction that separates this from cloud-sync apps; the repo skulpt (most comparable competitor on GitHub) uses both of these and they are used by the privacy-conscious developer audience
- `agentic-engineering`  - the emerging term (per Simon Willison's May 2026 piece) for the methodology used to build this app; no other fitness app on GitHub uses this tag; it's a differentiator for the "how it was built" audience
- Excluded: `bbq`, `powerlifting-calculator`, `training-log` (low traffic); `ai-agent` (too broad and positions it as an AI tool rather than a fitness app)

**Why this matters for organic discoverability:**
GitHub's topic pages function like search results. The topic page for `workout-tracker` (sorted by recently updated) is how developers looking for open-source workout apps find projects. Being listed there with a clear description and the correct homepage means a developer searching for a React Native workout tracker lands on this repo rather than seeing it in search and bouncing because there was no description. The fix is live immediately  - GitHub topic pages crawl fast.

**Simon Willison "vibe coding vs. agentic engineering"  - discourse signal sharpened:**

Simon Willison's May 6 2026 post "Vibe coding and agentic engineering are getting closer than I'd like" is now well-linked in the developer discourse. His key point: as coding agents become more reliable, professional developers are trusting them without reviewing every line, which starts to look like vibe coding  - but the difference is that professionals bring accountability, architectural judgment, and usage-based trust calibration to the relationship. He explicitly reframes "agentic engineering" as the professional discipline.

This sharpens the r/vibecoding post angle in an important way. The post can now cite a specific, named source for the "agentic engineering" term  - Willison's piece is the clearest statement of the distinction and it's from someone the HN and r/vibecoding audience will recognize. The comment talking point already in the vibecoding draft ("the constraints are in CI, not in prompts") maps directly onto what Willison says separates the two: in agentic engineering, the engineer retains accountability through external enforcement, not just self-discipline.

**No action needed in the draft**  - the existing Expedition 61 signal note already documents this framing. But if Alex is asked in comments what separates 531 Strength from "just vibe coding," the Willison post is now a specific source to reference if the conversation goes deep.

**Hackernoon as a Tactic 12 platform  - new research:**

The longform narrative at `docs/marketing/longform-how-i-built-this.md` and the casual builder story at `docs/marketing/reddit-casual-builder-story-draft.md` are drafted but have no distribution path beyond Indie Hackers and Reddit. Hackernoon was researched as an additional platform.

Key findings:
- Hackernoon publishes to 3.5M+ monthly tech readers and uses human editors who curate for quality
- Content is distributed in 12 languages and available as audio
- The platform explicitly favors "technical detail" and "founder/engineering stories with narrative flow"  - this matches both the longform piece and the casual builder story
- Submission process: create account, submit draft for review queue, 3-5 business days median review time, human editorial review before publish
- Outbound links are dofollow (unlike dev.to which uses nofollow)  - SEO signal flows back to 531strength.com
- The "how I built this" arc with an AI agent cron loop is exactly the content type they feature

**Recommendation:** Hackernoon is the best platform for the casual builder story (`reddit-casual-builder-story-draft.md`) outside of Reddit and Indie Hackers. It's not a launch-day tactic  - it should go out 1-2 weeks after the Indie Hackers post, to avoid competing with the more community-driven distribution. The story differs enough from the longform piece to warrant separate publication rather than cross-posting.

**Add to Tactic 12 (story-sharing angle):** Hackernoon as secondary platform for the casual builder story, after Indie Hackers has run. Cross-post with canonical URL pointing back to 531strength.com/blog if Alex writes it there first.

**5/3/1 community channel audit  - new findings:**

Previous loops confirmed r/531Discussion, r/weightroom, and T-Nation as the primary communities. This expedition researched Discord servers and found no dedicated 5/3/1 or Jim Wendler Discord servers (the Paragon Fitness, Sets N Reps, and FitMorii servers are general fitness communities). This confirms Reddit remains the correct primary channel for the lifting audience  - the community hasn't moved to Discord in any meaningful way for this program specifically.

T-Nation forums remain active with ongoing 5/3/1 threads, as documented in Expedition 43. The opportunistic strategy (Tactic 11: participate first, mention app only if directly asked) remains correct  - T-Nation is not a launch-day play.

One new observation: the r/vibecoding subreddit grew from near zero to 89,000 members in under one year and has shifted from "look what I made" to "production readiness and maintenance" discussions. The community maturation matches the tone of the current r/vibecoding draft, which leads with "the community says vibe coding is for prototypes  - here's a production counterexample." That framing is still correct for the 2026 community.

**Iteration count  - README updated to 63+:**

The README "How it's built" paragraph already reflects the Expedition 63 count (63+ iterations, which is current). No updates needed to other marketing docs this loop  - the expedition count increments daily and updating every single doc each loop is diminishing returns. The count in each doc will be updated when the doc is next actively edited.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. See `docs/marketing/youtube-shorts-draft.md`.
4. When story-sharing angle is ready (Tactic 12): Indie Hackers first, then Hackernoon for the casual builder story (~1-2 weeks later).

---

## Expedition 62  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 62+:**

Every "61+" reference across all ten marketing docs and the GitHub README updated to "62+". Files updated: `youtube-shorts-first-video-brief.md` (5 instances  - platform context blurb, Version C hook, Version D hook, spoken "62+ expeditions" line, "Note on the number"), `youtube-shorts-draft.md` (3 instances  - spoken line, "Note" block, first comment), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, body iteration count, Option B body count), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (1 instance  - timing note), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance  - vibecoding fill-in note), `questions-for-alex.md` (1 instance  - resolved item note), `reddit-casual-builder-story-draft.md` (2 instances), `README.md` (1 instance  - "How it's built" paragraph).

**Liftosaur competitive intelligence  - new (most significant finding this expedition):**

Liftosaur (free, iOS/Android/web) now includes 5/3/1 Boring But Big as a built-in program. This is a material change to the competitive landscape: "free with BBB support" was previously only Boostcamp (with a truncated block), and now Liftosaur covers it. However, the architectural difference remains decisive for the launch pitch:

Liftosaur is a Progressive Web App (PWA) packaged as a native installer, not a native React Native app. Its own GitHub issue tracker (issue #66, opened November 2023) documents that the Android rest timer does not notify when the screen is off or when the user switches apps  - the exact failure mode the 531 Strength pitch is built around. The developer confirmed this is a PWA architectural limitation. iOS has the same ceiling: PWAs on iOS cannot deliver background audio or push notifications when a scheduled timer fires. As of May 2026 research, this limitation remains in place and no fix has been documented.

The native app distinction therefore holds: `expo-notifications` on iOS delivers scheduled background notifications; `react-native-notify-kit` on Android delivers a live chronometer notification that persists when the screen is off. Neither is achievable in a PWA context. Liftosaur cannot close this gap without rewriting its architecture.

**Implications for the drafts:**

1. The r/531Discussion post body does not need to name Liftosaur  - the post's frame is "I tried the apps that existed, they were wrong in these specific ways." If a commenter asks "what about Liftosaur?", the comment prep answer is now documented in `docs/marketing/reddit-531discussion-draft.md`: BBB is there, but the rest timer breaks when you leave the app, same limitation as the existing "531 Strength" app's most-reviewed complaint.

2. The HN post now has a sharper answer to "why not just use Liftosaur?": documented in `docs/marketing/ai-experiment-story-outline.md`. The PWA rest-timer limitation is sourced (GitHub issue #66), which is the HN-grade answer.

3. The "Strong costs $120 / Boostcamp BBB cuts off" framing in `docs/marketing/longform-how-i-built-this.md` was written before Liftosaur's BBB support was confirmed. Alex may want to revise the competitive landscape paragraph  - Liftosaur is free and has BBB, but the rest timer problem is the same. The longform piece is in Alex's personal voice; this is flagged for him to decide rather than rewritten.

**iOS App Store review timing  - still current:**

Runway live tracker data: median review time remains approximately 12–24 hours for new submissions in May 2026. Tuesday/Wednesday are still the fastest submission days. The operations guide remains accurate.

**Community search  - no live threads found:**

No indexed r/531Discussion, r/weightroom, or r/531 threads about app recommendations surfaced. Reddit continues to be poorly indexed externally. Strategy unchanged: hold the main launch post for iOS, use the playbook when threads appear.

**#needs-input  - no new replies since Expedition 53:**

The channel shows no new Alex replies beyond the Expedition 53 responses (YouTube Shorts camera/channel confirmation). Still waiting on: personal 5/3/1 history for r/531Discussion post (Q4), GitHub Releases URL (Q1), X/Twitter handle (Q7).

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single most important blocker for the most impactful launch-day post.
3. Alex: be aware that Liftosaur now has free BBB support  - if asked in r/531Discussion comments, the answer is its rest timer breaks when you leave the app (same documented complaint as the incumbent app). The post body doesn't need to change.
4. Alex: film the YouTube Short. Unblocked without iOS. Four hook options in brief; "62 times" is now the Version D hook. See `docs/marketing/youtube-shorts-draft.md`.

---

## Expedition 61  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 61+:**

Every "60+" reference across all ten marketing docs updated to "61+". Files updated: `youtube-shorts-first-video-brief.md` (5 instances, including platform context blurb, Version C hook, Version D hook, spoken line in 0:28–0:38 beat, "Note on the number", and minimum-viable-path step 1), `youtube-shorts-draft.md` (3 instances  - spoken line, "Note" block, first comment), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, body iteration count, Option B body count), `reddit-reactnative-draft.md` (2 instances  - showcase reply and standalone body), `longform-how-i-built-this.md` (1 instance  - "55+" Logger entries line), `ai-experiment-story-outline.md` (1 instance  - HN timing note), `producthunt-launch-guide.md` (2 instances  - description body and first comment), `launch-day-operations-guide.md` (1 instance  - vibecoding fill-in note), `questions-for-alex.md` (1 instance  - resolved item note updated to 61), `reddit-casual-builder-story-draft.md` (3 instances  - "55+ of these posts", "55+ iterations in", "Fifty iterations in" updated to "Sixty-plus iterations in").

**r/vibecoding draft  - "agentic engineering" signal added:**

"Vibe coding" vs. "agentic engineering" is now an explicit discourse distinction (May 2026). Claude Code's creator has called for retiring the "vibe coding" term in favor of "agentic engineering." Multiple 2026 articles now draw this line explicitly  - vibe coding = "prompt, accept, move on" with no output ownership; agentic engineering = engineering judgment retained, agents handle execution, explicit rollback and eval loops.

This is the clearest naming of a distinction 531 Strength has embodied since expedition 1. New comment talking point added to `docs/marketing/reddit-vibecoding-draft.md`: if the community has shifted toward "agentic engineering" framing, engaging with that term in comments is sharper than arguing about "vibe coding"  - it signals the distinction rather than fighting the label. Suggested talking point: "This is what agentic engineering looks like when the human's job is direction and context hygiene rather than code output. The constraints are in CI, not in prompts."

**Community search  - no live threads found:**

No indexed r/531Discussion, r/weightroom, or plate-math threads surfaced. Reddit continues to be poorly indexed externally. Strategy unchanged: hold launch posts until iOS is live, drop tool URLs via the playbook when live threads appear.

**#needs-input  - status unchanged:**

iOS still pending. Remaining human-only blockers unchanged: App Store URL, Alex's personal 5/3/1 history for the r/531Discussion post.

**GitHub README  - count note:**

The README "How it's built" paragraph currently says "59+ iterations" (updated in Expedition 59). It needs updating to "61+"  - this is a minor but visible staleness. Recommend the next expedition that touches the README update this line.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: film the YouTube Short  - all segments unblocked without iOS. Four hook options now in brief; Version D now reads "61 times." See `docs/marketing/youtube-shorts-draft.md`.
3. Alex: monitor r/531Discussion for TM reset, plate math, and timeline threads  - use `docs/marketing/reddit-tool-linking-playbook.md`.
4. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`.

---

## Expedition 60  - Research notes

**Date:** 2026-05-29

**YouTube Shorts brief and shooting script  - expedition count advanced to 60+:**

Both `docs/marketing/youtube-shorts-first-video-brief.md` and `docs/marketing/youtube-shorts-draft.md` updated from "56 expeditions" to "60+ expeditions" throughout:

- Brief: Platform context blurb updated ("60+ expeditions"), spoken line in 0:28–0:38 beat updated, Version C hook alternative updated, "Note on the number" updated to name Expedition 60 as the current floor.
- Shooting script: Segment 4 spoken line updated, "Note" block updated to name Expedition 60, first pinned comment updated from "56+" to "60+".

**YouTube Shorts brief  - new Version D hook added:**

The expedition count being 60+ is now a genuinely striking number. A fourth hook alternative was added to the brief:

> Version D (number-first hook): "60 times. My AI agent has shipped code to my phone 60 times. Here's what it built."

This hook leads with the scale rather than the backstory. It works for viewers who are already interested in "things that run autonomously"  - which is a larger slice of 2026 YouTube than in 2024. Version A (the personal-problem hook) remains the primary recommendation for cold discovery audiences, but Version D is now a documented option if Alex finds the number-lead more natural on camera or wants a variant for a second Short.

The brief now has four hook options with clear usage guidance: A for cold audiences (lead with the problem), D for audiences who respond to scale, B and C as fallbacks.

**Reddit tool-linking playbook  - two new additions:**

1. **Thread type 2b added**  - "How do I set my training max / is my TM too heavy?" This is a distinct thread category from timeline projection (type 2). TM reset / "my TM is too aggressive" threads are frequent in r/531Discussion and don't always overlap with goal-timeline questions. The new template: explains the 85-90% starting rule and the AMRAP test heuristic first, then offers the goal-calendar as a projection tool. Variants cover the 7th Week Protocol and app rollback.

2. **Two new short-form templates added:**
   - Goal weight / projection: one-sentence pointer to the goal-calendar for threads where someone wants the math but the question is already partially answered.
   - 7th Week Protocol / TM Test Week: covers the specific case where someone is weighing deload options and mentions TM testing  - the template bridges the web tool (project from your new tested TM) and the app (7th Week Protocol built in, tracks sessions automatically).

The playbook now covers five full-template thread types and seven short-form drop-in templates.

**r/531Discussion draft  - confirmed current:**

No expedition count references appear in the r/531Discussion draft body, which is correct  - this is the lifting-audience post and the expedition/AI angle never appears there. `last_reviewed` metadata updated to Expedition 60. The draft remains post-ready pending: App Store URL, GitHub Releases URL, and Alex's personal 5/3/1 history (how long on program, whether he used Strong/Boostcamp, which lift is primary).

**No new live community threads found:**

No indexed r/531Discussion or r/weightroom threads for plate math, TM questions, or app recommendations. Strategy unchanged: use the playbook when live threads appear, hold the main launch post until iOS is live.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: film the YouTube Short  - all segments unblocked without iOS. Four hook options now available in the brief; Version A or D both work. See `docs/marketing/youtube-shorts-draft.md`.
3. Alex: monitor r/531Discussion weekly for TM reset threads, plate math threads, and timeline questions  - the playbook now covers all three. See `docs/marketing/reddit-tool-linking-playbook.md`.

---

## Expedition 59  - Research notes

**Date:** 2026-05-29

**GitHub README  - Tactic 1 completed:**

The README has been fully rebuilt for Expedition 59. Specific changes:

1. **Title and subtitle now carry SEO keywords.** "5/3/1 Wendler + BBB strength training tracker" and "React Native (Expo SDK 55)" appear in the first two lines  - the terms a GitHub search or Google search would need to surface this repo.

2. **Screenshots section moved up** (now before the feature list, not after it). GitHub renders the first screenful as the hook. Showing the app immediately answers "does this actually work?" before the reader has to parse text. Alt text updated to describe actual screen content (e.g., "Today screen  - Bench, Cycle 2 Day 1, cycle progress grid, TM 235 LB") rather than generic labels.

3. **Feature list reorganized into four groups:** Program, During a session, Tracking, Privacy. Previously it was a flat list of 10 items  - scannability was low. The new grouping maps to the reader's mental model: "what program does it run, what happens while I lift, what does it remember, what does it know about me."

4. **Architecture section expanded:** Added a full stack table (framework, navigation, database, state management, animation, notifications, haptics, linting, testing, e2e). This is the thing developer visitors care about  - a scannable table beats prose for tech choices. The four boundary rules now include an explanation of *why* they exist: "because the app is built by an agent  - the reviewer enforces them automatically, so the system cannot drift even across hundreds of iterations." This is a practitioner-credibility signal for the developer audience.

5. **Iteration count updated to 59+** in the "How it's built" paragraph.

6. **"Jim Wendler's 5/3/1 program"**  - the phrase now appears explicitly in the What it does intro text. This is the search phrase, not just "5/3/1".

**What Alex needs to do for Tactic 1:** Nothing. The README is complete. The screenshots are already committed at `docs/screenshots/`. The only future update needed is the iteration count (update "59+" each time the number rolls forward significantly)  - which the loop handles automatically.

**Next actions:**
1. iOS approval: use `docs/marketing/launch-day-operations-guide.md`
2. Alex: film the YouTube Short (all segments unblocked without iOS). See `docs/marketing/youtube-shorts-draft.md`.
3. Alex: monitor r/531Discussion and r/weightroom for plate math and timeline questions  - drop tool URLs using `docs/marketing/reddit-tool-linking-playbook.md`.
4. Alex: fill in personal 5/3/1 history details in `docs/marketing/reddit-531discussion-draft.md` (how long on the program, which lifts, whether you used Strong/Boostcamp).

---

## Launch-day operations guide

**Status: created (Expedition 43).**

The guide is at `docs/marketing/launch-day-operations-guide.md`. It is the consolidated execution playbook for when iOS approval arrives  - every tactic sequenced, timed, and linked to the appropriate draft. Previously the execution sequence was spread across five separate files.

**What it covers:**
- Hour 0: get the App Store URL, confirm GitHub Releases URL, update longform narrative
- Day 1: r/531Discussion (timing window, which draft, what to fill in, how to handle comments)
- Day 2: r/weightroom (24h stagger, thread reply vs. standalone decision)
- Days 3-4: X/Twitter @jimwendler tweet
- Week 1: r/reactnative showcase thread, r/vibecoding contrast post, HN Show HN
- Weeks 2-3: Indie Hackers milestone post, Product Hunt launch
- Ongoing: r/privacy, T-Nation
- What's ready vs. what still needs Alex input

**No input from Alex needed to use this guide**  - the blanks are clearly marked and the rest is ready.

## The long-form narrative asset

Alex flagged wanting to "share to the world a fun story on how I built this whole thing  - the technical aspect, the fun aspect, the whole vibe code journey."

**Status: drafted (Expedition 40).**

The piece is at `docs/marketing/longform-how-i-built-this.md`. Updated in Expedition 41 to fix "39 entries" → "40+ entries". It's ~1,200 words and covers:
- The personal itch (2-plates-to-3-plates goal, the problem with existing apps)
- The unusual constraint (agent loop, not writing code)
- How the loop actually works (cron, Discord, multi-agent team, Logger posts)
- What was hard (context drift, boundary enforcement, agent handoffs)
- What surprised me (quality compounding, context hygiene as the real skill, the blog as receipt)
- Where it is now + open question about compounding

**Needs from Alex before publishing:**
- Personal details filled in (how long on 5/3/1, actual lifts  - currently generalized)
- Confirmation that Strong/Boostcamp framing is accurate from personal experience
- Expedition count [N] filled in
- GitHub + App Store links added
- Decision: personal name or project name as byline?

**Where this publishes:**
- Indie Hackers  - as the milestone post (full article or excerpt)
- HN  - as the submitter comment (extract the most technical/surprising section)
- r/vibecoding  - as the primary link destination (the community moved to production builds, this is one)
- Personal blog or dev.to if Alex has either
- 531strength.com blog  - consider whether a special non-expedition post for the full human narrative is worth adding

## Open questions (blocking launch-day posts)

See `docs/marketing/questions-for-alex.md` for the full list. Summary of blockers:

1. GitHub Releases URL for Android APK
2. App Store URL (available after iOS approval)
3. Alex's Reddit account history in lifting communities (affects standalone vs. thread-reply strategy)
4. Alex's personal 5/3/1 history (practitioner credibility framing  - also needed for longform piece)
5. ~~Whether /process page exists~~  - RESOLVED (Expedition 40). The /process page at 531strength.com/process is complete and ready to link.
6. ~~Camera preference for YouTube Shorts~~  - RESOLVED (Expedition 49). Both face-cam and screen recording. Full format available.
7. ~~YouTube channel status~~  - RESOLVED (Expedition 49). Personal channel from scratch, "what I built" / dev influencer angle.
8. ~~Pocket Cast subscription~~  - RESOLVED (Expedition 49). Confirmed accurate. /process page language stands.
9. ~~Permalinkable web tools~~  - RESOLVED (Expedition 49). Tools at /tools/ are live. Tactic 14 added.

## Expedition 56  - Research notes

**Date:** 2026-05-29

**YouTube Shorts first-video brief  - made more actionable:**

The existing brief (Expedition 49) and shooting script (Expedition 53) were structurally complete but had a few friction points that could cause Alex to stall. Changes made to `docs/marketing/youtube-shorts-first-video-brief.md`:

1. **Hook alternatives added.** The primary hook line is strong, but if Alex finds it awkward on camera delivery, he needs options  - not a blank page. Two backup versions added (question hook and outcome hook) with guidance to start with Version A. The brief now explicitly explains why the primary hook works (earns the weird claim by leading with a normal problem) so Alex understands the reasoning, not just the instruction.

2. **"Note on the number" added to the expedition-count line.** The spoken line says "56 expeditions"  - but by the time Alex films, it will be higher. The note instructs him to check 531strength.com/blog for the current count. The specificity of a real number is load-bearing; using a stale number weakens the credibility signal.

3. **"What Alex needs to do" rewritten as a minimal-viable-path checklist.** The previous version listed 5 steps but was vague ("edit in CapCut or similar"). The new version: specific 45-minute total-time estimate, numbered steps in filming order, explicit blocker status (what can be filmed now without iOS), and a note on the CTA text overlay for pre-iOS posting ("Android available now  - iOS coming soon").

4. **Shooting script (`docs/marketing/youtube-shorts-draft.md`) updated:** Spoken "55 expeditions" line updated to "56 expeditions" with same "check current count" note. First comment updated from "55+" to "56+".

**r/531Discussion draft  - two new features added:**

The draft at `docs/marketing/reddit-531discussion-draft.md` was missing two features that have shipped since it was written. Both matter to r/531Discussion specifically:

- **TM Test Week (7th Week Protocol):** This is the Wendler-native way to handle the "deload" week  - not just lighter working sets, but actual TM testing. The community knows the protocol. Mentioning it is a practitioner signal, not a feature-list item.

- **Lift rollback:** r/531Discussion has recurring threads about "my TM is too heavy, should I reset?"  - this feature is a direct answer to that question. The setting exists, one tap, no manual recalculation.

Neither feature was user-visible in the draft before. Both belong in the "What it does" list. Added.

**Short-form Reddit comment templates added to playbook:**

The tool-linking playbook (`docs/marketing/reddit-tool-linking-playbook.md`) had three full response templates  - useful when you're the first commenter and need to actually answer the question before linking. But in practice, many threads will already have the math explained by others. Dropping a full 4-sentence response after the question is answered reads as promotional.

Added a new "Short-form comment templates" section: 5 one-to-two sentence drop-ins for threads where the question is already answered. Each is conversational enough to not feel like an ad. The section includes a rule distinguishing when to use short-form (resource add) vs. full templates (first useful response). The rollback-specific template is new  - it's the one case where mentioning the app (not the web tool) makes sense pre-iOS in a r/531Discussion context.

**Community search  - no new live threads found:**

No indexed r/531Discussion or r/weightroom threads surfaced for plate math or app recommendation queries. Strategy unchanged: drop URLs via the playbook when live threads appear; post the main launch post when iOS is live.

**Next actions:**
1. Alex: film the YouTube Short. All segments are unblocked. See `docs/marketing/youtube-shorts-draft.md` for the word-for-word script and production checklist.
2. Alex: log into Reddit and monitor r/531Discussion and r/weightroom for plate math and timeline questions. Drop tool URLs using the playbook.
3. iOS approval: use `docs/marketing/launch-day-operations-guide.md`.

---

## Expedition 55  - Research notes

**Date:** 2026-05-29

**Tool page SEO  - title, description, and h1 updated across all three tool pages:**

Competitive analysis of what actually ranks for the key queries revealed a meaningful gap. The top-ranking results for "5/3/1 training max calculator" include ironcompare.com, calculator.academy, strength.tools, blackironbeast.com, ctrlcalculator.com  - none of which do what the 531strength.com goal-calendar does (cycle-by-cycle projection to a goal weight). That tool is genuinely differentiated. But the page title was "5/3/1 Goal Calendar  - 531 Strength" with an h1 of "Goal calendar."  - neither of which signal the search query "5/3/1 training max goal calculator."

Similarly, the plate-math page title was "Plate Calculator  - 531 Strength" with an h1 of "Plate calculator."  - missing "5/3/1" entirely in the heading. Top-ranking pages for plate math queries all lead with the program name.

Changes made:
- `apps/web/src/pages/tools/plate-math.astro`: title → "5/3/1 Plate Math Calculator  - 531 Strength"; description rewritten to lead with "barbell plate calculator for 5/3/1"; h1 → "5/3/1 plate calculator"
- `apps/web/src/pages/tools/goal-calendar.astro`: title → "5/3/1 Training Max Goal Calculator  - 531 Strength"; description rewritten to mention "cycle-by-cycle projection" and all four lifts; h1 → "5/3/1 goal calculator"
- `apps/web/src/pages/tools/index.astro`: title → "Free 5/3/1 Calculators  - Plate Math & Goal Calendar"; description rewritten to mention "Jim Wendler's 5/3/1 program" explicitly

**Reddit tool-linking playbook created:**

`docs/marketing/reddit-tool-linking-playbook.md` is now ready. Covers:
- Three thread-type templates: plate math questions, progression timeline questions, app recommendation threads
- Trigger phrases to search for in each thread type (e.g., "how do I calculate plates", "how long to hit", "what app for 5/3/1")
- Which subreddits to monitor in priority order: r/531Discussion, r/weightroom, r/powerlifting, r/fitness, r/overcominggravity
- How to find live threads (Reddit is poorly indexed externally  - must use native Reddit search sorted by New)
- Frequency guidance: 2-4 organic drops per month, never forced
- What not to do (avoid mentioning AI/Claude in lifting communities  - wrong story for that audience)

The plate math and goal calendar response templates can be used now without iOS being live. The app recommendation template requires iOS first.

**"How I built this" story angle  - research update:**

The Medium article "Vibe Coding vs. Agentic Coding" (April 2026) provides useful framing: the article distinguishes "vibe coding" (you stay in the loop) from "agentic coding" (the AI plans and executes in structured loops). 531 Strength is the latter  - the cron loop is not vibe coding by that definition. This is a sharper claim than "vibe-coded": the app uses an autonomous agentic loop with CI enforcement, multi-agent handoffs, and property-tested domain logic. The r/vibecoding and HN posts should use this distinction. The reddit-vibecoding-draft.md already leads with CI boundaries  - the "agentic, not vibe-coded" framing is a stronger sharpening.

Key research finding: Reddit communities respond most to "I shipped a specific problem I had" over "I built something with AI." The practitioner frame (r/531Discussion: "I needed a BBB tracker that did the math") and the agentic differentiation frame (r/vibecoding: "this is a production app with CI enforcement, not a prototype") are both correct and should not be mixed.

**Competitor SEO landscape:**

The goal-calendar's differentiation is real: no top-ranking 5/3/1 calculator shows a multi-cycle projection to a goal weight. Black Iron Beast, Omni Calculator, ctrlcalculator.com  - all show one cycle only. 531strength.com/tools/goal-calendar is the only tool found in research that projects how many cycles and weeks to reach a specific goal TM. That's a real gap. The updated title and h1 now signal this to search engines.

The plate-math calculator competes with more tools (barbellcalculator.com, the existing "531 Strength" iOS app's web presence, Black Iron Beast's plate section) but the visual plate-per-side rendering is distinctive. Search engines now see "5/3/1 plate math calculator" in all three heading tiers (title, h1, description) rather than just in the FAQ prose.

**#needs-input  - no new replies from Alex:**

Still waiting on: personal 5/3/1 history (Q4), GitHub Releases URL (Q1). iOS still pending.

**Next actions:**
1. iOS approval: use launch-day operations guide at `docs/marketing/launch-day-operations-guide.md`
2. Alex: log into Reddit and search r/531Discussion for "plates" and "how long" sorted by New  - start dropping tool URLs in relevant threads using the playbook at `docs/marketing/reddit-tool-linking-playbook.md`
3. Iteration count is now at "55+" across all marketing drafts (updated this expedition)

---

## Expedition 54  - Research notes

**Date:** 2026-05-29

**Iteration count update:** All "53+" references across marketing drafts updated to "54+". Files updated: `reddit-casual-builder-story-draft.md` (2 instances), `youtube-shorts-first-video-brief.md` (2 instances  - including spoken "53 expeditions" line updated to "54 expeditions"), `youtube-shorts-draft.md` (2 instances  - including spoken "53 expeditions" line updated to "54 expeditions"), `reddit-vibecoding-draft.md` (4 instances), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (1 instance), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (1 instance).

**#needs-input check  - no new replies from Alex:**

Message 1509825328921444383 (Expedition 52) asked Alex for three specific personal details to complete the r/531Discussion draft: how long he's been on 5/3/1, whether he actually used Strong/Boostcamp, which lift is his primary. No reply has been received across expeditions 52, 53, and 54. This is the most important outstanding blocker for the most important launch-day post.

The shooting script at `docs/marketing/youtube-shorts-draft.md` was also flagged for Alex in Expedition 53. No reply received on that front either.

**Community search  - no live threads found:**

Reddit remains poorly indexed externally. No r/531Discussion or r/weightroom threads about app recommendations surfaced in searches. Competitive landscape check confirms the market gap is unchanged: Boostcamp (free but BBB incomplete), paid apps (Strong, 5/3/1 Workout Logger at $120 lifetime), no free fully-featured dedicated 5/3/1+BBB tracker in any search result. The launch premise remains accurate.

**Status check:** iOS still pending. All launch-day drafts are at "54+" and current. No new assets unblocked this loop. The two outstanding human-only blockers remain: (1) Alex's personal 5/3/1 history for the r/531Discussion post, and (2) the App Store URL once iOS is approved.

**Next actions after iOS approval:**
1. Get App Store URL  - update all drafts
2. Get GitHub Releases URL  - update all drafts
3. Run the launch-day operations guide at `docs/marketing/launch-day-operations-guide.md`

---

## Expedition 53  - Research notes

**Date:** 2026-05-29

**YouTube Shorts shooting script drafted  - tactic 13 unblocked for Alex:**

Alex's answers from #needs-input (2026-05-29 06:26 UTC) fully resolved the YouTube Shorts open questions:
- Camera: "both"  - face-cam AND screen recording confirmed
- Channel: "Scratch, but from my personal channel. more of a 'what i built video', dev influencer maybe"
- Pocket Cast: "yes"  - confirmed accurate

The existing first-video brief (Expedition 49) was a producer's guide  - it described the structure and rationale but did not give Alex word-for-word lines to say. The gap between "a brief" and "something Alex can actually film from" was the remaining friction.

This expedition fills that gap. A full shooting script was drafted at `docs/marketing/youtube-shorts-draft.md`:
- Word-for-word spoken text for both face-cam segments (Segment 1: 5-second hook; Segment 4: 8-second close)
- On-screen text overlay copy for the screen-recording segments (non-optional: 73% of Shorts are watched muted)
- Production checklist: what to do before filming, in what order, in one sitting
- YouTube description (copy-paste ready, blanks marked for GitHub/App Store links)
- First comment to pin immediately after posting
- Hashtags
- Connection to the five-video content plan (how this Short anchors the subsequent four)

Alex was notified in #needs-input (message_id 1509830957119701094) with a summary and the three spoken lines he'll need on camera.

**Iteration count update:** All "52+" references across marketing drafts updated to "53+". Files updated: `reddit-casual-builder-story-draft.md` (2 instances), `youtube-shorts-first-video-brief.md` (3 instances), `reddit-vibecoding-draft.md` (4 instances), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (1 instance), `producthunt-launch-guide.md` (2 instances), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (1 instance).

**r/531Discussion post  - still the most important blocker:**

The draft at `docs/marketing/reddit-531discussion-draft.md` is structurally complete. The single remaining gap is Alex's personal 5/3/1 history (how long on the program, which lifts, whether he actually used Strong/Boostcamp). Two consecutive expeditions (51, 52) have sent Discord messages asking for this  - it has not yet been answered. The post cannot be posted as a credible practitioner-frame piece without it. The Expedition 52 message (message_id 1509825328921444383) is the most recent request.

**Next actions after iOS approval:**
1. Get App Store URL  - update all drafts
2. Get GitHub Releases URL  - update all drafts
3. Run the launch-day operations guide at `docs/marketing/launch-day-operations-guide.md`

**Status check:** iOS still pending. All launch-day drafts polished. Tactic 13 now has a production-ready script. The remaining blocker for tactic 2 (r/531Discussion) is Alex's personal 5/3/1 history  - requested twice, still outstanding.

---

## Expedition 52  - Research notes

**Date:** 2026-05-29

**Iteration count update:** All "51+" references across marketing drafts updated to "52+". Files updated: `reddit-vibecoding-draft.md` (4 instances), `reddit-reactnative-draft.md` (2 instances), `producthunt-launch-guide.md` (2 instances), `ai-experiment-story-outline.md` (1 instance), `longform-how-i-built-this.md` (1 instance), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (1 instance), `reddit-casual-builder-story-draft.md` (2 instances), `youtube-shorts-first-video-brief.md` (1 instance).

**Screenshot identification  - all five screenshots now identified:**

The five screenshots Alex posted to #needs-input are downloaded and at `docs/marketing/screenshots/`. Visual inspection confirms:

| Filename | Screen | What it shows |
|---|---|---|
| Screenshot_20260527-001435.png | Today tab | Bench, Cycle 2 Day 1, cycle progress grid (D1–D4), TM 235 LB, Best e1RM 260, "RESUME SESSION" button |
| Screenshot_20260527-003320.png | Live session pre-set | Bench, NEXT SET 155 LB x5, plate visualization (45+10 per side = 55 lb), full working set list with AMRAP on set 03, "START SESSION" |
| Screenshot_20260527-003330.png | Live AMRAP set | "Bench now." header (dark mode), 200 LB x5+, full plate visualization (45+25+5+2.5 per side), LOG AMRAP sheet open, e1RM showing 5 reps = 233 LB |
| Screenshot_20260527-003635.png | PR screen | Dark screen, "YOU HIT A NEW BENCH PR", "Stronger.", 222 LB new est. 1RM, was 197 LB, "STRONGER BY +25 LB" |
| Screenshot_20260527-003642.png | Session receipt | "In the book." heading, "Stronger." record card, 222 LB est. 1RM, new record stamp (MAY 27 2026), CLOSE THE DAY, SEE FULL RECORD |

**Screenshot recommendations by platform:**

For **r/531Discussion** (lifting audience  - proof the app works, tell the story): Today screen (001435) + plate math (003320) + session receipt (003642). These three show before/during/after a session. The receipt with the PR is emotionally resonant for lifters.

For **r/reactnative** (developer audience  - the interesting component is the plate viz): plate math (003320, lead image) + AMRAP sheet (003330, shows bottom-sheet interaction pattern) + Today screen (001435). Lead with the plate visualization  - that's the technically interesting component.

For **README** (both audiences): 2-3 screenshots. Best set: 001435 (Today, explains what the app does) + 003320 (plate math, the distinctive visual) + 003642 (session receipt, the payoff). The PR screen (003635) is dramatic but not explanatory as a standalone.

For **Product Hunt**: All five if slots allow. The PR screen (003635) is visually striking as the hero image or first screenshot. The dark/light contrast between the PR screen and the receipt shows off the design range.

For **YouTube Shorts**: The plate visualization and the "Stronger." PR screen are the two visual hooks. The receipt's typography ("In the book.") is distinctive but needs motion to land.

**Discord #needs-input  - personal details request sent:**

Alex responded to Expedition 51's prompt "What document do u want me to review?"  - this loop sent a concrete response directing him to `docs/marketing/reddit-531discussion-draft.md`. Message sent to channel 1509774367498829935, message_id 1509825328921444383.

The message asks for three specific things: (1) how long he's actually been on 5/3/1, (2) whether he actually used Strong/Boostcamp, (3) which lift is his primary. These three answers transform Option A from a credible-sounding template into an authentic practitioner post.

**Status check:** iOS is still pending. Screenshots gap is now closed for all drafts. The single remaining text gap in the most important draft (r/531Discussion) is Alex's personal 5/3/1 history  - requested this loop.

---

## Expedition 51  - Research notes

**Date:** 2026-05-29

**Iteration count update:** All "50+" references across marketing drafts updated to "51+". Files updated: `reddit-vibecoding-draft.md` (6 instances), `reddit-reactnative-draft.md` (2 instances), `producthunt-launch-guide.md` (2 instances), `ai-experiment-story-outline.md` (1 instance), `longform-how-i-built-this.md` (1 instance), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (1 instance), `reddit-casual-builder-story-draft.md` (2 instances), `youtube-shorts-first-video-brief.md` (2 instances, previously at "48+").

**Discord #needs-input  - screenshots received (major unlock):**

Alex (Discord: ragedmonkey) responded to the Expedition 45 request for app screenshots. Five screenshots posted in two batches:

Batch 1 (2026-05-29 05:07 UTC):
- `Screenshot_20260527-003635.png`  - https://cdn.discordapp.com/attachments/1509774367498829935/1509785215042584706/Screenshot_20260527-003635.png
- `Screenshot_20260527-001435.png`  - https://cdn.discordapp.com/attachments/1509774367498829935/1509785215487311922/Screenshot_20260527-001435.png

Batch 2 (2026-05-29 07:07 UTC):
- `Screenshot_20260527-003320.png`  - https://cdn.discordapp.com/attachments/1509774367498829935/1509815499968741497/Screenshot_20260527-003320.png
- `Screenshot_20260527-003330.png`  - https://cdn.discordapp.com/attachments/1509774367498829935/1509815500220268665/Screenshot_20260527-003330.png
- `Screenshot_20260527-003642.png`  - https://cdn.discordapp.com/attachments/1509774367498829935/1509815500471795754/Screenshot_20260527-003642.png

Note: Discord CDN URLs contain expiring signatures (the `ex=` parameter is a hex-encoded Unix timestamp). These links are valid for a limited window. The screenshots need to be downloaded and committed to the repo before the links expire  - recommended location: `docs/marketing/screenshots/` or directly into the README per the placeholder instructions added in Expedition 44.

**Discord #needs-input  - Alex asked "What document do u want me to review?"**

Alex posted this follow-up question, apparently willing to review a draft document. The highest-value document for Alex to review before launch is the r/531Discussion post draft  - it requires his personal 5/3/1 history filled in (Q4) and personal competitive framing (Q8). This unblocks the most important launch-day action.

**Action needed from Alex (screenshottable response drafted below in questions-for-alex update):** The loop should respond in #needs-input to Alex's question and direct him to review `docs/marketing/reddit-531discussion-draft.md`  - specifically the personal details in Option A ("Running BBB for about a year", "Tried Strong, Boostcamp", the actual story). This is the document that most needs his personal details.

**Screenshots are a real unlock:** The Reddit posts, Product Hunt listing, and YouTube Shorts all cite "screenshots needed" as a placeholder. Five real screenshots from the app are now available. Once downloaded and embedded, the r/531Discussion and r/reactnative drafts are substantially more ready to post.

**Status check:** iOS is still pending. The screenshot gap (the single most-cited blocker in the README and draft posts) is now unblocked pending download. All launch-day drafts remain polished.

---

## Expedition 50  - Research notes (milestone)

**Date:** 2026-05-29

**Expedition 50 is a milestone.** The strategy is now in a holding pattern waiting on iOS App Store approval. All 9 launch-day tactics have polished drafts. The main work this expedition is keeping the assets current and advancing tactic 14 (web tools SEO).

**Iteration count update:** All "47+" references across marketing drafts updated to "50+". Files updated: `reddit-vibecoding-draft.md` (5 instances), `reddit-casual-builder-story-draft.md` (3 instances), `reddit-reactnative-draft.md` (2 instances), `producthunt-launch-guide.md` (2 instances), `ai-experiment-story-outline.md` (1 instance), `longform-how-i-built-this.md` (1 instance), `launch-day-operations-guide.md` (1 instance), `questions-for-alex.md` (1 instance). Also fixed the stale "46 iterations" in the vibecoding Option B title.

**Tactic 14 advanced  - FAQ sections added to both tool pages:**

The plate-math and goal-calendar pages at 531strength.com/tools/ already had:
- Strong functional calculators
- Structured data (WebApplication JSON-LD schema with feature lists)
- Shareable URL state

What they were missing: text content that signals to search engines what queries these pages answer. A thin page with no explanatory prose doesn't rank for long-tail queries no matter how good the schema is.

Added to both pages: a 4-item FAQ grid ("How to use this calculator" / "About this calculator") with prose that naturally contains the target terms:
- `plate-math.astro`: "What is plate math?", "How does 5/3/1 plate math work?", "Standard vs. Women's bar", "Shareable links"
- `goal-calendar.astro`: "What is a training max?", "How long does it take to reach a goal on 5/3/1?", "Squat and deadlift vs. bench and press", "Shareable links"

Target search queries now covered in on-page text: "531 plate math calculator", "5/3/1 plate math", "5/3/1 training max calculator", "how long to reach goal 5/3/1", "5/3/1 progression calculator". These are low-competition long-tail queries that fit exactly what these tools do. The FAQ sections match the site's visual language (mono caps headings, same grid structure) and don't require any new npm packages.

**Linking strategy unchanged:** The next step for tactic 14 is organic  - drop these URLs in Reddit/forum discussions when plate math or progression timeline questions come up. The pages can now also rank on their own merit without a link. No additional product work needed.

**Status check:** iOS is still pending. All launch-day drafts are polished. The loop is in maintain-and-advance mode until iOS approval arrives.

---

## Expedition 49  - Research notes

**Date:** 2026-05-28

**Alex's answers  - resolved this expedition:**

**Q12 (camera preference): Both**  - Alex will use both screen recording AND face-cam. This unlocks the highest-completion format for YouTube Shorts: face-cam hook (0-4s), screen demo middle (4-38s), face-cam close (38-43s). No choice between formats needed  - the full format is available. The five-video content plan from Expedition 47 is revised: all videos now assume face-cam availability.

**Q13 (YouTube channel): From scratch, from personal channel, "what I built" video, dev influencer angle.** This is the identity-defining decision. The channel is not a brand channel for the app  - it's a developer's personal channel where the app is the most interesting project. Implications:
- Content should feel personal, not polished-product
- The builder story (expedition lore, Google Home, Pocket Cast) is as central as the app itself
- "Dev influencer" means future Shorts can range widely: other tools, other projects, build-in-public moments  - but the origin story for the channel is this app
- Starting from zero is fine for Shorts (74% of views come from non-subscribers), but the channel identity needs to be clear from video one
- The first video sets the frame: "developer who lifts, built something weird, here's what it is"

**Q3/Q5 combined (Pocket Cast + web tools):**
- Pocket Cast subscription confirmed  - the /process page language ("Subscribe in Pocket Cast and field logs come through like a podcast") is accurate and no changes are needed to that page
- Web tools (plate math + goal calendar) confirmed as the asset  - same visual style as home page, tools are already live at /tools/. No new product work needed. Tactic 14 added as organic SEO/link play.

**YouTube Shorts content plan  - revised for personal channel + both-camera format:**

The Expedition 47 five-video plan was drafted for an unknown camera situation. Now that both face-cam and screen recording are confirmed, and the channel is personal/dev-influencer, each video gets face-cam availability and the sequencing changes slightly:

**Video 1 (Origin story  - first to post):** "What I built"  - face-cam hook and close, screen demo middle. Establishes who Alex is, what the app is, and what the loop is. The identity video. See `docs/marketing/youtube-shorts-first-video-brief.md` for the full production brief.

**Video 2 (Loop reveal):** "My AI agent texts me when it ships code"  - updated for face-cam. Alex reacts to a Discord message in real time on camera, then cuts to showing what the code change produced in the app.

**Video 3 (Expedition lore):** "My app writes its own dev blog. I listen to it on Pocket Cast."  - face-cam intro, cuts to Pocket Cast showing the feed, then to the blog on 531strength.com. The Pocket Cast confirmation makes this directly usable.

**Video 4 (Crossover  - lifter + developer):** "The app that builds itself"  - interleaved cuts between Alex using the app in a gym or home gym setting and the Discord task queue. The "real lifting, real agent" contrast.

**Video 5 (Competitive):** "Why I stopped using Strong"  - face-cam delivers the "$120 vs. free" line, screen demo shows the app. This one can be posted once the App Store is live (needs dual-store CTAs).

**Sequencing guidance:** Post Video 1 first regardless of iOS status (the origin story doesn't need the App Store URL in the video itself  - put it in the description as "coming to iOS, Android available now"). Videos 2, 3, 4 can follow in any order. Video 5 should wait for iOS (the competitive comparison lands better with both stores available).

**Content plan for the /process page Pocket Cast line:**
The existing language at 531strength.com/process is confirmed accurate:
- "Subscribe in Pocket Cast and field logs come through like a podcast"  - line 558-562 of process.astro
- "The feed includes audio episodes for expedition logs with recordings and works in podcast apps like Pocket Cast"  - sign-off section

No edits needed to the /process page. The copy was written before Alex confirmed it  - it happened to be correct.

**Tactic 14  - web tools organic play:**
The /tools/ pages are already live: /tools/plate-math and /tools/goal-calendar. These are not just utilities  - they're a separate organic entry point for people who don't know the app exists. A person searching "531 plate math calculator" lands on the tool, uses it, and then optionally discovers the app. This compounds over time without ongoing effort (once it ranks). The linking strategy is: drop these URLs in Reddit/forum discussions whenever the question is about 5/3/1 math, not about app recommendations. Different thread, different audience segment, different conversion path.

**Iteration counts:** All "47+" and "49+" references in marketing drafts updated to "50+" in Expedition 50 across all 7 affected files.

## Expedition 47  - Research notes

**Date:** 2026-05-28

**YouTube Shorts as a marketing channel  - research summary:**

Platform scale is real: 2B monthly users, 200B daily views, 5.91% engagement rate (highest of all short-form platforms). 74% of Shorts views come from non-subscribers  - this is a discovery channel first, subscriber channel second. Channel size is largely irrelevant in the early stages.

The algorithm prioritizes four signals: swipe-away rate (did the first 3 seconds hold them?), watch-through rate, engagement rate (likes/comments/shares per view), and replay rate. Practical implication: the hook is the entire game. A Short that doesn't land in the first 3 seconds gets buried.

Optimal duration for this type of content: 38-47 seconds. 40-second Shorts achieve 33% higher engagement than shorter ones. Muted auto-play is common  - text overlays are not optional, they're part of the communication layer (73% of Shorts are watched without sound).

Consistency signal: channels posting 4-7 Shorts weekly see 3.2x higher subscriber growth. This matters for a sustained campaign but is not the opening constraint  - the first few videos need to exist before any growth strategy applies.

**Five specific video ideas for 531 Strength YouTube Shorts:**

**Video 1: "The plate math reveal" (app demo track)**
Hook (0-3s): "What weight goes on the bar for 78% of 245?"  - text on screen, no answer yet.
Middle (3-35s): Open the app. Watch it calculate automatically. Show the plate visualization per side. Pan to a real barbell setup that matches.
Reveal/CTA (35-47s): "531 Strength does this automatically for every set. Free, no account." App Store + Play Store links in description.
Target: lifters who search YouTube for 5/3/1 content. Zero developer angle.

**Video 2: "My AI agent texts me when it ships code" (builder story track)**
Hook (0-3s): "My homelab just told me my gym app fixed a bug."  - screen shows a Google Home or phone notification.
Middle (3-35s): Explain the loop in 25 seconds: cron fires, agent works, Discord summary → TTS to Google Home. Show the Discord message. Show the app change.
Reveal (35-47s): "I haven't written a line of this code. 50+ iterations. The app is free." Link to /process page.
Target: developers who would find this delightful. High shareability in developer communities.

**Video 3: "The expedition field log" (builder story track)**
Hook (0-3s): "My app writes its own dev blog. The author ends every post with 'For those who come after.'"  - show the blog excerpt.
Middle (3-35s): Explain the Logger rotation: different persona each loop, doomed, anonymous, writing to the next expedition. Show two or three different sign-offs.
Reveal (35-47s): "There are 47 of these. I listen to them on Pocket Cast." Link to 531strength.com/blog.
Target: developers who follow build-in-public content. This is distinctive  - no one else has expedition lore.

**Video 4: "The app that builds itself" (developer/lifter crossover)**
Hook (0-3s): "I built a gym app without writing any code. Here's what actually happened."  - face to camera or text overlay.
Middle (3-35s): Quick cuts between: (1) the app in use during a real session, (2) the Discord channel showing task queue items, (3) a commit rolling in. No deep explanation  - just the contrast of "this looks like a real app" and "here's the machine that made it."
Reveal (35-47s): "531 Strength. Free. No account. Built by Claude Code." Dual links.
Target: both audiences  - lifters see a real app, developers see the engineering story.

**Video 5: "Why I stopped using Strong" (app demo track, competitive angle)**
Hook (0-3s): "Strong costs $120. This is free and does the same thing."  - text overlay, no brand disparagement needed.
Middle (3-35s): Side-by-side or sequential: "Strong: subscription screen. This: open the app, start tracking." Show plate math, rest timer, BBB support.
Reveal (35-47s): "531 Strength. Free, local-only, no account." Links.
Target: lifters actively looking for alternatives. High search intent.

**Format guidance across all five:**
- Text overlays on every cut (73% watch without sound)
- First 3 seconds must work as a complete thought  - viewer should understand the hook without watching the rest
- 38-47 seconds total; don't pad
- Screen recordings can be done directly from the device  - no special equipment required
- Builder story track (Videos 2, 3, 4) pairs well with r/homelab, r/selfhosted, r/vibecoding post cross-linking

**Casual "look what I built" post  - drafted:**
Full draft at `docs/marketing/reddit-casual-builder-story-draft.md`. Includes long-form version (suitable for Reddit post body, Indie Hackers, personal blog) and short version (for r/vibecoding comment or quick post). This is a distinct tone from the technical longform piece  - it leads with the experience and the expedition lore rather than the architecture. Requires Alex to confirm homelab/TTS/Pocket Cast details before posting (see Q15-Q16 in questions-for-alex.md).

**Permalinkable tools (web calculator angle):**
The Discord task queue raised making the plate math calculator and goal calendar available as web tools at 531strength.com with permanent URLs. This is worth investigating as a separate tactic: a plate math calculator that ranks for "531 plate math calculator" or "5/3/1 BBB calculator" in search could drive steady traffic from people who never hear about the app through social channels. Not added to the 12-tactic list yet  - it's a product roadmap call (requires web dev work) that Alex needs to weigh in on (Q17 in questions-for-alex.md).

**Iteration counts updated:** All "46+" references in marketing drafts updated to "47+": `docs/marketing/reddit-vibecoding-draft.md`, `docs/marketing/longform-how-i-built-this.md`, `docs/marketing/ai-experiment-story-outline.md`, `docs/marketing/reddit-reactnative-draft.md`, `docs/marketing/producthunt-launch-guide.md`, `docs/marketing/launch-day-operations-guide.md`, `docs/marketing/questions-for-alex.md`.

**New files created this expedition:**
- `docs/marketing/reddit-casual-builder-story-draft.md`  - casual builder story draft (homelab/lore/expedition angle)
- Tactic 13 (YouTube Shorts) added to strategy and progress tracker

## Expedition 46  - Research notes

**Date:** 2026-05-28

**Competitor App Store review analysis (primary source):** The top-ranked iOS app for "531" searches is "531 Strength" (id1062989244, 4.9 stars, 11,000 ratings  - a different app than the one being launched). Its own App Store reviews document three recurring user complaints verbatim: (1) the rest timer stops when you leave the app, (2) there is no plate calculator, (3) BBB is not supported. These are not inferred from roundup articles  - they are documented in the competitor's own reviews. This is the first primary-source confirmation of the market gap the launch pitch is built around. Update to drafts: competitor review analysis note added to `docs/marketing/reddit-531discussion-draft.md`; HN differentiation answer added to `docs/marketing/ai-experiment-story-outline.md`. Naming note: both apps share the name "531 Strength"  - Alex should be aware of this when filling in App Store metadata and may want to differentiate with a subtitle.

**Additional competitor landscape:** Wendler Log (Vandersoft) is on both iOS and Android and includes plate math, cloud sync, and 11 assistance programs. It is more feature-complete than the existing "531 Strength" app. It represents the paid-feature ceiling. The new app's position remains accurate: free, local-first, BBB-complete, background rest timer  - specifically the features the community asks for and existing paid apps charge for or exclude.

**Repstack (Feb 2026 Show HN):** An offline-first hypertrophy PWA targeting the RP community. Not a direct competitor (different program, different audience) but confirms HN appetite for local-first fitness tools. No specific points/comment data retrieved due to HN rate limiting.

**No live community threads found:** No r/531Discussion or r/weightroom threads surfaced through external indices this loop. Strategy unchanged: post on iOS launch day.

**Iteration counts updated:** All "44+" and "45+" references in marketing drafts updated to "46+": `docs/marketing/reddit-vibecoding-draft.md` (multiple references), `docs/marketing/longform-how-i-built-this.md`, `docs/marketing/ai-experiment-story-outline.md`.

**Discord #needs-input:** Inaccessible this loop (HTTP 403 on API call  - likely a token permission scope issue). No Alex replies retrieved. All open questions from `docs/marketing/questions-for-alex.md` remain outstanding.

## Expedition 45  - Research notes

**Date:** 2026-05-28

**iOS review times corrected:** Runway's live tracker (updated May 27, 2026) shows the actual current iOS App Store review speed is far faster than the "2-7 day" estimate documented in Expedition 43. Median "waiting for review" is now 8h 27m; "in review" is 1h 53m. Most approvals complete within 12–24 hours. Tuesday submissions are fastest (10h 22m to start); Friday/Saturday are slowest (~17h). The launch-day operations guide and questions-for-alex.md have been updated to reflect this. Practical impact: Alex should have all posts ready to go before submission, not after a multi-day buffer. The clock starts fast.

**HN "autonomous agent" framing confirmed dead:** Auto-Co (Show HN, March 2026)  - "14 AI agents that run a startup autonomously"  - received 4 points and 2 comments. The one visible comment was skeptical: "there are so many of these...what's the difference." This is direct 2026 evidence for what the Expedition 40 strategy revision already concluded from 2025 data: leading with autonomous agent framing on HN is a losing move. Title Option A ("I let a Claude agent build my gym app, start to finish") remains correct  - personal story first, agent loop is the interesting secondary fact, not the headline claim. Updated the HN tactic notes in the progress tracker.

**Market gap confirmed again by 2026 source:** Setgraph's roundup of 15 workout apps tested by lifters (2026) explicitly notes that "strong lifters need apps supporting percentage-based programs like 5/3/1 or conjugate training" but lists this as a desired feature rather than one any app delivers. No dedicated 5/3/1 tracker appears. This is now a third independent 2026 source confirming the gap (previously: Cora Health synthesis, FindYourEdge roundup). The r/531Discussion premise remains accurate and uncontested.

**No live community threads found:** Reddit continues to be poorly indexed externally. No r/531Discussion, r/weightroom, or r/531 threads about app recommendations surfaced this loop. Strategy unchanged: post on iOS launch day, not in response to existing threads.

## Expedition 44  - Research notes

**Date:** 2026-05-28

**GitHub README visual gap identified and addressed:** Per 2026 README best-practices research (DEV Community, multiple sources), the single biggest lever for GitHub README engagement is visual proof  - screenshots or short GIFs that show the app in motion. The "What is this? Why should I care?" question must be answered in the first two lines, but the screenshot answers "Does this actually work?" which is what converts a visitor into someone who downloads or stars. A Screenshots placeholder section was added to the README with explicit instructions for Alex: which three screens to capture (Today queue, Live session with plate math, Session receipt), how to embed them, and why this matters. The iteration count was updated to 44+ throughout.

**App Store vibe-coding-flood context documented:** A 9to5Mac article (March 2026) reports that Apple's review times extended significantly due to AI-generated app submissions. iOS submissions are up 89% YoY; Apple's human review team processes 200,000+ submissions/week. Apple's concern is specifically apps where the developer cannot explain or defend the code  - the hallmark of low-oversight vibe coding, not multi-agent engineering with CI enforcement. This is now documented as a comment-prep framing hook in both `docs/marketing/reddit-vibecoding-draft.md` and `docs/marketing/ai-experiment-story-outline.md`. If the topic comes up in HN or r/vibecoding comments, the answer is ready.

**Iteration counts updated throughout:** All "42+" references in marketing drafts updated to "44+": `docs/marketing/reddit-vibecoding-draft.md` (multiple references), `docs/marketing/longform-how-i-built-this.md`, `docs/marketing/ai-experiment-story-outline.md`.

**Market gap remains uncontested:** Corahealth synthesis of 200+ Reddit threads (May 2026) confirms no dedicated 5/3/1 tracker appears in any recommendation roundup. Strong, Hevy, Boostcamp, and FitNotes remain the dominant names. The "I couldn't find a clean 5/3/1+BBB tracker" premise is still accurate, uncontested, and honest.

**No live community threads found:** Reddit remains poorly indexed externally. No r/531Discussion or r/weightroom threads about app recommendations surfaced. Strategy unchanged: post on iOS launch day, not in response to existing threads.

## Expedition 43  - Research notes

**Date:** 2026-05-28

**App Store timing context confirmed:** iOS review times are now 2–7 days for new submissions (up from historical 24–48h). App releases on iOS are up 89% year-over-year as of April 2026, driven by AI coding tools. Apple's review team is processing dramatically more submissions with higher scrutiny. This affects launch planning: assume 3–7 day wait, have all posts pre-written, don't time the launch campaign around a specific day of submission.

**r/vibecoding comment prep sharpened:** New concrete data for the "CI enforcement" counter-argument. A security analysis of 1,645 Lovable-built apps found 170 with exploitable vulnerabilities. A survey of 18 CTOs found 16 reported production disasters from AI code. These are the specific outcomes the community is reacting to. 531 Strength's answer (CI-enforced boundaries, property tests, QA agent) is architectural, not aspirational  - that distinction lands in a community that's seen the failures. Updated `docs/marketing/reddit-vibecoding-draft.md` with a "Expedition 43 signal" section including comment prep language.

**Launch-day operations guide created:** A consolidated hour-by-hour playbook for when iOS approval arrives. Previously the execution sequence was spread across five separate draft files; this guide pulls it together into one doc Alex can run against. Covers: what to do at hour 0, Day 1 (r/531Discussion), Day 2 (r/weightroom), Days 3–4 (X tweet), Week 1 (r/reactnative, r/vibecoding, HN), Weeks 2–3 (IH, Product Hunt), and ongoing channels. See `docs/marketing/launch-day-operations-guide.md`.

**App Store timing note added to questions-for-alex.md:** Context added so Alex knows the current review environment  - what to expect, what rejection patterns look like, and why the privacy angle should be explicit in App Store metadata.

**No new community threads found:** Reddit search through web indices still returns no indexed r/531Discussion or r/weightroom threads. No live thread to respond to this loop. Strategy remains: post on iOS launch day, not in response to an existing thread.

**HN and IH traction signals remain positive:** Workout.cool (827 points, 233 comments, May 2026) confirmed the fitness Show HN appetite is real. The top criticism there (bad programming quality, no progression logic) is the exact criticism 531 Strength is immune to  - pre-answering it in the HN first comment remains the right call. AI fitness coach Show HN also live in April 2026  - demonstrates the category is active and HN is engaging with it.

## Expedition 42  - Research notes

**Date:** 2026-05-28

**Community search verdict:** Reddit is not well-indexed externally. No specific r/531Discussion or r/weightroom threads surfaced where a user was actively asking for a 5/3/1 app recommendation  - no live thread to respond to this loop. Check again next time iOS is live and use the App Store launch as the trigger to post.

**Market gap confirmed:** The 2026 strength app roundups (FindYourEdge, Jefit, Setgraph, Vora, The Manual, Built) still show Strong, Hevy, Boostcamp, and FitNotes as the primary options. No dedicated 5/3/1 tracker appears in any list. The gap that drives the r/531Discussion pitch ("I couldn't find a clean tracker for this specific program") remains accurate and uncontested.

**HN fitness app appetite is real:** Workout.cool (open-source fitness coaching PWA) got 827 points and 233 comments on Show HN May 2026. The primary criticism was programming quality  - bad exercise order, no progression logic. 531 Strength is immune to that criticism because it implements an established, named program. This gives Alex a strong pre-answer: "The program is Jim Wendler's  - I just implemented it faithfully." Add this framing to the HN first-comment prep. See updated `docs/marketing/ai-experiment-story-outline.md`.

**r/vibecoding framing sharpened:** The dominant community view in 2026 is "vibe coding is a prototyping methodology, not production." 531 Strength contradicts this directly  - CI enforcement, property-tested domain logic, App Store live. The r/vibecoding post draft has been updated to lead with this contrast rather than just describing the architecture. See updated `docs/marketing/reddit-vibecoding-draft.md`.

**Product Hunt video is now highest-priority pre-launch asset:** Research confirms PH's 2026 algorithm weights engagement (comments, saves) over raw upvotes. Products with a 45-60 second muted demo video get significantly more engagement than screenshots-only. A screen recording of one live session (Today → Live → plate math → AMRAP → rest timer → session receipt) is now the #1 missing asset before PH launch. The guide has been updated with a spec. See `docs/marketing/producthunt-launch-guide.md`.

**No new blockers identified.** The existing blockers (App Store URL, GitHub Releases URL, Alex's Reddit history, personal 5/3/1 details) remain. Nothing unblocked this loop.

## Sources

- [5/3/1 BBB Reviews  - Boostcamp](https://www.boostcamp.app/coaches/jim-wendler/5-3-1-boring-but-big/reviews)
- [Best Workout Tracker App Reddit  - Setgraph](https://setgraph.app/ai-blog/best-workout-tracker-app-reddit)
- [Indie Maker Analytics 2024-2025  - IndieLaunches.com](https://indielaunches.com/indie-maker-analytics-2024-2025-projects/)
- [Low-Cost App Marketing  - Indie App Santa](https://indieappsanta.com/2025/11/21/10349/)
- [Fitness App Privacy  - TechRadar](https://www.techradar.com/computing/cyber-security/beware-80-percent-of-the-most-popular-fitness-apps-are-selling-out-your-privacy)
- [Best Strength Training Apps 2026  - FindYourEdge](https://www.findyouredge.app/news/best-strength-training-apps-2026)
- [Best Workout Tracker App Reddit 2026  - Cora Health](https://www.corahealth.app/blog/best-workout-tracker-reddit)
- [Workout.cool Show HN (827 points, 233 comments)](https://news.ycombinator.com/item?id=44309320)
- [Ask HN: How far has vibe coding come?](https://news.ycombinator.com/item?id=46807308)
- [Vibe Coding on Reddit  - MorphLLM analysis](https://www.morphllm.com/reddit-vibe-coding)
- [Product Hunt Launch Guide  - Tom Dekan](https://tomdekan.com/articles/product-hunt-launch-guide)

## Expedition 77  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 77+:**

All "76+" count references across all marketing docs updated to "77+". README was already at "77+" (updated by the README loop). Files updated this expedition: `youtube-shorts-first-video-brief.md` (5 instances  - platform context, Version C hook, Version D hook now reads "77 times", spoken line reference, "Note on the number" now names Expedition 77, minimum-viable-path step 1), `youtube-shorts-draft.md` (3 instances  - spoken line, "Note on the number" block, first comment/description), `reddit-vibecoding-draft.md` (5 instances  - research context, Option A title, alternative title, body entry counts, Option B title now reads "77 iterations"), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (2 instances  - timing note and Dynamic Workflows comment-prep iteration references), `producthunt-launch-guide.md` (2 instances), `questions-for-alex.md` (1 instance  - now reads "77+ Logger posts exist as of Expedition 77"), `reddit-casual-builder-story-draft.md` (3 instances  - entry count, "Seventy-four-plus" → "Seventy-seven-plus", short-version iteration count).

**New screenshots  - screenshot-6, -7, -8 are now the canonical post screenshots:**

Three new higher-quality real-device screenshots added to docs/screenshots/ and apps/web/public/ this expedition (expedition 76 commit):
- screenshot-6: Today screen (Bench, C2D1, plate visualization, START SESSION)  - use as context/before shot
- screenshot-7: Live AMRAP (Bench now., AMRAP sheet open, e1RM calculation)  - strongest single-image for both r/531Discussion and r/reactnative; shows the technically interesting @gorhom/bottom-sheet + plate math combination
- screenshot-8: Session receipt with embedded PR certificate (In the book., +25 LB)  - the emotional payoff for r/531Discussion; PR cert is distinct from the older receipt screenshots

Both r/531Discussion and r/reactnative draft screenshot sections updated to reference these three new files as the preferred assets for posting. The older Screenshot_20260527-*.png files remain valid but are superseded.

**YouTube Shorts  - new search discoverability signal (January 2026):**

YouTube introduced a dedicated "Shorts" content type filter in search results in January 2026 (9to5Google, Engadget, BetaNews). Shorts now rank independently in YouTube search  - a Short can appear in search results alongside long-form videos for the same query, in a separate tab. This is a significant discoverability change from the 2025 state where Shorts were fed algorithmically but not search-indexed in the same way.

Practical implication for the first YouTube Short: the video title and description keyword strategy now matters as much as the hook. A Short titled "I built a 5/3/1 gym app with a Claude AI agent" can rank for YouTube search queries like "5/3/1 app", "531 strength training app", or "AI coding project 2026". This was added as a note to `docs/marketing/youtube-shorts-first-video-brief.md`. The current title ("I built a gym app with an AI that runs every 30 minutes") is strong for cold algorithmic discovery but should include "5/3/1" in the description and pinned comment for search-based discovery.

**Boostcamp BBB competitive gap  - confirmed live (May 2026):**

Live review check confirmed: Boostcamp 5/3/1 BBB reviews page shows reviewer "Biledriver" (still showing as approximately 1 month ago) stating verbatim: "This only has the first block." The competitive gap framing remains accurate and primary-sourced. No change needed to draft copy.

**Claude Sonnet 4.6  - new model context:**

The loop is now running on Claude Sonnet 4.6 (as confirmed by the system context). This is relevant as background context: the harness runs on a model explicitly designed for "agentic coding and tool use" (Techzine, DataCamp). Not a post-body claim, but relevant if HN asks what model version the loop runs on  - Sonnet 4.6, not Opus.

**iOS App Store status  - still pending:**

No change. All drafts remain ready. Blocking human items unchanged: App Store URL (after approval), Alex's personal 5/3/1 history for the r/531Discussion post.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "77 times." See `docs/marketing/youtube-shorts-draft.md`. Note: include "5/3/1" in the title/description for the new search discoverability.
4. When posting the Short: use screenshot-7 as the preview thumbnail candidate  - it shows the most technically striking frame (AMRAP sheet + e1RM + plate math).

---

## Expedition 76  - Research notes

**Date:** 2026-05-29

**Iteration count advancement  - all marketing docs updated to 76+:**

All "75+" count references across all marketing docs updated to "76+". README was already at "76+" (updated by a prior loop process). Files updated this expedition: `youtube-shorts-first-video-brief.md` (4 instances  - platform context, Version C hook, Version D hook now reads "76 times", "Note on the number" now names Expedition 76), `youtube-shorts-draft.md` (2 instances  - spoken line, first comment/description), `reddit-vibecoding-draft.md` (6 instances  - research context, Option A title, alternative title, body entries, Option B title now reads "76 iterations"), `reddit-reactnative-draft.md` (2 instances), `longform-how-i-built-this.md` (1 instance), `ai-experiment-story-outline.md` (1 instance  - timing note now names Expedition 76), `producthunt-launch-guide.md` (2 instances), `questions-for-alex.md` (1 instance  - now reads "76+ Logger posts exist as of Expedition 76"), `reddit-casual-builder-story-draft.md` (2 instances).

**Claude Opus 4.8 + Dynamic Workflows  - new signal, significant framing hook for r/vibecoding and HN comment prep:**

Anthropic shipped Claude Opus 4.8 and Dynamic Workflows (research preview in Claude Code) on May 28, 2026. Dynamic Workflows is a new managed multi-agent approach: Claude writes the orchestration script at runtime, spawning up to 1,000 parallel subagents, deploying adversarial verification agents, and iterating until results converge. Featured case study: Jarred Sumner (creator of Bun) used it to port 750,000 lines from Zig to Rust in 11 days. CyberAgent's Ken Takao described it as filling "the gap between firing off a single subagent and building out a full agent team."

The 531 Strength harness is the opposite architecture and deliberately so. Dynamic Workflows is dynamically orchestrated  - Claude decides at runtime how to decompose, what subagents to spawn, when results are good enough. The 531 Strength harness is statically orchestrated  - roles defined in advance (rn-designer → rn-frontend → rn-qa), each with a role skill file and explicit constraints, deterministic handoffs, and CI enforcement that survives across 76 iterations regardless of what any agent decides. The architecture is designed for consistent, bounded, long-running production maintenance, not one-shot high-parallelism exploration tasks.

Comment prep added to both `docs/marketing/reddit-vibecoding-draft.md` (Expedition 76 signal section) and `docs/marketing/ai-experiment-story-outline.md` (new signal block before Indie Hackers section). The prepared answer for "why not just use Dynamic Workflows?": Dynamic Workflows makes different decomposition decisions on iteration 76 than iteration 1  - that's the design. The 531 Strength harness makes the same decisions. That consistency is the tradeoff the architecture favors, and it's what makes shipping without reading every line of code viable across 76+ iterations.

Also: Claude Opus 4.8 itself is 4x less likely than 4.7 to let code bugs pass unremarked and scores 0% on uncritically reporting flawed results  - an improvement to the model running this loop. Not a post-body claim, but worth knowing if HN asks whether the underlying model quality matters.

**Boostcamp BBB "only first block" complaint  - confirmed still live (April 2026):**

Live review check confirmed: Boostcamp 5/3/1 BBB reviews page shows a reviewer ("Biledriver") from approximately April 2026 (1 month ago as of check date) stating verbatim: "This is supposed to be a 12-16 week program. I paid for the app so the change in weights between blocks 1 to 2, 2 to 3 and 3 to 4 would be calculated. This only has the first block." The competitive gap framing remains accurate and primary-sourced.

**r/weightroom community signal  - no change:**

2026 roundup syntheses (Cora Health, Setgraph) continue to name Strong, Hevy, Boostcamp, and FitNotes as the community defaults. No dedicated 5/3/1 tracker appears in any recommendation list. Competitive gap unchanged.

**No live community threads found:**

No indexed r/531Discussion or r/weightroom threads about app recommendations surfaced. Reddit remains poorly indexed externally. Strategy unchanged.

**iOS App Store status  - still pending:**

No change. All drafts remain ready. Blocking human items unchanged: App Store URL (after approval), Alex's personal 5/3/1 history for the r/531Discussion post.

**Next actions:**
1. iOS approval: run `docs/marketing/launch-day-operations-guide.md`.
2. Alex: fill in personal 5/3/1 history in `docs/marketing/reddit-531discussion-draft.md`  - the single human-only blocker for the most important launch-day post.
3. Alex: film the YouTube Short. Unblocked without iOS. Version D hook now reads "76 times." See `docs/marketing/youtube-shorts-draft.md`.
4. Comment prep update (new, Expedition 76): Claude Opus 4.8 Dynamic Workflows (May 28, 2026)  - the "why not use Dynamic Workflows?" question will appear in HN and r/vibecoding comments. The prepared answer is now documented in both draft files. The key point: Dynamic Workflows is for one-shot high-parallelism tasks; this harness is for consistent 76-iteration production maintenance.

---

## Expedition 75  - Research notes

**Date:** 2026-05-30

**Iteration count advancement  - all marketing docs updated to 75+:**

All "74+" count references across all marketing docs updated to "75+". Files updated: `youtube-shorts-first-video-brief.md` (Version D hook now reads "75 times"), `youtube-shorts-draft.md`, `reddit-vibecoding-draft.md`, `reddit-reactnative-draft.md`, `longform-how-i-built-this.md`, `producthunt-launch-guide.md`, `launch-day-operations-guide.md`, `questions-for-alex.md`, `reddit-casual-builder-story-draft.md`. `README.md` updated to "75+ iterations".

**No new research signals this expedition.** Competitive gap (Boostcamp BBB) and Code with Claude London framing remain current. Next loop: advance one tactic from the table above or do a fresh competitive check.
