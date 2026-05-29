---
name: website-improve-strategy
description: Strategy and progress tracker for the self-improving website loop. Covers SEO, content, UX, and technical improvements to 531strength.com. Run each auto-improve iteration.
---

# 531strength.com — Website Self-Improvement Strategy

**Created**: 2026-05-28 (Expedition 45)
**Last updated**: 2026-05-28 (Expedition 46)
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
- [ ] No og:image fallback (social shares show no preview image)
- [x] JSON-LD SoftwareApplication schema added (expedition 45)
- [ ] No sitemap.xml verified (check if Astro generates one)
- [ ] Blog posts lack og:image (every share looks like a blank card)

### Track B — Content accuracy

Keep the website copy accurate and honest:
- App feature list matches what's actually shipped
- Iteration count is always derived from blog post count (not hardcoded) — this is already done
- Platform availability (Android live, iOS in review) should update when iOS ships
- Process page stays accurate to how the loop actually works

Current gaps:
- [ ] iOS App Store URL — waiting on Apple approval (Alex needs to update when live)
- [ ] Screenshots section in README + homepage is a placeholder
- [ ] The "How it works" section references Expo Go (retired in expedition 28?)

### Track C — UX / conversion

Make visitors understand what this is and want to download it:
- Above-the-fold copy is clear: what the app does, for whom, why it's free
- CTAs are prominent and have real targets (not "coming soon")
- The dev blog is discoverable and the expedition-logs page is distinct
- Mobile navigation works (fixed in expedition 41 per task queue)

Current gaps:
- [ ] No app screenshots anywhere on the homepage (biggest conversion gap)
- [ ] Process page "44+" reference — now auto-derived from blog count
- [ ] Blog listing is long with no pagination (ok for now, revisit at 60+ posts)

### Track D — Technical health

Keep the codebase clean and fast:
- [x] index.astro CSS extracted to `src/styles/home.css` (expedition 46)
- [x] process.astro CSS extracted to `src/styles/process.css` (expedition 46)
- [x] robots.txt is correct — `Allow: /`, sitemap URL updated to `531.dev` (robots.txt was correct; astro.config.mjs domain was the bug, fixed expedition 46)
- [ ] Audit for any broken internal links
- [ ] Audit for any broken internal links

### Track E — Blog framework

The expedition-logs listing and the main /blog listing work well.
On-going: keep colophon accurate to the current fiction (Logger era).

## Progress tracker

| Item | Status | Notes |
|------|--------|-------|
| JSON-LD SoftwareApplication schema | done · expedition 45 | Added to index.astro. Covers name, category, OS, price, description, URL. |
| website-improve agent created | done · expedition 45 | See `.claude/skills/website-improve/SKILL.md` and this file. |
| Discord #needs-input collaboration | done · expedition 45 | Channel exists (1509774367498829935). Bot can post questions for Alex. |
| index.astro CSS extraction | done · expedition 46 | 2654-line scoped style block extracted to `src/styles/home.css`. Imported at frontmatter level. |
| process.astro CSS extraction | done · expedition 46 | 798-line scoped style block extracted to `src/styles/process.css`. |
| astro.config.mjs domain fix | done · expedition 46 | Was `531strength.com`, now `531.dev`. Affected sitemap URLs, og:url, canonicals. Also fixed RSS fallback. |
| Dead code removal (PlateBar.astro) | done · expedition 46 | 301-line unused illustration component removed (superseded by PhonePlateBar.astro). |
| /tools index page | done · 2026-05-28 | Lists both calculator tools. SEO: CollectionPage JSON-LD, descriptive meta. |
| /tools/plate-math page | done · 2026-05-28 | Interactive plate calculator. Unit toggle (lbs/kg), bar selector, stepper + direct input, text-art barbell diagram, SEO JSON-LD WebApplication. |
| /tools/goal-calendar page | done · 2026-05-28 | 5/3/1 goal projector. Per-lift TM progression, cycle table, summary stats. SEO JSON-LD WebApplication. |
| Footer /tools link | done · 2026-05-28 | Added "Tools" to Product column in Footer.astro. |
| og:image default | pending · needs asset | Need a 1200×630 social card PNG. Alex to provide or generate. |
| App Store URL update | blocked · waiting on Apple | Alex to update homepage CTA when iOS is live. |
| Screenshots on homepage | blocked · waiting on Alex | Need real device screenshots. Instructions in README Screenshots section. |

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
