---
status: open
drafted: 2026-05-28
purpose: What the organic-marketing agent needs from Alex to finalize launch-day copy
---

# Questions for Alex

These are the gaps between what can be drafted from repo context and what needs a human answer before copy goes live. Organized by urgency.

---

## App Store approval timing context (Expedition 43, updated Expedition 45)

iOS App Store review times were elevated in early 2026 due to AI app flood (89% YoY increase in submissions). That context is still relevant for the r/vibecoding framing, but the actual queue times have improved: Runway's live tracker (updated May 27, 2026) shows median "waiting for review" is now 8h 27m and "in review" is 1h 53m. Most new app approvals complete within 12–24 hours.

The earlier "2-7 day" estimate was from the peak surge period. The current baseline is much faster — treat approval as potentially arriving the same business day as submission. Submissions on Tuesday perform best (fastest review start); Friday and Saturday submissions wait longest (~17h before review begins).

Practical implication: have all posts pre-written and ready to go before you submit. The launch-day guide at `docs/marketing/launch-day-operations-guide.md` is set up for exactly that: fill in two blanks and post in sequence. Don't assume a multi-day buffer — you may need to act within hours of receiving the approval email.

If the submission gets rejected: the most common rejection reasons for new apps in 2026 are incomplete metadata, edge cases that break during review (offline mode, empty data states, invalid inputs), and unclear data handling explanations. The privacy angle (zero analytics, local SQLite, no account) should be explicitly stated in the App Store description — that's both a marketing message and a pre-answer to reviewer scrutiny.

---

## Blocking — needed before iOS launch day posts

**1. The GitHub Releases URL**
The r/531Discussion and r/weightroom drafts both have `[GitHub Releases link — fill in]`. What is the canonical URL for the Android APK on GitHub Releases? Format: `https://github.com/[org]/[repo]/releases/latest` or a specific release permalink.

**2. The App Store URL**
Will be needed the moment iOS goes live. Apple usually gives a short link like `https://apps.apple.com/app/id[number]`. Do you have the app ID yet from the submission? If not, it'll be available once the app is approved.

**3. Have you ever posted in r/531Discussion or r/weightroom before?**: No
Reddit is much more receptive to posts from accounts with community history. If you have an existing Reddit account with some history in these communities, post from that account. If not, the post needs to be even more practitioner-framed and may need to live in a thread rather than as a standalone post. This changes the copy slightly.

**4. Do you want to include your personal story in the r/531Discussion post?**
The draft uses "running BBB for about a year" as a framing device. Is that accurate? What's your actual 5/3/1 history — how long have you been running it, what lifts are you tracking? More specific = more credible. (This is the "2 plates to 3 plates" arc from INTENT.md — do you want any of that in the post, or keep it generic?)

---

## Needed before the HN / Indie Hackers posts

**~~5. How many expedition iterations will exist by HN launch day?~~** — RESOLVED (Expedition 42)
The "20+ expedition logs" threshold is already satisfied — 46 Logger posts exist as of Expedition 46. The current count for copy purposes is **46+ iterations**. Fill in `[N]` with "46+" for now; it will increase with each loop before launch.

**6. ~~Does the /process page exist yet?~~** — RESOLVED (Expedition 40)
The /process page exists at `531.dev/process` and is well-built. It covers: the loop architecture, the Discord workflow, the three-channel system, the four loop steps, the rules, the full stack, the scribe era history (Margin → Verso → Logger rotation), and an about section. It is ready to be the linked destination for both the HN and Indie Hackers posts. No further work needed on this item.

**7. What's your Twitter/X handle?**
Tactic 4 involves posting to X and tagging @jimwendler. What account will the tweet come from? Is there a project account or will it come from your personal account?

---

## Nice to have — improves copy quality

**8. What's the exact complaint you had with existing apps?**: It looked boring, not easy to use. Wanted a plate visualizer/calculator. Not free.
The drafts use "Strong costs $120, Boostcamp's BBB block cuts off" as the competitive framing. Are these accurate from your experience? Did you actually try those specific apps? If the framing is wrong, the post sounds dishonest to people who also use those apps. Fill in what's real.

**9. Plate visualization — can you describe it in one sentence?**
The r/reactnative post mentions the plate visualization as an interesting component. One concrete sentence about what it shows (e.g., "decomposes your working weight into actual plates — 2x45, 1x25, 1x10 — shown per side for your bar weight") would make that post hit harder. What would you say about it if you were explaining it to a lifter?

**10. Is there a demo video or GIF?**
A 30-second screen recording of a live session (warm-up → working set → AMRAP → rest timer → receipt) would dramatically improve the Reddit posts. Screenshots are good; a video is better for showing that the rest timer actually works. Does one exist? If not, should the loop build a task to capture one before launch?

---

## Notes on what can be finalized now vs. later

**Can be finalized now (no Alex input needed):**
- r/531Discussion and r/weightroom post structure and framing — done
- AI experiment story outline + revised HN strategy — done (Expedition 40)
- HN and IH structure — done
- /process page — exists, ready to link (resolved Expedition 40)
- Long-form "how I built this" narrative — drafted (Expedition 40). See `docs/marketing/longform-how-i-built-this.md`

**Cannot be finalized until iOS is live:**
- Actual App Store URL in both Reddit posts

**Cannot be finalized until Alex answers:**
- GitHub Releases URL (Q1)
- Reddit account history (Q3) — affects whether standalone post or thread reply is the right play
- Personal 5/3/1 history (Q4) — affects practitioner credibility of r/531Discussion post
- Expedition count at HN launch day (Q5) — fill in [N] placeholders in HN lead paragraph
- Twitter/X handle (Q7) — needed for @jimwendler tweet

**New item (Expedition 40):**
**11. Review the longform narrative — `docs/marketing/longform-how-i-built-this.md`**
A full-arc "how I built this" piece is drafted — ~1,200 words covering: the personal itch, the unusual constraint, how the loop works, what was hard, what surprised you, where it is now, and the open question. This is the source asset for:
- Indie Hackers milestone post (extract and expand section 3+4)
- HN submitter comment (extract the "what surprised me" section)
- Any platform where the full narrative fits

**Before it can be published, Alex needs to:**
- Fill in personal 5/3/1 details (how long running it, actual lifts — currently placeholder "about a year")
- Confirm or correct the competitive framing (Strong, Boostcamp — is this accurate from your experience?)
- Fill in [N] expedition count
- Add GitHub link and App Store link
- Decide: post under personal name or project name?
