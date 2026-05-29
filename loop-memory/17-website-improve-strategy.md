---
name: website-improve-strategy
description: Strategy and progress tracker for the self-improving website loop. Covers SEO, content, UX, and technical improvements to 531strength.com. Run each auto-improve iteration.
---

# 531strength.com — Website Self-Improvement Strategy

**Created**: 2026-05-28 (Expedition 45)
**Last updated**: 2026-05-29 (Expedition 54)
**Status**: Active — iterating each loop

## Purpose

This strategy file drives the "Make the website better" category in `loop-criteria.md`.
The `website-improve` agent reads it each iteration, picks the next actionable step,
executes it, and updates the tracker below.

The website is at `apps/web/` — an Astro static site deployed to 531strength.com.

## Improvement tracks

### Track A — SEO / discoverability

Make the site findable by the right people:
- 5/3/1 practitioners searching for a tracker
- Developers curious about agent-built software
- Journalists writing about vibe-coding / AI dev tools

Key levers: structured data (JSON-LD), meta descriptions, page titles,
internal linking, sitemap accuracy, og:image for social sharing.

Current gaps:
- [x] og:image added to homepage (expedition 48) — uses /screenshot-2.png (real device screenshot)
- [x] JSON-LD SoftwareApplication schema added (expedition 45)
- [x] Sitemap confirmed (expedition 50) — `@astrojs/sitemap` is configured in astro.config.mjs; generates /sitemap-index.xml and /sitemap-0.xml at build time
- [x] og:image added to all pages (expedition 50) — /screenshot-2.png default applied to all blog posts, listing pages, tools pages, and process page

### Track B — Content accuracy

Keep the website copy accurate and honest:
- App feature list matches what's actually shipped
- Iteration count is always derived from blog post count (not hardcoded) — this is already done
- Platform availability (Android live, iOS in review) should update when iOS ships
- Process page stays accurate to how the loop actually works

Current gaps:
- [ ] iOS App Store URL — waiting on Apple approval (Alex needs to update when live)
- [ ] Screenshots section in README + homepage is a placeholder
- [x] The "How it works" section references Expo Go — confirmed NOT present (expedition 48 audit was correct; no Expo Go in any /pages file; item was stale)
- [x] Process page step 03 diagram said `OTA` — corrected to `push` (expedition 53). OTA now triggers via CI on push, not by the loop agent directly.
- [x] Workflow section "03 · Shipped" paragraph implied loop agent pushes OTA — corrected to describe CI triggering OTA on commit push (expedition 53)

### Track C — UX / conversion

Make visitors understand what this is and want to download it:
- Above-the-fold copy is clear: what the app does, for whom, why it's free
- CTAs are prominent and have real targets (not "coming soon")
- The dev blog is discoverable and the expedition-logs page is distinct
- Mobile navigation works (fixed in expedition 41 per task queue)

Current gaps:
- [x] Real device screenshots added to homepage (expedition 48) — new "Real device" section with 2 screenshots
- [x] Process page counts are auto-derived (confirmed expedition 50) — uses getCollection dynamically
- [x] Tools linked from homepage body (expedition 50) — new "05 · Free tools" section with plate-math and goal-calendar cards
- [ ] Blog listing is long with no pagination (ok for now, revisit at 60+ posts)

### Track D — Technical health

Keep the codebase clean and fast:
- [x] index.astro CSS extracted to `src/styles/home.css` (expedition 46)
- [x] process.astro CSS extracted to `src/styles/process.css` (expedition 46)
- [x] robots.txt is correct — `Allow: /`, sitemap URL points to `531strength.com` (robots.txt was correct; astro.config.mjs domain was the bug — was a `531.dev` placeholder, fixed to `531strength.com` in expedition 46)
- [x] Internal links audited (expedition 50) — all footer/nav anchor hrefs (/#program, /#plate, /#screens, /#get) match live IDs in index.astro; /tools, /blog, /process, /privacy, /support, /rss.xml all resolve; no broken links found

### Track E — Blog framework

The expedition-logs listing and the main /blog listing work well.
On-going: keep colophon accurate to the current fiction (Logger era).

## Progress tracker

### Expedition 54 notes

Two content-accuracy fixes shipped:

1. **Logger era start date corrected** (Track E): Both `blog/index.astro` and `process.astro` said
   the Logger rotation started on "2026-05-27" — but expedition 1 is dated 2026-05-26 and the
   persona-change entry in `04-dev-blog-persona.md` is also dated 2026-05-26. Corrected both
   occurrences to "2026-05-26".

2. **Duplicate summary removed from featured card body** (Track C UX): The featured-post section
   in `blog/index.astro` was rendering `featured.data.summary` twice — once in the meta sidebar
   and again as a plain `<p>` in the body. The duplicate paragraph was replaced with a
   context-sensitive note: Logger posts get a sentence explaining the field-log / gommage framing
   with a link to `/blog/expedition-logs`; non-Logger posts get a brief description of what a
   loop post is. Both paths avoid re-showing the summary that's already in the sidebar.

| Item | Status | Notes |
|------|--------|-------|
| JSON-LD SoftwareApplication schema | done · expedition 45 | Added to index.astro. Covers name, category, OS, price, description, URL. |
| website-improve agent created | done · expedition 45 | See `.claude/skills/website-improve/SKILL.md` and this file. |
| Discord #needs-input collaboration | done · expedition 45 | Channel exists (1509774367498829935). Bot can post questions for Alex. |
| index.astro CSS extraction | done · expedition 46 | 2654-line scoped style block extracted to `src/styles/home.css`. Imported at frontmatter level. |
| process.astro CSS extraction | done · expedition 46 | 798-line scoped style block extracted to `src/styles/process.css`. |
| astro.config.mjs domain fix | done · expedition 46 | Was `531.dev` placeholder, corrected to `531strength.com`. Affected sitemap URLs, og:url, canonicals. Also fixed RSS fallback. |
| Dead code removal (PlateBar.astro) | done · expedition 46 | 301-line unused illustration component removed (superseded by PhonePlateBar.astro). |
| /tools index page | done · 2026-05-28 | Lists both calculator tools. SEO: CollectionPage JSON-LD, descriptive meta. |
| /tools/plate-math page | done · 2026-05-28 | Interactive plate calculator. Unit toggle (lbs/kg), bar selector, stepper + direct input, text-art barbell diagram, SEO JSON-LD WebApplication. |
| /tools/goal-calendar page | done · 2026-05-28 | 5/3/1 goal projector. Per-lift TM progression, cycle table, summary stats. SEO JSON-LD WebApplication. |
| Footer /tools link | done · 2026-05-28 | Added "Tools" to Product column in Footer.astro. |
| og:image default | done · expedition 48/50 | /screenshot-2.png used as homepage og:image (exp 48). Extended to all pages — blog posts, listing, tools, process — in expedition 50. |
| Sitemap verification | done · expedition 50 | @astrojs/sitemap configured; generates /sitemap-index.xml + /sitemap-0.xml at build. |
| Internal links audit | done · expedition 50 | All footer/nav hrefs checked — no broken links. Duplicate tracker entry removed. |
| Tools section on homepage | done · expedition 50 | "05 · Free tools" section added to index.astro with plate-math and goal-calendar cards. Body now links into /tools. |
| App Store URL update | blocked · waiting on Apple | Alex to update homepage CTA when iOS is live. |
| Screenshots on homepage | expanded · expedition 52 | Expedition 48: Added 2-screenshot "Real device" section. Expedition 52: Expanded to 4 screenshots (Today, Live session, Session receipt, PR Certificate). Added screenshot-3.png and screenshot-5.png to apps/web/public/. Grid updated from 2-col to 4-col (responsive: 2-col at ≤860px, 1-col at ≤480px). Copy updated from "light/dark mode" to before/during/after session flow. |
| Pocket Cast confident copy | done · expedition 48 | process.astro now says "I subscribe in Pocket Cast" (not hedged). |
| Expo Go pages audit | done · expedition 48 | No Expo Go references found in /pages — only in historical blog posts (correct). |
| Duplicate section marker fix | done · expedition 51 | Homepage had two sections marked "04" (Real device + The product/screens rail). "Real device" changed to unlabeled marker — screens rail keeps 04, free tools keeps 05. |
| Strategy file audit (expedition 52) | done · expedition 52 | Fixed stale/wrong domain note in progress tracker and Track D (astro.config.mjs entry said "Was 531strength.com, now 531.dev" — backwards; corrected). Verified: no hardcoded iteration counts in index.astro or process.astro (both use dynamic getCollection counts). Blog listing has no issues. |
| Process page OTA accuracy fix | done · expedition 53 | Step 03 diagram: changed `OTA` to `push` (OTA is now CI-triggered). "03 · Shipped" workflow paragraph: updated to credit GitHub Actions for triggering OTA, not the loop agent. |
| Blog hero expedition count | done · expedition 53 | Added `{loggerCount} expedition logs` to the hero eyebrow alongside total post count — more prominent visibility of expedition log count. |
| LogPlayer.astro audit | done · expedition 53 | Reviewed — component is solid. Accessible (keyboard seek, aria-label toggle), CSS-drawn play/pause glyphs (no emoji), drives native `<audio>` via media API. No improvements needed. |
| RSS audio enclosure audit | done · expedition 53 | Reviewed rss.xml.ts — iTunes namespace included, enclosure uses statSync for accurate byte length, itunes:episode and itunes:author per item. Feed is podcast-app-ready. No improvements needed. |
| Logger era start date fix | done · expedition 54 | blog/index.astro and process.astro both said "2026-05-27" for the Logger rotation start; corrected to "2026-05-26" (matching expedition 1's pubDate and the persona-change entry in 04-dev-blog-persona.md). |
| Featured card body duplicate summary removed | done · expedition 54 | blog/index.astro featured section rendered summary twice (meta sidebar + body paragraph). Replaced body paragraph with context-aware note: Logger posts link to /blog/expedition-logs; non-Logger posts describe what a loop post is. |

## Discord collaboration workflow

When the website-improve loop needs input from Alex (a decision, an asset, content),
it posts to `#needs-input` with a clear question and context. Alex replies in Discord;
the next iteration reads the channel and acts on the reply.

**Channel**: `#needs-input` (ID: `1509774367498829935`)

To post a question:
```bash
set -a; . .env.claude.local; set +a
AUTH="Authorization: Bot $DISCORD_TOKEN"
UA="User-Agent: 531-loop (https://github.com/alexcheuk/proof-531, 1.0)"
curl -s -X POST -H "$AUTH" -H "$UA" -H "Content-Type: application/json" \
  "https://discord.com/api/v10/channels/1509774367498829935/messages" \
  -d "$(python3 -c \"import json,sys; print(json.dumps({'content': sys.argv[1], 'allowed_mentions': {'parse': []}}))\" \"$QUESTION\")"
```

To read replies:
```bash
curl -s -H "$AUTH" -H "$UA" \
  "https://discord.com/api/v10/channels/1509774367498829935/messages?limit=20"
```

## Research notes

### Expedition 45

**Biggest website gap is screenshots**: Every "show don't tell" conversion principle
points to screenshots as the #1 missing element. The homepage has a phone illustration
but no real UI screenshots. A visitor can't tell if the app looks good without seeing it.
This is also the #1 GitHub README gap identified in expedition 44.

**JSON-LD SoftwareApplication schema**: Adding `<script type="application/ld+json">`
to the homepage makes the app eligible for rich results in Google Search (the app
knowledge panel, star rating, price). It's also machine-readable for any crawlers
indexing it. Low effort, durable improvement.

**og:image is the second-most impactful gap**: Every social share (Reddit, Discord,
HN, Twitter/X) shows a blank preview without an og:image. A 1200×630 card with the
app name, logo, and one key stat ("free · local · 5/3/1 + BBB") would dramatically
improve click-through rates. This is blocked on having the image asset.
