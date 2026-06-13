---
tactic: 16 (new — Play Store ASO)
channel: Google Play Store listing
status: ready to paste (pending Alex review)
created: 2026-06-13 (Expedition 82 — Play Store approval)
package: com.alexcheuk.fivethreeone
listing_url: https://play.google.com/store/apps/details?id=com.alexcheuk.fivethreeone
---

# Google Play Store Listing Copy — 531 Strength

This is the listing-copy marketing asset the strategy never had (there was no listing
until 2026-06-13). It is meant to be pasted directly into the Play Console.

## Why this file matters (ASO mechanics, verified)

Google Play and Apple App Store index keywords differently, and this changes the copy:

- **Google indexes the full description (4,000 chars) for search keywords.** Apple does
  NOT — Apple uses a separate hidden 100-char keyword field. So on Play, the long
  description IS the keyword field. The terms a 5/3/1 lifter searches — "5/3/1",
  "Wendler", "Boring But Big", "BBB", "training max", "AMRAP", "plate calculator",
  "deload", "7th week protocol" — must appear naturally in the description prose.
- **App title (30 chars) is the single heaviest ranking signal.** A relevant keyword in
  the title outweighs the same keyword anywhere else. "531" alone wastes the slot.
- **Short description (80 chars) is the second heaviest signal** and the first thing a
  browsing user reads. It must carry one keyword and one differentiator.
- **Do not keyword-stuff.** Google's 2026 algorithm penalizes repetition and rewards
  natural density. Each key term appearing 2–4 times across the description is the
  target, not 10 times.
- **Ratings and install velocity in the first 30 days disproportionately shape ranking.**
  This is why the in-app review prompt (Tactic 12) is now the highest-leverage product
  change — see the strategy doc.

---

## Title (max 30 characters)

**Recommended:**
> `531 Strength: 5/3/1 + BBB`

(25 chars. Carries the brand, the program number, and "BBB" — the three highest-value
search terms — inside the 30-char cap.)

Alternatives if the above reads awkwardly in the Console preview:
- `531 Strength — 5/3/1 Tracker` (28 chars)
- `5/3/1 + BBB Tracker: 531` (24 chars — leads with the program if brand recognition is low)

Lead recommendation: the first one. Brand-first is correct because "531 Strength" is the
domain and the GitHub identity; consistency compounds.

---

## Short description (max 80 characters)

**Recommended:**
> `Clean 5/3/1 + Boring But Big tracker. Free, no account, works offline.`

(69 chars. One keyword cluster ["5/3/1 + Boring But Big"], three differentiators
[free / no account / offline].)

Alternatives:
- `The 5/3/1 + BBB logbook that does the plate math. Free. No account. Local.` (74)
- `Free 5/3/1 tracker with BBB, plate math, and a rest timer that survives lock.` (77)

---

## Full description (max 4,000 characters)

Paste verbatim. Keyword targets are woven in naturally: 5/3/1, Wendler, Boring But Big /
BBB, training max, AMRAP, plate calculator, rest timer, deload, 7th Week Protocol.

```
531 Strength is a clean, fast logbook for Jim Wendler's 5/3/1 program with the Boring But Big (BBB) assistance template. It does the percentage math, shows you the plates, times your rest, and gets out of the way. No account. No ads. No subscription. Your data never leaves your phone.

I'm a developer who runs 5/3/1, not a fitness company. I looked for an app that handled the 5/3/1 + BBB math and left everything else out — and couldn't find one I liked. So I built this. It's free because it was always just the tool I wanted for myself.

WHAT IT DOES
• 5/3/1 percentages computed from your training max — set your TMs once, every session is calculated for you
• Full Boring But Big block — 5×10 at your chosen BBB percentage, not a partial template that cuts off after the first cycle
• Visual plate calculator on every working set — see exactly what to load per side for your bar and your plates
• AMRAP set logging with estimated 1RM and automatic PR detection
• Rest timer that keeps running when you lock your phone or switch apps, with an alarm when it's done
• 7th Week Protocol (TM Test Week) — the real Wendler deload-week testing protocol, not just a lighter week
• Cycle progress grid — every session in the current cycle at a glance
• PR certificates you can save and share when you hit a new estimated 1RM
• Goal projection — set a target training max or 1RM and see how many cycles away you are
• Training max rollback — if a TM is too heavy, drop it back one tap and recalculate

WHAT IT DOESN'T DO
• No account or sign-in
• No cloud, no social feed, no streaks, no gamification
• No ads, no paywalls, no in-app purchases
• No analytics or telemetry — there is no tracking SDK in this app at all

PRIVACY
Everything is stored in a local SQLite database on your device. Nothing is uploaded. There is no server. If you uninstall the app, the data is gone — which is the honest trade for a tool that never phones home. Full units support: lbs and kg, with correct rounding increments per lift.

WHO IT'S FOR
Serious lifters running 5/3/1 + BBB who want a logbook, not a coach. If you already know your training maxes and just want something nice to log into at 6am without doing plate math in your head, this is for you.

HOW IT'S BUILT (the honest part)
531 Strength is built and maintained by a Claude AI coding agent running on a 30-minute loop. Every feature, fix, and polish pass ships from an automated agent pipeline. The full development process and a public dev blog are at 531strength.com. The app is open about what it is — agent-built, agent-iterated, and honest about it.

Not affiliated with Jim Wendler or Wendler LLC. 531 Strength is an independent tool made by a fan of the program.

Free forever. iOS coming soon.
```

(~2,350 chars — comfortably under the 4,000 cap, leaving room if Alex wants to add a
changelog teaser or a line about a specific feature.)

---

## "What's new" (release notes, max 500 chars) — for v1.0 launch

```
First public release on the Play Store. 531 Strength is a free 5/3/1 + Boring But Big tracker: percentage math, a visual plate calculator, a background-safe rest timer, AMRAP/PR tracking, and the 7th Week TM test protocol. Local-only, no account, no ads. Built by a Claude coding agent on a 30-minute loop — dev blog at 531strength.com.
```

---

## Graphics checklist (Play Console requires these — note for Alex)

These are asset requirements, not copy. Flagging so the listing isn't blocked on them:

- **App icon** — 512×512 PNG (almost certainly already supplied at submission)
- **Feature graphic** — 1024×500 PNG/JPG. REQUIRED. This is the banner at the top of the
  listing. Suggested: the e-ink wordmark "531." + tagline "5/3/1 + BBB. Local-only. Free."
  on the paper background, matching the site aesthetic. The home page hero phone mock is
  the right visual language to reuse.
- **Phone screenshots** — 2 to 8, min 320px, 16:9 or 9:16. Use the same three that anchor
  the Reddit post: `docs/screenshots/screenshot-6.png` (Today), `screenshot-7.png` (live
  AMRAP + plate viz), `screenshot-8.png` (session receipt + PR cert). Add 1–2 more
  (cycle progress grid, settings/privacy) to fill to 4–5 — Play listings convert better
  with 4+ screenshots.
- **Screenshot captions** are baked into the image on Play (no separate caption field),
  so if the current screenshots are bare device captures, consider a one-line overlay per
  shot: "Plate math, done for you" / "AMRAP + instant PR" / "The receipt at the end."

## Category / tags

- **Category:** Health & Fitness
- **Tags:** Play lets you pick up to 5 tags from a fixed list — choose the closest:
  Workout / Fitness / Weight training (whatever the current list offers under H&F).

## Data safety form (required, and a marketing asset in itself)

The Data Safety section is a genuine differentiator for this app — fill it as:
"No data collected. No data shared." This produces a "No data collected" badge on the
listing, which is rare and aligns perfectly with the local-first story. Make sure whoever
completes the Console form does NOT over-declare — the app has zero telemetry, so every
toggle should be off. This badge is worth more than any copy line.

---

## Status / blockers

- Copy above is ready to paste. No human storytelling blank to fill (unlike the
  r/531Discussion post) — this is product-descriptive, not personal-history.
- Alex needs to: (1) confirm the title choice, (2) supply/confirm the feature graphic,
  (3) complete the Data Safety form as "no data collected", (4) confirm the live listing
  URL matches `https://play.google.com/store/apps/details?id=com.alexcheuk.fivethreeone`
  (the package id from app.json — verify it wasn't changed at submission).
