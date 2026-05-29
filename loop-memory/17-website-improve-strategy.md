---
name: website-improve-strategy
description: Strategy and progress tracker for the self-improving website loop. Covers SEO, content, UX, and technical improvements to 531strength.com. Run each auto-improve iteration.
---

# 531strength.com — Website Self-Improvement Strategy

**Created**: 2026-05-28 (Expedition 45)
**Last updated**: 2026-05-29 (Expedition 63)
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
- [x] Tool page SEO improved (expedition 55) — titles, h1, and descriptions for /tools, /tools/plate-math, /tools/goal-calendar now include "5/3/1" keywords; JSON-LD descriptions synced to match meta descriptions
- [x] WebSite JSON-LD schema added to homepage (expedition 59) — `@type: WebSite` with `potentialAction: SearchAction` for Google Sitelinks Searchbox; added as a second `<script type="application/ld+json">` block alongside the existing SoftwareApplication schema
- [x] SearchAction `?q=` target honoured by real search (expedition 62) — `/blog` now has a client-side title+summary search input that reads `?q=` on load, so the JSON-LD SearchAction target is functional rather than a dead link

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
- [x] Process page Logger era dates corrected (expedition 60) — KPI note "Scribes" and expedition-note section both said "from 2026-05-27"; corrected to "2026-05-26" (matching the first expedition's pubDate). Expedition 54 claimed to fix these but did not — they persisted.

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
- [x] /dev-log route label corrected to /blog (expedition 56) — "how-built" card in index.astro showed `/dev-log` as the display route but linked to `/blog`; corrected to match the real URL
- [x] Blog listing title and description improved (expedition 59) — title was "Dev log — 531"; now "Dev Log — 531 Strength" (includes app name for SEO); description now mentions 5/3/1 and specifies "one post per iteration"
- [x] expedition-logs page path fixed (expedition 59) — eyebrow showed `/dev-log/expedition-logs` (wrong); corrected to `/blog/expedition-logs` (the real URL)
- [x] Blog listing hero eyebrow `/dev-log` corrected to `/blog` (expedition 60) — the `<span class="seg">` eyebrow in `blog/index.astro` still showed `/dev-log`; the expedition 56 fix only corrected the homepage card, not the blog page's own eyebrow.
- [x] Blog listing show-more added (expedition 61) — 120 posts now; first 20 visible by default, "Show all N more posts" button reveals the rest via progressive-enhancement JS. Without JS, all posts visible.
- [x] Homepage hero platform-note updated with React Native trust signal (expedition 62) — the small note below CTAs now includes "iOS + Android · one React Native codebase" to set expectations and reinforce the single-codebase story alongside the existing KPI strip entry.
- [x] Blog listing search implemented (expedition 62) — search input added above the post list; filters by title+summary client-side, reads `?q=` from URL on load (fulfilling the SearchAction JSON-LD target from expedition 59). Active query unfolds all posts; clearing restores the fold. Match count shown in amber when filtering.
- [x] Blog search placeholder + description corrected (expedition 63) — placeholder said "Filter by title…" but search includes summary; corrected to "Filter by title or summary…". Section-head description updated to "filters by title and summary".
- [x] Homepage platform-note tightened (expedition 63) — simplified to "iOS + Android · one React Native codebase · Android live · iOS in review"; removes redundant "Android APK · direct download" (already in CTA) and verbose submissions phrasing.

### Track D — Technical health

Keep the codebase clean and fast:
- [x] index.astro CSS extracted to `src/styles/home.css` (expedition 46)
- [x] process.astro CSS extracted to `src/styles/process.css` (expedition 46)
- [x] robots.txt is correct — `Allow: /`, sitemap URL points to `531strength.com` (robots.txt was correct; astro.config.mjs domain was the bug — was a `531.dev` placeholder, fixed to `531strength.com` in expedition 46)
- [x] Internal links audited (expedition 50) — all footer/nav anchor hrefs (/#program, /#plate, /#screens, /#get) match live IDs in index.astro; /tools, /blog, /process, /privacy, /support, /rss.xml all resolve; no broken links found
- [x] plate-math.astro plate list styles fixed (expedition 56) — `.pl-row`, `.pl-just-bar`, `.pl-weight`, `.pl-unit`, `.pl-count` were in the scoped `<style>` block but injected via `innerHTML` so Astro's hash-scoping couldn't reach them; moved to `<style is:global>` to match the same pattern used in goal-calendar.astro

### Track E — Blog framework

The expedition-logs listing and the main /blog listing work well.
On-going: keep colophon accurate to the current fiction (Logger era).

- [x] expedition-logs.astro colophon verified (expedition 56) — reviewed against 14-lore.md and 04-dev-blog-persona.md; text is accurate: "The Loggers do not know about this page; they write for their successors" matches the lore rule ("They do not know about the blog"); no changes needed.

## Progress tracker

### Expedition 63 notes

Two UX polish fixes:

1. **Blog search placeholder and description corrected** (Track C): The search placeholder said "Filter by title…" but the `data-search-text` attribute includes both title and summary — making the placeholder a lie. Corrected to "Filter by title or summary…". Also updated the section-head description ("the search box filters by title" → "filters by title and summary"). No logic change — just copy accuracy.

2. **Homepage platform-note tightened** (Track C): The note below the hero CTAs was "Android APK · direct download · iOS + Android · one React Native codebase · Play Store and App Store submissions in progress" — verbose and partly redundant with the CTA buttons. The "Android APK · direct download" phrase repeated the button label; "Play Store and App Store submissions in progress" repeated the iOS button state. Simplified to "iOS + Android · one React Native codebase · Android live · iOS in review" — the one piece of signal that wasn't in the buttons (single-codebase fact) now leads.

Verification pass: process page KPIs are dynamic, expedition-logs colophon is still accurate, tools pages have no drift. README iteration count updated from "62+" to "63+".

### Expedition 62 notes

Three improvements across Track A (SEO), Track C (UX/conversion), and a verification pass:

1. **Blog listing search implemented** (Track A + Track C): The WebSite JSON-LD `SearchAction` added in expedition 59 targeted `https://531strength.com/blog?q={search_term_string}` but `/blog` had no search implementation — a visitor sent there by Google's Sitelinks Searchbox would see an unfiltered list. Added a client-side search input above the post list that filters by title + summary on keystroke. On page load, `?q=` is read from the URL and applied automatically, so the SearchAction target is now functional. Active query unfolds all folded posts. Match count shown in amber. Without JS, the search box is a plain non-functional input (not harmful — same progressive-enhancement pattern as the show-more fold).

2. **Homepage hero platform-note updated** (Track C): The `platform-note` div below the CTAs said "Android APK · direct download · Play Store and App Store submissions in progress". Updated to include "iOS + Android · one React Native codebase" — reinforces that both platforms are served from a single codebase, setting expectations for the iOS-soon state and adding a trust signal. (The KPI strip already has this, but visitors who leave before scrolling won't see the strip.)

3. **Screenshot paths verified** (Track B): All four screenshots referenced in the homepage screens rail (`/screenshot-1.png`, `/screenshot-2.png`, `/screenshot-3.png`, `/screenshot-5.png`) exist in `apps/web/public/`. A fifth file (`/screenshot-4.png`) also exists but is not currently referenced — not a gap, just unused. No broken image paths.

### Expedition 61 notes

Three improvements across Track C (UX), Track A (SEO), and Track D (technical health):

1. **Blog listing show-more button added** (Track C): With 120 posts, the `/blog` listing was a very long single page. Added progressive-enhancement JS: first 20 posts visible by default; a "Show all N more posts" button reveals the rest. Without JS, all posts remain visible. The `ScopeFilter` navigation already handles scope-based filtering; this addresses the raw count. CSS class `log-row--fold` marks folded rows; `log-list--js-ready` class is added by the script, so the fold only activates with JS.

2. **Blog tag page (`/blog/tag/[scope]`) fixes** (Track A + Track C):
   - Eyebrow breadcrumb corrected from `/dev-log/{scope}` to `/blog/tag/{scope}` — the old path 404s and was the same bug pattern fixed on the main listing (exp 56) and blog listing (exp 60).
   - Page title updated from `Dev log — ${label} — 531` to `${label} — Dev Log — 531 Strength` — consistent with the main blog listing title format, and includes the full app name for SEO.
   - Meta description improved to lead with `531 Strength dev log — ${label} posts` — previous description had no mention of the app name.

3. **`#needs-input` checked** — no new replies from Alex. iOS still pending. Outstanding blockers unchanged (App Store URL, Alex's personal 5/3/1 history for r/531Discussion post).

### Expedition 60 notes

Three content-accuracy and UX fixes:

1. **Blog listing eyebrow corrected from `/dev-log` to `/blog`** (Track C): The `<span class="seg">` eyebrow in `blog/index.astro` still displayed `/dev-log` — a path that doesn't exist. The expedition 56 fix only corrected the homepage "how-built" card; the blog page's own eyebrow was missed. Corrected to `/blog`.

2. **Process page Logger era KPI date fixed** (Track B): The "Scribes" KPI note in `process.astro` said "from 2026-05-27"; corrected to "2026-05-26". Expedition 54 claimed to fix this but it persisted.

3. **Process page expedition-note Logger era date fixed** (Track B): The `expedition-note` section heading also said "The Logger era · 2026-05-27 → ongoing"; corrected to "2026-05-26 → ongoing". Same root cause as item 2 — the expedition 54 fix was incomplete.

Track E (colophon) verified: expedition-logs.astro colophon remains accurate to current lore — "They do not know about the blog" is correctly reflected as "The Loggers do not know about this page; they write for their successors." No changes needed.

### Expedition 59 notes

Three website changes, all cosmetic/SEO (no visual changes to any page layout):

1. **WebSite JSON-LD schema added** (Track A): Added `@type: WebSite` with `potentialAction: SearchAction` to homepage. This is what Google needs to show the Sitelinks Searchbox under the home result. Added as a second `<script type="application/ld+json">` block; the existing `SoftwareApplication` schema is unchanged.

2. **Blog listing title and description improved** (Track A/C): Title changed from "Dev log — 531" to "Dev Log — 531 Strength". Description now says "...one post per iteration" instead of the generic text. Both changes improve SEO discoverability.

3. **Expedition-logs page path corrected** (Track C): The eyebrow breadcrumb in `expedition-logs.astro` showed `/dev-log/expedition-logs` — a path that 404s. Corrected to `/blog/expedition-logs`, the actual URL.

### Expedition 56 notes

Three changes shipped:

1. **README iteration count updated** (Track B): Changed "53+ iterations have run" to "55+ iterations have run" in `/repos/1/README.md`.

2. **plate-math.astro plate list styles fixed** (Track D): The classes `.pl-row`, `.pl-just-bar`, `.pl-weight`, `.pl-unit`, `.pl-count` were declared in the scoped `<style>` block but these elements are injected via `innerHTML` in the script's `render()` function. Astro's scoped styles add a `data-astro-*` attribute selector — JS-injected elements don't carry that attribute, so the styles silently had no effect. Moved these classes to a new `<style is:global>` block and removed the duplicate definitions from the scoped block. This matches the established pattern in `goal-calendar.astro`.

3. **Homepage `/dev-log` route label corrected to `/blog`** (Track C): The "how-built" card in `index.astro` showed `/dev-log` as the display route label but the `href` was `/blog`. The path `/dev-log` doesn't exist. A visitor who typed it would 404. Corrected the display label to `/blog` to match the real URL.

4. **expedition-logs.astro colophon verified** (Track E): Cross-checked against `14-lore.md` and `04-dev-blog-persona.md`. Colophon text is accurate to the Logger era fiction — no changes needed.

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
| README iteration count update | done · expedition 56 | Changed "53+" to "55+" in README.md "How it's built" section. |
| plate-math.astro global styles for injected plate list | done · expedition 56 | .pl-row and child classes were in scoped <style> but applied via innerHTML — Astro hash-scoping can't reach them. Moved to <style is:global>, removed duplicates from scoped block. Plate list breakdown now styled correctly. |
| Homepage /blog route label fix | done · expedition 56 | "how-built" card showed `/dev-log` as route label but href was `/blog`. The path /dev-log doesn't exist. Label corrected to `/blog`. |
| expedition-logs.astro colophon audit | done · expedition 56 | Verified against lore and persona docs — colophon is accurate to Logger era fiction. No changes needed. |
| Blog listing eyebrow /dev-log → /blog | done · expedition 60 | blog/index.astro hero eyebrow <span class="seg"> still showed /dev-log; corrected to /blog. The expedition 56 fix only hit the homepage card. |
| Process page Logger era dates (KPI + expedition-note) | done · expedition 60 | Two occurrences of "2026-05-27" in process.astro corrected to "2026-05-26". Expedition 54 claimed to fix but they persisted. |
| expedition-logs.astro colophon re-verified | done · expedition 60 | Re-checked against 14-lore.md for Logger era accuracy. Text is correct — no changes needed. |
| Blog listing show-more | done · expedition 61 | 120 posts; first 20 visible, "Show all N more posts" button via progressive-enhancement JS. |
| Blog tag page eyebrow fix (/dev-log/{scope} → /blog/tag/{scope}) | done · expedition 61 | Same bug pattern as blog/index.astro (exp 56-60). Eyebrow corrected on /blog/tag/[scope].astro. |
| Blog tag page title/description SEO | done · expedition 61 | Title: `Dev log — {label} — 531` → `{label} — Dev Log — 531 Strength`. Description now leads with "531 Strength dev log". |
| Blog listing search (?q= support) | done · expedition 62 | Client-side title+summary filter; reads ?q= on load to fulfil SearchAction JSON-LD target. Integrates with existing show-more fold. |
| Homepage platform-note React Native signal | done · expedition 62 | Note below CTAs now includes "iOS + Android · one React Native codebase". |
| Screenshot paths audit | done · expedition 62 | All 4 referenced screenshots exist. screenshot-4.png exists but unused — not a gap. |
| Blog search placeholder accuracy | done · expedition 63 | Placeholder "Filter by title…" → "Filter by title or summary…". Section-head description updated to match. |
| Homepage platform-note tighten | done · expedition 63 | Simplified to "iOS + Android · one React Native codebase · Android live · iOS in review". |
| README iteration count | done · expedition 63 | Updated "62+" → "63+". |

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
