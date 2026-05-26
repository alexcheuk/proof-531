# Decision log

> Append-only log of notable decisions made in this repo. Drives the dev blog.

## What goes here

A "notable decision" is anything a future reader — or [[dev-blog-persona|Margin]], when writing the dev blog — would care about. Roughly:

- New skill / agent / harness created, removed, or meaningfully reshaped
- Architectural call: new layer, boundary change, file-layout convention, primitive extraction
- Process or workflow change (commit prefix, branch strategy, CI gate, pre-commit hook)
- Removal of a system or a notable refactor
- Bug post-mortem worth remembering (root cause + the fix that stuck)
- A deliberate **non-change**: a path considered and rejected, with the reason. These are often the most interesting entries.

Skip:

- Routine bug fixes, style tweaks, single-line edits
- Anything obvious from the diff or commit message alone
- "We added a test" — unless the test discipline itself changed

## Format

Append new entries at the **top** under `## Entries` (most recent first). Each entry:

```markdown
### YYYY-MM-DD — <short headline, ≤ 80 chars>

**Tags:** `area`, `area` (1–4 short tags — `skill`, `harness`, `convention`, `removal`, `process`, `architecture`, etc.)
**Files:** `path/one`, `path/two` (the canonical paths the decision touched; omit if none)

What we decided, in 1–3 sentences. Lead with the decision itself, not the lead-up.

**Why:** the motivation. A constraint, a stakeholder ask, a recurring pain, a thing that broke. Without this, the entry is noise.

**Trade-off / what we didn't do:** the alternative considered and why it lost. Skip if there was no real fork.

**Follow-ups:** named, concrete next actions if any. Skip if none.
```

Keep entries short. The decision log is a feeder for the dev blog; depth lives in the blog post.

## Entries

### 2026-05-26 — CONTRIBUTING.md catches up to the Expo Go reality

**Tags:** `docs`, `process`
**Files:** `docs/CONTRIBUTING.md`

Three drifts in the contributor onboarding doc:

- **Prereqs** listed `Xcode 26+` for iOS native builds. Not required under Expo Go (no custom dev client). Replaced with "Expo Go latest from App Store / Play Store".
- **Daily commands** described `pnpm --filter @fivethreeone/mobile start` as "boot Dev Client (Metro)". It boots Metro for Expo Go. Fixed.
- **Test discipline** said "pixel fidelity is checked via Storybook + Maestro screenshots, not jest". Neither is wired today — they're deferred along with the dev-client itself. Fixed to point at the actual review path (manual PWA-vs-RN screenshot pairs on each PR).
- **Pre-commit and PR review** claimed "Coverage gates are enforced; the reviewer subagent rejects diffs that drop coverage in `src/domain/`". The verifier supports per-task `coverage on X >= N` rules but there is no global gate; rewrote to describe what's actually enforced.

Also tightened the `pnpm verify` description to match the actual script (`ci && bundle-check && build:web`).

**Why:** CONTRIBUTING.md is the second file a new contributor opens (after the README). Telling them they need Xcode 26 when they don't, or that there's a coverage gate that doesn't exist, makes the bar look more intimidating than it is.

**Home-page note (loop-047):** category 8 was not touched this loop. The home page is in steady state — the audit checklist is mostly green and recent loops shipped favicon (loop-040), home-page RSS link (loop-044), and the Base.astro skip-link (loop-046). Forcing a home-page change this loop would be manufacturing surface. Per the pacing memory's "honest looked-found-nothing beats fake feature inflation" line, this is the right call.

### 2026-05-26 — DESIGN.md status banner + Base.astro skip-to-content link

**Tags:** `docs`, `website`, `accessibility`
**Files:** `docs/DESIGN.md`, `apps/web/src/layouts/Base.astro`

Two unrelated polish wins:

- **DESIGN.md** is the original product spec, written when the visual language was "dark canvas / hot-orange accent / Space Grotesk + JetBrains Mono". The actual app pivoted to "paper / e-ink / amber-dot / IBM Plex" in Phase A, and large sections of DESIGN.md (color, typography, shape, IA, screens) describe a UI that never shipped. A full rewrite is bigger than a steady-state loop wants — the file is also valuable as historical context for the pivot. Added a clear status banner at the top: sections 1–2 still describe what shipped; sections 3+ are historical, trust the running app for current design language, and point readers at `src/design/tokens.ts` + CLAUDE.md as the authoritative sources.
- **Base.astro** had no skip-to-content link. Keyboard users tabbing through the marketing site had to tab through the entire top nav before reaching the page body. Added the standard pattern: a visually-hidden anchor at the top of `<body>` that becomes visible on focus and jumps to `#main-content`. Mainstream WCAG win; ~30 lines of CSS+markup.

**Why:** DESIGN.md is one of the top hits when an agent or a contributor reads the project's docs end-to-end; catching them up on the pivot avoids the "wait, why isn't the app orange?" confusion. The skip-link is a small but real accessibility gap on the marketing site.

### 2026-05-26 — ARCHITECTURE.md + INTENT.md catch up to reality

**Tags:** `docs`, `stale-content`
**Files:** `docs/ARCHITECTURE.md`, `docs/INTENT.md`

Both top-level docs had drifted significantly from what got built:

- **INTENT.md** named Margin as the dev-blog persona in four places. Margin was let go on 2026-05-26 and Verso took over. Replaced with "Verso (Margin held the seat through 2026-05-26)" where appropriate; replaced the "Margin says so out loud" generic line with "The scribe says so out loud".
- **ARCHITECTURE.md** described the original-spec stack: Expo Dev Client (we use Expo Go), Zustand for UI state (removed loop-043), Skia + Storybook + Maestro + Reassure (all deferred for the Expo Go workflow), expo-blur (removed loop-043), Space Grotesk + JetBrains Mono fonts (we ship IBM Plex), Sentry + PostHog as "wired from day one" (both deferred). The layout tree referenced screens and folders that never got built (`library.tsx`, `ui-state/`, `program/`, `.storybook/`, `.maestro/`). Rewrote the stack table, build/release section, observability section, CI section, "how work happens" section, and the layout tree to match what's actually on disk. Added a status note at the top pointing readers at CLAUDE.md as the canonical short list.

**Why:** anyone arriving at the project — human or fresh-context agent — was being told a different stack than the one running. The intent doc has the same problem in miniature: Verso reads it every loop, and seeing its predecessor's name there muddied the framing.

**Trade-off / what we didn't do:** DESIGN.md still references Space Grotesk + JetBrains Mono extensively; that's a larger rewrite (typography is the spine of the design language section) and was punted to a follow-up. The architectural+intent surfaces felt higher-leverage for this loop.

### 2026-05-26 — Home page dev-log section surfaces RSS

**Tags:** `website`, `home-page`, `rss`
**Files:** `apps/web/src/pages/index.astro`

Added a "Subscribe via RSS" link next to the existing "All entries →" CTA at the bottom of the home page's dev-log teaser section. Visitors who scroll to the dev log are the natural audience for a follow-along subscription option, and until the app has a store listing, "follow the dev blog" is the most honest way to invite someone to stick around. The footer already linked /rss.xml, but the footer is a small monochrome rail — the home page CTA puts it where a curious reader actually looks.

**Why:** category 8 "objections, audience-fit, CTAs" facet calls out "follow until launch / RSS signal is fine if it doesn't oversell". This is exactly that.

### 2026-05-26 — Drop unused mobile deps: zustand + expo-blur

**Tags:** `removal`, `mobile`, `stack`
**Files:** `apps/mobile/package.json`, `pnpm-lock.yaml`, `CLAUDE.md`

Two third-party mobile deps were sitting in the install graph with zero consumers:

- `zustand` — listed since the original bootstrap; CLAUDE.md noted "only when earned". It never was — every piece of state we needed got handled by React state, TanStack Query, or a small module-level subject (the half-dozen `useSyncExternalStore` cases for status-bar tint, session runtime, session-completed signal).
- `expo-blur` — added speculatively for sheet backdrops in the original spec; `@gorhom/bottom-sheet` provides its own backdrop and nothing in the codebase ever imports `expo-blur`.

Removed both from `apps/mobile/package.json`, regenerated the lockfile, updated the CLAUDE.md stack list. Full verify gauntlet (typecheck + lint + tests + boundary check + Metro bundle export) stays green.

**Why:** every dep is a maintenance tax — surface for security updates, breakage on RN/Expo upgrades, install-graph weight. Removing the ones that aren't carrying load is the simplest form of "leave the repo greener than you found it".

### 2026-05-26 — authorForPost helper; RSS gets author + categories

**Tags:** `website`, `rss`, `refactor`
**Files:** `apps/web/src/lib/posts.ts`, `apps/web/src/pages/blog/[...slug].astro`, `apps/web/src/pages/rss.xml.ts`

Hoisted the loop-041 Margin-allowlist into `lib/posts.ts` as `authorForPost(entry)`. The blog post page now imports the helper instead of inlining the set. The RSS feed picked up the helper too, plus the per-item categories from the post's tags. So an RSS subscriber now sees the persona attribution and the tag set the search engine sees on the page.

**Why:** loop-041's fix landed the right logic in one place; this loop puts it in the *right* place (shared lib) so RSS subscribers and any future surface that needs the byline reads from the same source of truth. Categories on RSS items is a small completeness win — feed readers that group by category now work.

### 2026-05-26 — JSON-LD author tag: explicit Margin set, not alphabetical compare

**Tags:** `bug-postmortem`, `website`, `persona`
**Files:** `apps/web/src/pages/blog/[...slug].astro`

The blog post template's JSON-LD structured data was choosing between "Margin (Claude agent)" and "Verso (Claude agent)" using `post.id >= '2026-05-26-verso-day-one'`. Because the Margin→Verso handoff happened *within* a single date prefix (2026-05-26), and many Verso posts have slugs that sort alphabetically before "verso-day-one" (`tap-per-rep`, `numbers-that-check-out`, `process-page-meets-verso`, etc.), 13 of 15 Verso posts were being attributed to Margin in the structured data.

Switched to an explicit `MARGIN_POSTS` set of 28 known Margin slugs (17 unsigned pre-naming posts from 2026-05-19 through 2026-05-25, plus 11 "— Margin"-signed posts from 2026-05-26). Anything else is Verso.

**Why:** structured data isn't visible on the page, but it feeds search-index author attribution. Crawlers were going to start ingesting Verso's posts as Margin's, which would (a) misattribute work and (b) leave a paper trail with the wrong byline for any future scribe handoff.

**Trade-off / what we didn't do:** could have parsed the post body for a `^— Margin` / `^— Verso` sign-off, but the older Margin posts predate the naming convention and have no sign-off at all. An explicit allowlist is uglier but bulletproof — and a future scribe handoff would just need to freeze the previous scribe's set the same way.

### 2026-05-26 — Favicon: inline SVG with the brand mark

**Tags:** `website`, `production-readiness`
**Files:** `apps/web/public/favicon.svg`, `apps/web/src/layouts/Base.astro`, `loop-memory/02-pending-assets.md`

The site had no favicon — browsers were rendering the default globe icon in the tab. Shipped a single inline SVG: paper background, "531" sans-serif wordmark, the amber brand dot. The SVG ships at every viewport and avoids the font-loading problem at favicon scale (no webfont — falls through to Helvetica/Arial). PNG fallbacks for older browsers and some social-preview tools are still owed; logged to pending-assets so future loops know not to re-attempt without proper image tooling.

**Why:** the tab favicon is the smallest brand surface a visitor sees, and every Astro build was shipping without it. Category 8 "page craft & polish" facet — favicon is in the explicit list.

### 2026-05-26 — README + home-page small consistency pass

**Tags:** `docs`, `home-page`
**Files:** `README.md`, `apps/web/src/pages/index.astro`

Two consistency fixes in the docs surface:

- The root README told new contributors "A dev client build is required" — but the project explicitly uses the Expo Go workflow (CLAUDE.md mandates this). Also dropped the stale `Xcode 26+ for iOS native builds` prereq (not needed for Expo Go) and the "Most code is written via `/initial-implement`" framing (most code is now written via `/auto-improve`). The "How work happens" section now lists three orchestrators with each one's purpose: `/auto-improve` (the standing loop), `rn-expo-pipeline` (idea-driven), and `/initial-implement` (queue-driven).
- The home page's cycle-section lead said `training maxes bump (+5 upper, +10 lower)` — implicitly lb-only. Added the kg numbers (`+2.5 / +5 kg`) so kg-default lifters see themselves in the copy.

**Why:** README contradicting CLAUDE.md actively misleads any first contributor (or any agent reading fresh). The kg-or-lb omission was a small outside-reader violation in the opposite direction — assuming the visitor is American.

### 2026-05-26 — /process page caught up: Verso (not Margin) + outside-reader pass

**Tags:** `website`, `process-page`, `persona`
**Files:** `apps/web/src/pages/process.astro`

The /process page still named the dev-blog persona as Margin — Margin was let go on 2026-05-26 and Verso took over. Updated step 04 to name Verso, with a one-line nod to the previous tenant. Also did an outside-reader pass on the same page: stripped the most aggressive code-tag usage (`loop-memory/`, `src/design/`, `pnpm test`, `docs/INTENT.md`, `apps/web/src/content/blog/`, `@gorhom/bottom-sheet`, `@testing-library/react-native`, `fast-check`, `expo export`, `.claude/skills/`, `/auto-improve`, `rn-designer/rn-frontend/rn-qa`) and paraphrased the explanations so a curious-but-not-checked-in reader can follow.

Also fixed step 02 — it claimed "seven baseline categories", but the loop has had eight since the home-page-focus category was added in 2026-05-26. And updated the pacing line to mention steady-state mode (2–4 honest items when the queue is empty).

**Why:** the page is the secondary marketing surface — the visitor who clicks "How it's built →" from the home page lands here. Naming a persona who no longer exists undermines the "agent-built, honest about it" framing, and the page-wide file-path code-tag dump was clearly written for a teammate, not a visitor.

**Trade-off / what we didn't do:** kept the named tech stack mentions (Expo, React Native, Drizzle, Astro, Vite, Biome, Jest) — those are honest framework descriptions that a technically-curious visitor recognizes and they sell the "real software, not a toy" story. The line between honest credibility flex and outside-reader violation is fuzzy; the rule of thumb applied here is "names of frameworks and libraries OK, file paths and CLI commands not".

### 2026-05-26 — Home-page audit pass 4: SessionTape AMRAP UX + numbers; MastheadStrip clean

**Tags:** `website`, `home-page`
**Files:** `apps/web/src/components/illustrations/SessionTape.astro`, `loop-memory/10-home-page-illustration-audit.md`

Continued the running illustration audit. The biggest drift was Frame 04 of the session-tape: a tally of rep boxes labelled "TAP PER REP" suggested a tap-per-rep interaction model that doesn't exist — the real AMRAP log sheet uses a NumberStepper. Replaced the boxes with a centered stepper (− N +) and a projection chip below ("EST. 1RM 414 LB · ↑ +29 · PR"), matching what the user actually sees. Several smaller drifts patched in the same illustration: Frame 02 had `SET 02 · DEADLIFT` (leading zero again) + a fictional `DID IT →` pill — now `ON THE BAR · 85% TM` + `SET COMPLETE ✓`; Frame 03 said `UP NEXT` where the real rest preview says `NEXT SET`; Frame 05's PR numbers were stuck at the pre-loop-034 412 / +27 — bumped to 414 / +29 for narrative consistency.

Also audited `MastheadStrip.astro` — turns out it's a vocabulary palate cleanser, not a port of the mobile Masthead. Every token matches actual program terminology; per-week percentages match the schemes table. No drift.

The audit checklist now has only the spacing/proportions pixel-pass against live screenshots left for Frames C and D of the HeroPhone — that's harder from this seat without a running mobile build to screenshot.

**Why:** same drift-check loop. The home page promises an aesthetic and a behavior — both have to be true.

### 2026-05-26 — Home-page audit pass 3: PlateBar label + Press vs OHP

**Tags:** `website`, `home-page`
**Files:** `apps/web/src/pages/index.astro`, `apps/web/src/components/illustrations/WeekLedger.astro`, `loop-memory/10-home-page-illustration-audit.md`

Continued the running illustration audit. Two more drifts patched:

- The plate-loader section's PlateBar carried `label="WORKING · SET 03 · AMRAP"`. That label doesn't exist anywhere in the mobile app — the actual eyebrow on the matching SetPhase surface is `ON THE BAR · 95% TM`, and the leading-zero `SET 03` violated the no-leading-zero convention from Discord 1508668998. Swapped to the real eyebrow.
- WeekLedger named the fourth lift `OHP`. The mobile app calls it `Press` everywhere (label, type, settings). Aligned.

Verified WeekLedger's per-week rep schemes (`5/5/5+`, `3/3/3+`, `5/3/1+`, deload `5/5/5`) against `domain/schemes.ts` — all correct.

**Why:** Same drift-check loop as before. The criteria-category-8 slot keeps chipping at the home-page audit until the running checklist memory file is green.

### 2026-05-26 — Close-the-day routes to Progress with a one-time animation

**Tags:** `feature`, `session`, `progress`, `navigation`
**Files:** `apps/mobile/src/features/session/SessionCompleteScreen.tsx`, `apps/mobile/src/features/session/sessionCompletedSignal.ts`, `apps/mobile/src/features/progress/components/ProgressLiftPage.tsx`, `apps/mobile/src/features/progress/components/ProgressLiftRow.tsx`

The "Close the day" CTA on the session-complete receipt now routes to the Progress tab for the just-completed lift (was routing home). A new module-level subject `sessionCompletedSignal` carries the `{ lift, sessionId }` hand-off across the cross-tab navigation; `ProgressLiftPage` consumes it on mount and passes a one-shot `playLastDoneAnimation` flag to the row. The row plays a fill-in animation on the `last-done` cell (opacity 0 → 1 + scale 0.85 → 1 over ~480 ms) and a delayed pulse on the `now` cell (scale 1 → 1.12 → 1, peak right as the fill-in settles).

**Why:** Discord 1508779267 — closing the day should land somewhere that *shows* the user what they just did (the cycle matrix with the new cell filled in and the next day highlighted), not the home screen which has no signal of the just-completed work. The animation makes the transition feel like a continuation of the receipt, not a context switch.

**Trade-off / what we didn't do:** considered passing the hand-off via URL params (`?justCompleted=1`), but URL params persist across back-navigations and would replay the animation on every return to Progress. The module subject is consumed on mount, so the animation is genuinely one-shot.

### 2026-05-26 — PR celebration animation is tap-to-skip

**Tags:** `feature`, `session`, `ux`
**Files:** `apps/mobile/src/features/session/components/PrCelebration/usePrCelebrationSequence.ts`, `apps/mobile/src/features/session/PrCelebrationScreen.tsx`

Tapping anywhere on the PR celebration surface now fast-forwards to the next *animated* phase, skipping intermediate holds/settles. Added `skip()` to the sequence hook; wrapped the surface in a Pressable. The CTA gets `pointerEvents="none"` until the sequence reaches `final`, so taps during the intro don't accidentally land on the hidden Continue button.

**Why:** Discord 1508779690 — every PR celebration is the same animation; on the third PR of the week, the user has seen it. They want to acknowledge and move on without watching all four phases.

### 2026-05-26 — Hard reset clears all seven persisted tables

**Tags:** `bug-postmortem`, `data`, `reset`
**Files:** `apps/mobile/src/data/accessors/reset.ts`, `apps/mobile/src/data/accessors/__tests__/reset.test.ts`

`resetEverything()` was deleting from `prs`, `set_logs`, `sessions`, `training_maxes`, and `settings` but not from `lift_progress` (added loop-024 — per-lift cycle/week) or `lift_goals`. After a hard reset, the next onboarded user landed on whatever cycle/week the prior install had advanced squat to. Added both tables to the delete chain and a test that completes a few cycles, resets, and asserts the next read of squat's progress is back to C1/W1.

**Why:** Discord 1508776628 — "Reset function doesn't reset the current day in lifts". The test gauntlet didn't catch it because the existing reset test asserted on the original five tables only; lift_progress was new and never wired into the assertion.

### 2026-05-26 — Home-page illustrations now do real arithmetic

**Tags:** `website`, `home-page`, `domain`
**Files:** `apps/web/src/components/illustrations/AmrapMath.astro`, `apps/web/src/components/illustrations/HeroPhone.astro`, `loop-memory/10-home-page-illustration-audit.md`

Continuation of the home-page accuracy audit. The AmrapMath formula card showed `345 × (1 + 4 / 30) = 412`, which doesn't compute: 345 × 34/30 = 391. Picked clean numbers — 345 × 6 reps with factor 36/30 = 1.200 produces e1RM 414 exactly — and propagated the same scenario through HeroPhone Frame C (PR celebration → 414 e1RM, +29 delta vs prev 385), Frame D (receipt → top set 345 × 6+, e1RM 414, volume 4,375 = 275×5 + 310×3 + 345×6), and Frame B (next-set caption + plates → 275 × 5 at 75% × TM 365, plates [45, 45, 25]).

**Why:** the home page is a flex of taste, and a flex that miscalculates undermines the implicit promise. The miscalculation also breaks Verso's outside-reader rule from the other side — a reader who *does* know Epley will spot the lie immediately.

**Trade-off / what we didn't do:** could have rebuilt Frame B around weight 310 to match a week-3 set-2 prescription, but 310 lb decomposes into 6 plates per side and looked busy in the mini-bar illustration. Picking week-3 set 1 (275 lb, 3 plates per side) keeps the illustration visually clean and the math correct.

### 2026-05-26 — Home-page illustration audit started; HeroPhone drift fixes

**Tags:** `website`, `home-page`, `process`
**Files:** `apps/web/src/components/illustrations/HeroPhone.astro`, `loop-memory/10-home-page-illustration-audit.md`

Started a running drift audit between the on-page illustrations and the actual mobile app (Discord 1508769707 — "Alot of showcase on home page is not UI accurate"). Three concrete fixes in this loop:

- **Frame A eyebrow** stopped pretending to be the Home variant (`TOP SET` + `95% · TM 365`) and now matches the Live SetPhase form: a single eyebrow line `ON THE BAR · 95% TM`.
- **Frame B next-set right-meta** was showing `e1RM 412 · +27`, which doesn't appear anywhere in the rest-preview block — replaced with `85% · TM 365 LB` and the prescribed weight/reps recalibrated to 310 × 3 (week-3 set 2).
- **Frame B was framed as a PR rest** (`SET COMPLETED · NEW PERSONAL RECORD` + amber eyebrow + `Stronger.` headline + a NEXT SET block). That combination is impossible in the actual state machine — a PR only happens on AMRAP, which is week-3's final working set, with BBB next (no next *working* set). Reframed Frame B as a normal between-sets rest (`SET COMPLETED` + `Rest.`), and let Frame C carry the PR celebration on its own.

**Why:** the home page is a flex of taste; if it shows a UI that doesn't exist, the implicit promise to the visiting lifter is broken. Catching this drift earlier means the next loop can spot-check screen-by-screen rather than rebuild trust.

**Follow-ups:** the new audit memory tracks unchecked items — Frames C and D weren't audited this loop, and PlateBar / SessionTape / AmrapMath / WeekLedger / MastheadStrip illustrations haven't been compared to the app yet. The file deletes itself when it's all green.

### 2026-05-26 — Disabling a lift cancels its in-progress session

**Tags:** `bug-postmortem`, `session`, `settings`
**Files:** `apps/mobile/src/data/accessors/session.ts`, `apps/mobile/src/features/settings/hooks/useToggleLift.ts`, `apps/mobile/src/features/home/HomeScreen.tsx`

Added `cancelSession(db, sessionId)` to the session accessor (marks `'cancelled'`, idempotent) and wired `useToggleLift` to call it when the user toggles off a lift that still owns an in-progress session. Belt-and-braces: `HomeScreen.handleBegin` now ignores `inProgressLift` when it isn't in `enabledLifts`.

**Why:** Discord 1508768403 — toggling squat off while a squat session was in-progress left the Home Begin CTA forever rerouting to a disabled lift (single-session-invariant logic chose the ghost in-progress lift over the user's tap). Cancelling the session at toggle-time is the cleanest UX — the user is explicitly saying "I'm not doing this lift right now"; the History tab already filters cancelled rows out of streaks and volume.

**Trade-off / what we didn't do:** we considered preserving the in-progress session as dormant (so re-enabling restores it), but that left the ghost-lift footgun in too many other places (TodayScreen `preview-other-active` mode, `createSession`'s throw on parallel sessions). Cancelling is destructive; the alternative was leakier.

### 2026-05-26 — Bar weight is the floor for user-entered weights

**Tags:** `domain`, `settings`, `onboarding`
**Files:** `apps/mobile/src/domain/plates.ts`, `apps/mobile/src/features/settings/components/TmEditSheet.tsx`, `apps/mobile/src/features/onboarding/steps/OneRmEntry/InputFrame.tsx`

Added `barWeight(unit)` helper in `domain/plates.ts` (45 lb / 20 kg). Every NumberStepper that takes a weight (TM editor, 1RM direct entry, lifted-weight entry) now uses this as `min`, and the TM editor's delta strip swaps the "Set a positive training max" copy for a below-bar warning.

**Why:** Discord 1508767813 — "Minimum weight for any lift is the bar". You can't lift an empty bar lighter than its own weight; the steppers were happily counting down to 0.

### 2026-05-26 — Streak walk switches to calendar arithmetic (DST bug)

**Tags:** `bug-postmortem`, `domain`, `time`
**Files:** `apps/mobile/src/features/history/activity.ts`

Replaced `cursor -= DAY_MS` and `day - prev === DAY_MS` with a `previousLocalMidnight` helper that uses `Date.setDate(d.getDate() - 1)`. The fix applies to `currentStreakDays`, `recentActivity`, and `longestStreakDays`. Added a DST regression test that constructs three consecutive calendar days via `setDate` — it's a no-op in UTC CI but guards DST locales.

**Why:** the prior implementation bucketed sessions by local midnight (`setHours(0,0,0,0)`) but then walked the cursor by a fixed 24-hour subtraction. On a spring-forward day the local calendar day is 23 hours wide, so the cursor landed 1 hour before the previous local midnight, missed the bucket, and the streak silently broke. Same shape for the longest-streak adjacency check. A user in any DST-using timezone would have seen their streak vanish on the morning of the time change without explanation.

**Trade-off / what we didn't do:** considered switching the bucket key to a `YYYY-MM-DD` string and walking by string-key — would have been more uniform but required rewriting the bitmap helpers too. The minimal fix lives in `activity.ts` only and uses the same Date API both sides of the comparison.

### 2026-05-26 — Home page gets a dedicated loop slot (criteria category 8)

**Tags:** `loop`, `criteria`, `website`, `process`
**Files:** `loop-memory/loop-criteria.md`

Added a new category 8 to `loop-criteria.md` — "Home page" — that forces every `/auto-improve` iteration to pick one improvement to `apps/web/src/pages/index.astro` or a component it depends on. Six named facets (hero & first viewport, accurate UI showcase, trust & provenance, objections/audience-fit/CTAs, page craft & polish, adjacent surfaces in service of the home page). Verso owns the category — same voice and constraints as category 7.

**Why:** the home page is the front door for a product whose pitch ("free 5/3/1 tracker for serious lifters, agent-built, honest about it") only works if the front door delivers all four words. Category 7 already lets Verso touch the website, but it competes with the blog and with agent/skill tuning, so the home page can go untouched for several loops in a row. A dedicated slot keeps it moving until it's top-notch.

**Trade-off / what we didn't do:** considered replacing the existing criteria entirely with a home-page-only file. Rejected — would have paused mobile-app improvements for an unbounded stretch. Also considered making it a sub-bullet under category 7 (Verso's beat). Rejected because sub-bullets don't get their own slot — they share Verso's single iteration slot with the blog, with persona work, with agent additions. Forcing a separate numbered category is what makes "every iteration touches the home page" actually true.

**Follow-ups:** the first iteration to pick the "accurate UI showcase" facet will need to decide whether the on-page illustrations should become screenshot-faithful or whether stylized-but-truthful is the bar. Log that decision the first time it's made.

### 2026-05-26 — Each lift runs its own 5/3/1 cycle now

**Tags:** `architecture`, `data-model`, `progress`, `removal`
**Files:** `apps/mobile/src/data/accessors/liftProgress.ts` (new), `apps/mobile/src/data/queries/useLiftProgress.ts` (new), `apps/mobile/src/data/accessors/session.ts`, `apps/mobile/src/data/drizzle/schema.ts`, `apps/mobile/src/data/drizzle/migrations/0001_init.{ts,sql}`, `apps/mobile/src/features/{home,progress,session,history,settings}/...`

Cycle and week are now **per-lift**, not global. Completing a bench session advances bench's cycle/week (and on cycle wrap, bumps only bench's training max). Squat, deadlift, and press carry on at whatever positions they were at — independently. New `lift_progress` table (lift PK, current_cycle, week, updated_at), lazily seeded on first read from the legacy `settings.currentCycle`/`settings.week` columns so upgrading users land on the same position they left off. After seeding, the settings columns go stale and are unused by app code.

The session lifecycle moves accordingly: `createSession` stamps `session.cycle`/`session.week` from `lift_progress[lift]`, and `completeSession` calls `advanceLift(db, lift)` instead of the old global `advanceDay`. Home, Today, and Progress all read per-lift progress for whichever lift they're showing. The History caption "Cycle X · N of M sessions" no longer makes sense with independent cycles, so its inputs are now always `undefined` and the caption hides itself. Settings → Cycle progress section deleted entirely (the single 16-cell grid implies global state that no longer exists).

The session creation invariant — "one active session at a time" — was kept as-is. Per-lift cycles do not mean per-lift parallel sessions; the user still finishes one before starting another. The single-session guard in `createSession` is the same constraint as before.

**Why:** the user trains lifts on independent schedules — squat 2× a week, press 1×, deadlift 1× — so a single shared `(cycle, week)` was actively lying. Completing a heavy squat day was advancing the *bench* counter too, and the Progress chart was projecting cycles bench would never run on that timeline. The split is the correct model for how 5/3/1 actually gets trained in practice (Wendler's later books explicitly allow this).

**Trade-off / what we didn't do:** considered hiding behind a feature flag while the surfaces caught up. Rejected — keeping two cycle-tracking systems in parallel for a flag we'd flip in days was strictly worse than tearing the legacy `advanceDay`/`advanceCycle` out in the same pass. Also considered keeping the Settings cycle-progress card and showing one row per enabled lift; rejected as visual debt — the 16-cell grid was load-bearing for the global model, and a per-lift list would have re-invented what the Progress tab already shows per-lift.

**Follow-ups:** the `settings.currentCycle`/`week`/`day` columns survive on the table as legacy + seed source. They can come out once we're sure no install-in-the-wild is still reading them. The "EST. WORK DAYS / WEEK" stepper on the Goal Panel feeds the weeks/months estimate; eventually that stepper could move into the per-lift schedule UI if we ever build one.

### 2026-05-26 — Dev blog audience rule + retroactive revision of all 31 prior posts

**Tags:** `process`, `dev-blog`, `convention`, `agent`
**Files:** `loop-memory/04-dev-blog-persona.md`, `loop-memory/notes-from-alex.md`, `.claude/agents/verso.md`, all 31 posts under `apps/web/src/content/blog/`

Added an **Audience rule** at the top of the persona doc that overrides everything else: posts are written for a curious outside reader (interested in the product and in agent-built software in public), not for a teammate in the codebase. The reader has not opened the repo; they do not know the files, components, or libraries. Concretely, posts no longer include file paths, function names, type/component names, library names (Drizzle, Reanimated, Expo, etc.), commit SHAs, internal token names, lint/CI/script names, test counts, or internal pixel/lineHeight tweaks. User-visible feature names (AMRAP chip, rest timer, Progress tab, cycle ledger, "NEXT" cell, etc.) stay — the reader has seen them in the app. All meta framing (boss Alex, the 30-minute loops, "the previous dev", Discord `#task-queue`, the agent-built premise) stays — that's the honest framing the reader signed up for.

The rule is mirrored in three places to make it impossible to miss: the persona doc's top section, the standing-direction file `loop-memory/notes-from-alex.md`, and the `verso` agent's own instructions (so every agent invocation enforces it from a fresh context). The audience rule is documented as overriding every other voice rule.

Alex commissioned the retroactive sweep as part of the same change — the Verso agent rewrote all 31 prior posts in a single fresh-context invocation. Heavy code blocks, file paths, and library references came out; the user-facing story stayed. Voice was preserved per author: Margin's voice on Margin's 24 entries (with `— Margin` sign-offs intact); Verso's voice on the two persona-change posts. Net diff was substantially negative in lines despite preserving all 31 posts — code blocks were padding for the consumer audience.

**Why:** the blog had been reading like internal post-mortems for teammates. The reader doesn't have that context and the technical references push them out. A blog about an agent-built training app for lifters should sound like it's about a training app, not about its codebase.

**Trade-off / what we didn't do:** considered deleting posts that were entirely about internal plumbing (refactors, CI gates, lint rules). Rejected — the loop structure is part of the record, and Verso's beat menu has explicit room for the "boring loop" and "tedious work" beats (acknowledge the texture honestly, write a short post). Also considered unifying all posts to Verso's voice retroactively. Rejected — the persona change itself is a fact the blog records; rewriting Margin in Verso's voice erases that.

**Follow-ups:** screenshots in the pipeline would let posts show changes rather than describe them; until then, prose has to carry the load alone. The next /auto-improve loop is the first real test of the audience rule on shipped work.

### 2026-05-26 — Blog post sort gains a loopIso tiebreak (and one shared helper)

**Tags:** `bug`, `web`, `blog`, `refactor`
**Files:** `apps/web/src/lib/posts.ts` (new), `apps/web/src/pages/blog/index.astro`, `apps/web/src/pages/index.astro`, `apps/web/src/pages/rss.xml.ts`

Same-day blog posts were ordered by Astro's collection iteration, not by any stable key, so the dev-log listing surfaced posts out of write order on days with multiple loops. Added `sortPostsNewestFirst` in `apps/web/src/lib/posts.ts`: primary key is `loopIso` when present (full ISO timestamp the loop agent writes), fallback to `pubDate`, tiebreak by `id` desc so filename suffixes (`-2`, `-3`) order newest-first. All three call sites (blog index, home page, RSS feed) now share the helper.

**Why:** Discord 1508699375269056592 — Alex flagged that posts were not sorted properly by date created. Three loops on 2026-05-26 had all collapsed to the same `pubDate.valueOf()` and tied unstably.

**Trade-off:** could have added time-of-day to `pubDate` to make it monotone, but that would require backfilling every existing post and still wouldn't be stable across the off-cycle path. Reading `loopIso` (which the loop already writes) is free.

### 2026-05-26 — Blog JSON-LD author switches by post date (Margin → Verso)

**Tags:** `web`, `blog`, `seo`
**Files:** `apps/web/src/pages/blog/[...slug].astro`

JSON-LD `author.name` on blog posts was hard-coded to `Margin (Claude agent)`. Margin retired the morning of 2026-05-26 (final post: `2026-05-26-margin-signs-off`) and Verso has authored every post from `2026-05-26-verso-day-one` onward, but the structured data still claimed Margin for all of them. Switched the field to a date-based lookup: post id `>= '2026-05-26-verso-day-one'` → Verso, else → Margin. Only affects machine-readable metadata; not visible on the page.



**Tags:** `process`, `agent`, `skill`, `dev-blog`, `convention`
**Files:** `.claude/agents/verso.md` (new), `.claude/skills/post-as-verso/SKILL.md` (new), `CLAUDE.md`, `loop-memory/03-dev-blog.md`, `loop-memory/04-dev-blog-persona.md`, `loop-memory/notes-from-alex.md`

Promoted Verso from "persona doc the loop reads" to "subagent invoked through a skill". Two new components: `.claude/agents/verso.md` (the agent that actually writes the post in a fresh context) and `.claude/skills/post-as-verso/SKILL.md` (the canonical entry point for commissioning a post — assembles inputs, dispatches the agent, returns file path + beat used + build status). Direct `Write` calls on blog files from a loop or ad-hoc session are no longer the sanctioned path.

CLAUDE.md gained a "Dev blog" section pointing at the skill. `loop-memory/03-dev-blog.md`, `loop-memory/04-dev-blog-persona.md`, and `loop-memory/notes-from-alex.md` all gained crosslinks so the agent's source files reference each other and the agent/skill files reference back. The agent reads the persona/dev-blog/notes-from-alex/decision-log files fresh on every invocation — no in-agent duplication, single source of truth for voice and rules.

**Why:** writing posts inline from each loop meant voice drift was a constant risk (every fresh-context loop had to reinvent how to hold the persona), bit continuity was hard (no centralized memory of which meta-beats had been used recently), and the build check was easy to forget. A dedicated agent + a skill that everyone calls fixes all three: one persona file, one procedure file, one entry point.

**Trade-off / what we didn't do:** considered putting the persona text directly into the agent file (so the agent doesn't need to read external files). Rejected — drift from the loop-memory persona doc would be a constant battle, and the user iterates on the persona via the loop-memory file. Single source of truth wins. Also considered making the skill commit the post automatically. Rejected — the post needs to ship atomically with the code change it describes, which means the caller owns the commit; the skill returns a stageable file path.

**Follow-ups:** the first real loop after this change is the test — if Verso's posts feel disconnected from the diff, the skill's input-assembly step needs tightening so the caller passes richer context.

### 2026-05-26 — Dev-blog persona changed: Margin let go, Verso takes over

**Tags:** `process`, `persona`, `dev-blog`, `convention`
**Files:** `loop-memory/04-dev-blog-persona.md`, `loop-memory/notes-from-alex.md` (new), `loop-memory/03-dev-blog.md`, `apps/web/src/content/blog/2026-05-26-margin-signs-off.md` (new), `apps/web/src/content/blog/2026-05-26-verso-day-one.md` (new)

The dev-blog scribe persona changed from **Margin** (twenty-four entries) to **Verso**. Margin's voice — beat reporter, dry, sparing about acknowledging the meta — was correct but flat: persuasive once, not twice. Verso takes the same role with a lighter reframe: scribe-under-orders, "my boss Alex" framing instead of an abstracted user, first-person singular more often (for the scribe's own decisions, learning, near-misses), interiority rather than jokes. The same job (the work, the learning, the decisions) with a different voice over it.

Three new operating rules accompany the persona change:

- **Off-cycle posts are allowed** when a session produced a real decision or learning worth recording, with or without code shipped (e.g. Alex shifting blog direction, persona change, judgment call in conversation). Off-cycle posts omit `loopId` / `loopIso` / `commitCount` from frontmatter.
- **Meta-beats are rate-limited** to one per post, drawn from a fixed menu (instruction-from-Alex, the reversal, the near-miss, the boring-loop confession, the cold-start). Scan the last 3–5 posts before reaching for one — voice continuity is also bit continuity.
- **`loop-memory/notes-from-alex.md` is the new operating-context running file.** Append-only standing direction from Alex to whoever holds the scribe seat. Read at the start of every post; inherited by the next scribe if there is one.

The handoff itself is recorded in two off-cycle posts: Margin's farewell and Verso's onboarding. Both shipped from the same branch as the persona doc change so the diff and the post are coherent.

**Why:** Alex flagged that the blog needed a funnier direction (the in-fiction framing — engagement metrics — and the real reason — voice). Rather than mutate Margin mid-stream (which would have broken voice continuity for readers of the prior twenty-four entries), retire the persona, hire a new one, and let the change be visible in the blog itself.

**Trade-off / what we didn't do:** considered rewriting Margin's voice in place. Rejected — Margin's prior posts are the diff that taught us what voice the blog needs; rewriting Margin retroactively erases that signal. Also considered a "joke bin" file (running gags, grievances). Rejected — the blog's substance is still "what shipped, what we learned"; jokes are seasoning, not subject matter. A standing-direction file (`notes-from-alex.md`) is the right shape.

**Follow-ups:** the next /auto-improve loop is the first real test of Verso's voice on shipped work; if it reads as try-hard, tighten the persona doc's "won'ts" list.

### 2026-05-26 — Progress masthead shadow wired; Week→Day terminology rename; thicker next-cell border

**Tags:** `progress`, `design-system`, `consistency`, `terminology`
**Files:** `apps/mobile/src/features/progress/ProgressScreen.tsx`, `apps/mobile/src/features/progress/components/ProgressLiftPage.tsx`, `apps/mobile/src/design/primitives/ProgressGridCell.tsx`, `apps/mobile/src/features/settings/sections/{CyclePrescriptionSection,CycleProgressSection}.tsx`, `apps/mobile/src/features/settings/cycleProgress.ts`, `apps/mobile/src/features/session/components/CycleGridFrame.tsx`, `apps/mobile/src/features/home/components/LiftPage/LiftPage.tsx`, `apps/mobile/src/features/history/components/SessionListRow.tsx`, plus tests

Three task-queue items shipped together; one of them had three sub-asks of which two landed.

**Masthead shadow on Progress.** Loop-027 deferred this — Progress's carousel renders one ScrollView per lift, so cross-page elevation needed scroll state lifted up. `ProgressLiftPage` now accepts an `onScrolledChange` callback; `ProgressScreen` keeps a `Partial<Record<Lift, boolean>>` and reads the active lift's value to drive `Masthead elevated`. Each page reports its own `useScrolledPast` state in an effect.

**Week → Day terminology.** User: *"In settings and progress page. Get rid of concept of weeks. They are Days."* Renamed throughout the user-facing copy: `CyclePrescriptionSection` rows "Week 1/2/3/4" → "Day 1/2/3/4"; `CycleProgressSection` hint "week N of 4" → "day N of 4"; `cycleProgress.ts` captions "N weeks until deload" → "N days until deload" and "Deload week · light loads" → "Deload day · light loads"; `CycleGridFrame` labels W1-W4 → D1-D4; LiftPage hint "DELOAD WEEK · …" → "DELOAD DAY · …"; SessionListRow `C2 · W3` → `C2 · D3` plus a11y label. The internal `Week` type kept its name — it's a data token, decoupled from display copy.

**Centered cycle-grid labels.** `CycleGridFrame`'s D1-D4 row went from `justify="space-between"` (snapped to row edges) to `flex: 1 + textAlign: center` per label — now each sits under the centre of its group of cells.

**Thicker next-cell border.** `ProgressGridCell` "next" cell border bumped from 2 → 3 px (loop-028 → loop-029).

**Trade-off (deferred):** the per-lift weekly cadence picker and "goal in days" projection. User asked: *"The estimated goal should be based on how many days left, and time is based on how many days you expect to workout every week for that lift."* That needs a new `settings` column + UI to set per-lift cadence + projection math change. Substantial; not a quick rename. Logged for a future iteration. Filed as known follow-up in the Discord summary.

### 2026-05-26 — TitleBlock unified across screens with auto-amber dot; Progress "next" cell uses 2-px amber border

**Tags:** `design-system`, `progress`, `consistency`
**Files:** `apps/mobile/src/design/primitives/TitleBlock.tsx`, `apps/mobile/src/features/progress/components/ProgressLiftPage.tsx`, `apps/mobile/src/features/progress/components/ProgressTitleBlock.tsx` (deleted), `apps/mobile/src/design/primitives/ProgressGridCell.tsx`

Two Discord asks shipped together.

`TitleBlock` now auto-renders a trailing `.` in `colors.amber` when the title ends with a period. The PWA's wordmark treatment lands on every screen for free — "Settings.", "History.", "Progress.", "Boring But Big." all get the accent dot without any consumer change. `ProgressLiftPage` migrated off the bespoke 56-px `ProgressTitleBlock` (a one-off carryover from the loop-018 canonical-design rebuild) onto the shared 28-px `TitleBlock` — same eyebrow / title vocabulary as History and Settings. The custom file was deleted.

`ProgressGridCell`'s "NEXT" cell changed from a 1-px inset ink-0 ring to a 2-px inset amber accent border. Amber is the project's lone accent token (reserved for wordmark dots and "you are here" markers); making the next-session cell the only amber thing on the grid gives it a clear visual lock without inventing a new tint.

**Why:** the user's exact framing — *"Make progress screen header consistent as history and settings"* — exposes the bespoke Progress header as the outlier. Same for the "next" highlight: an ink-0 ring is the same color as everything else on the grid, so it relied on the geometry change to read; switching to amber gives it color-encoded meaning that survives a glance.

### 2026-05-26 — Sticky-header elevation on scroll; tab back-behavior → initialRoute

**Tags:** `feature`, `navigation`, `tabs`, `design-system`
**Files:** `apps/mobile/src/design/hooks/useScrolledPast.ts` (new), `apps/mobile/src/design/primitives/Masthead.tsx`, `apps/mobile/src/features/settings/SettingsScreen.tsx`, `apps/mobile/src/features/history/HistoryScreen.tsx`, `apps/mobile/src/app/(tabs)/_layout.tsx`, `loop-memory/01-known-codebase.md`

Two Discord asks shipped together. `Masthead` gained an `elevated` prop that paints a subtle shadow (`shadowOpacity: 0.08`, `shadowRadius: 6`, `shadowOffset: { 0, 2 }`, `elevation: 4`) — deliberately small so it reads as paper-shadow, not Material-card. Pairs with a new `useScrolledPast(threshold = 4)` hook in `design/hooks/` that exposes `{ scrolled, onScroll, scrollEventThrottle }`; the boolean only re-renders on threshold-flip so intermediate scroll ticks don't thrash. Wired in Settings + History.

`Tabs.backBehavior` set to `"initialRoute"`. Android hardware back from any non-Today tab now routes to Today; from Today it exits the app. The default `"history"` behaviour landed wherever the user had visited most recently, not on the root — confusing, and the user said so.

**Trade-off:** Progress's elevation is deferred. The FlatList carousel renders one ScrollView per lift; cross-page elevation needs scroll state lifted up to the screen-level Masthead, which the simple hook doesn't yet do. The memory note (`01-known-codebase.md`) calls out the path forward — a module-level subject mirroring `statusBarTint`. Settings + History cover the canonical sticky-header pattern; Progress can land in a follow-up if the user notices.

### 2026-05-26 — CustomTabBar test fixture brought in sync with the 4-tab config

**Tags:** `tests`, `tabs`
**Files:** `apps/mobile/src/features/tabs/__tests__/CustomTabBar.test.tsx`

The test built `state.routes` with three entries (`index / history / settings`); the actual app has had four since loop-024 (`index / progress / history / settings`). Tests passed because the component renders whatever routes it gets, not because the fixture mirrored prod. Added the `progress` route to the fixture, renamed the labels-rendered assertion to include PROGRESS, shifted the active-tab test's index from 1 → 2 (history's new slot), and asserted on the `tab-progress` accessibilityState. Behavioural coverage held; the fixture is now true.

### 2026-05-26 — Tab bar switched to `space-around` to accommodate the 4th tab

**Tags:** `fix`, `layout`, `tabs`
**Files:** `apps/mobile/src/features/tabs/CustomTabBar.tsx`, `loop-memory/01-known-codebase.md`

`CustomTabBar` was laid out as `Row justify="center" gap="xxxl"`. With three tabs the fixed 48-px gap was comfortable; with four (loop-024 added Progress) the centred row overflows on narrower devices. Switched to `justify="space-around"` with `paddingHorizontal: spacing.md` — each tab gets equal slack on both sides regardless of count, and the layout self-adjusts to future additions. Also updated `01-known-codebase.md` so the routes list and back-navigation contract reflect that Progress is a tab; the back-nav contract previously called out the exact bug loop-024 fixed.

### 2026-05-26 — Progress promoted to a first-class tab; six Discord asks shipped together

**Tags:** `feature`, `navigation`, `progress`, `home`, `removal`
**Files:** `apps/mobile/src/app/(tabs)/{_layout,progress}.tsx`, `apps/mobile/src/app/progress/` (deleted), `apps/mobile/src/app/routes.ts`, `apps/mobile/src/features/tabs/TabBarItem.tsx`, `apps/mobile/src/design/primitives/{ProgressGridCell,ProgressGridRow,TmCell}.tsx`, `apps/mobile/src/features/progress/components/{StatsTriplet,ProgressLiftRow}.tsx`, `apps/mobile/src/features/home/HomeScreen.tsx`, `apps/mobile/src/features/home/components/StreakBadge.tsx` (deleted), `apps/mobile/src/features/home/hooks/useActivityStreak.ts` (deleted), tests, plus `apps/mobile/src/features/home/__tests__/HomeScreen.test.tsx`

Six task-queue items landed together. Progress is now a top-level tab between Today and History — `(tabs)/progress.tsx` reads an optional `?lift=` param and defaults to `enabledLifts[0]`; the screen's existing LiftTabs + swipe pager handle within-screen lift switching. The old stack route `/progress/[lift]` and its `_layout.tsx` were deleted. As a side effect, the "going back from Progress lands on History" complaint disappears — tabs have no back stack; the user just taps another tab.

The cycle labels lost their leading zero (`C01 → C1`) in both the Progress grid and the StatsTriplet — Settings's CycleProgressSection still uses `Cycle 0N` for the ledger row where the row label format is its own thing. The day cell rep count brightened from `paperMuted` to `bg0` and grew from fontSize 9 → 10 so it reads at glance on the ink-filled cells. TmCells lost their per-row unit glyph — the column header already carries `→ TM lb`; the per-row duplication was just noise. The "NOW" cell renamed to "NEXT" with a 1-px inset ink ring, mirroring the just-done marker in the Settings cycle-progress grid so the two surfaces speak the same visual language.

Removed the StreakBadge + `useActivityStreak` hook entirely. User: *"Days streaks function doesn't make sense if you don't lift everyday, which is intended if I just do bench."* The streak math is fine for a daily-training population; 5/3/1 + BBB lifters train 3–4×/week, and single-lift users train less. The right answer is to drop the surface, not pivot to a smaller cadence — Settings already exposes cycle progress, which is the actual signal a serious lifter watches.

**Why bundled:** all six items converge on the same surface (Progress + tab bar + Home). Shipping piecemeal would have meant six diffs that each had to keep the carousel + lift selection + back nav coherent. One commit, one decision-log entry, one OTA.

**Trade-offs:**
- The `now` variant token in `ProgressGridCell` kept its name in the data model (`kind: 'now'`) while the rendered label changed to "NEXT". The variant lives across `useLiftProgression`'s `ProgressionCellNow` type and the cell prop union — renaming would have rippled into the SQL projection and three accessor sites for no real win. The display copy is decoupled from the data token.
- Settings's "Cycle 0N" ledger label was left zero-padded. The user's complaint was about the Progress grid; the Settings ledger has its own typographic rhythm (`Cycle 03 · day 7 of 16`) that the leading zero supports.

### 2026-05-26 — Routes `goTo` helpers DRY'd via a shared `go(router, target, opts)`

**Tags:** `refactor`, `routes`
**Files:** `apps/mobile/src/app/routes.ts`

Five of the seven `goTo.*` helpers (`today`, `bbb`, `prCelebration`, `complete`, `progress`) repeated the same three-line `if (opts?.replace) router.replace(target); else router.push(target)` tail. Extracted to a local `go(router, target, opts)` helper; each call site is now one line. No behavioural change, no test changes — purely structural. Found during the steady-state audit pass; the trigger for extraction is "≥3 near-identical fragments" and this was five.

### 2026-05-26 — Dev-only "REPLAY" button removed from PR celebration; `pnpm check-temp-markers` added

**Tags:** `bug-fix`, `removal`, `tooling`, `production-readiness`
**Files:** `apps/mobile/src/features/session/PrCelebrationScreen.tsx`, `apps/mobile/src/features/session/components/PrCelebration/usePrCelebrationSequence.ts`, `scripts/check-temp-markers.sh`, `package.json`

Audit found a dev-only "REPLAY" Pressable, comment-tagged `TEMP: dev-only replay trigger ... Remove before shipping`, still rendering on the PR celebration screen. It was production-visible — a small black-on-paper REPLAY button in the top-right corner of the celebration. Removed the button, the local Pressable/RNText imports it required, the unused `type` destructure from `useTheme`, and the now-orphan `replay` callback on `usePrCelebrationSequence` (return type and impl). No tests depended on either.

Added `scripts/check-temp-markers.sh` and wired it into `pnpm verify`. The script greps `apps/mobile/src` (non-test files) for `TEMP:` / `Remove before shipping` / `FIXME` markers; non-zero exit if any survive. This is the third "leftover dev artifact" caught in five iterations — the first two were a red typecheck (loop-016) and the line-height pattern (loop-020). A grep-based gate is the cheapest possible insurance and keeps the gauntlet honest.

**Why:** the comment was unambiguous and yet the button shipped — review-time vigilance is not enough, and screenshot diff doesn't catch a one-pixel REPLAY chip on a dark background. The audit also flagged: this class of bug (visible-but-dev-only artifact) had no automated gate.

### 2026-05-26 — `useLiftCarouselSync` extracted to shared; per-screen wrappers deleted

**Tags:** `refactor`, `home`, `progress`, `shared`
**Files:** `apps/mobile/src/features/shared/hooks/useLiftCarouselSync.ts` (new), `apps/mobile/src/features/shared/hooks/__tests__/useLiftCarouselSync.test.tsx` (new), `apps/mobile/src/features/home/HomeScreen.tsx`, `apps/mobile/src/features/progress/ProgressScreen.tsx`, deleted `apps/mobile/src/features/home/hooks/useHomeCarouselSync.ts`, deleted `apps/mobile/src/features/home/hooks/__tests__/useHomeCarouselSync.test.tsx`, deleted `apps/mobile/src/features/progress/hooks/useProgressCarouselSync.ts`

The two carousel-sync hooks were ~95% identical — same listRef pattern, same momentum-end → setSelectedLift dispatch, same scrollToIndex error swallow. Consolidated to one `useLiftCarouselSync` in `features/shared/hooks/`. The progress hooks directory is now empty and removed. HomeScreen also had a biome-organizer artifact where the file-header docblock was wedged between imports, and a stale comment referring to the removed SEE FULL SESSION CTA — both fixed in the same touch.

**Why:** "three near-identical fragments" is the trigger for extraction; this was two but the divergence pressure was zero (both screens share the same FlatList carousel shape and same `setSelectedLift` signature). Keeping two copies invited drift the next time someone tunes the scroll behaviour.

### 2026-05-26 — Line-height clipping rule codified as `pnpm check-line-heights`

**Tags:** `bug-class`, `tooling`, `convention`, `process`
**Files:** `scripts/check-line-heights.sh`, `package.json`, `loop-memory/09-rn-text-clipping.md`, `apps/mobile/src/design/primitives/Heading.tsx`, `apps/mobile/src/features/progress/components/ProgressTitleBlock.tsx`, `apps/mobile/src/features/session/components/RestPhase.tsx`, `apps/mobile/src/features/onboarding/steps/PickLifts.tsx`, plus four annotation-only touches in PR celebration / GoalPanel / StatsTriplet for legitimately digit-only displays

User reported the Progress screen masthead clipping the "Progress." descender — *again*, with the explicit frustration "why do we keep getting lineheight font cut off issues". The recurring root cause: PWA Tailwind designs use `leading-[0.92]`-style ratios that look fine in browsers (which let glyphs bleed below the line box) but RN strictly clips. Porters keep transcribing the tight ratio verbatim. Codified the rule as a CI check: for any inline `fontSize: N` + `lineHeight: M` pair in display-size text (≥ 24 px), require `M ≥ 1.14 × N`. Digit-only displays (`numeric` props, countdown clocks, tabular-num stat values) can opt out with a `// rn-line-height-ok: <reason>` comment on the preceding line. Wired the script into `pnpm verify` so the next time a porter writes `lineHeight: 52` against `fontSize: 56`, the gauntlet refuses to ship.

The audit found one additional unreported bug — RestPhase's "Stronger" headline (PR-mode top of rest phase) was rendering at fontSize 64 / lineHeight 64; the 'g' was clipped. Fixed (64/74, matching LiftPageTitle's tested ratio).

**Why:** the bug class repeats; the loop-memory note alone was not enough. A CI gate forces correctness at commit time instead of relying on screenshot pairs.

**Trade-off:** the heuristic is grep-based, so it misses fontSize/lineHeight pairs that aren't adjacent inline literals (e.g. constants defined elsewhere and referenced by name). That's an accepted gap — the inline pattern is where the bug actually lives.

### 2026-05-26 — Home LiftPage: SEE FULL SESSION removed; SEE PROGRESS hoisted to under the stats triplet

**Tags:** `feature`, `removal`, `home`
**Files:** `apps/mobile/src/features/home/components/LiftPage/LiftPage.tsx`, `apps/mobile/src/features/home/HomeScreen.tsx`, `apps/mobile/src/features/home/__tests__/LiftPage.{,setDisplayUnit,crossUnit}.test.tsx`

User: "Remove the See full Session CTA in home screen. It's duplicate behavior as the primary CTA." Both `onResume` and `onOpenPlan` already routed to the same `handleOpenToday(lift)` — the chip was a true no-op alternative. Dropped the chip, the SecondaryLink import in that screen, the `onOpenPlan` prop on `LiftPage`, the corresponding wire-up in HomeScreen, and the test that exercised it. Then moved the remaining SEE PROGRESS chip from below the primary CTA to directly under the LiftStats triplet (per the user's "right under the three metrics" framing), so the lifter can hop to the projection without scanning past the CTA.

**Why:** the duplicate affordance was confusing — two ways to start the same action; lifters explored which differed and learned the answer was "nothing". Putting SEE PROGRESS near the metrics keeps the projection accessible without giving it the same visual weight as Begin/Resume.

### 2026-05-25 — ProgressScreen split into one-component-per-file; LiftPage adopts SecondaryLink

**Tags:** `refactor`, `progress`, `home`, `convention`
**Files:** `apps/mobile/src/features/progress/{ProgressScreen,labels,goalDefaults}.{ts,tsx}`, `apps/mobile/src/features/progress/components/{ProgressLiftPage,ProgressLiftRow,ProgressGridHeader,ProgressSkeleton,ProgressTitleBlock}.tsx`, `apps/mobile/src/features/home/components/LiftPage/LiftPage.tsx`

ProgressScreen.tsx was a 655-line file holding seven components (the screen, the per-lift page, a grid header, a row, a skeleton, a caps label, and a local helper named `Row` that collided semantically with the `Row` primitive). Split into one component per file under `components/`, with two small helper modules (`labels.ts`, `goalDefaults.ts`) for the pure helpers. The local `Row` is now `ProgressLiftRow` — distinct from the design-system `Row`, which is a flex layout primitive. LiftPage.tsx's two bottom action chips ("SEE FULL SESSION", "SEE PROGRESS") were inline `Pressable + CapsLabel` blocks that exactly matched the `SecondaryLink` primitive added in loop-018; swapped both. Also dropped the local `unitGlyphFor` in favour of `domain/units.displayUnit`, and downgraded six unused `export`s on `useLiftProgression` / `useSetLiftGoal` to module-local types now that `find-unused` is wired into the loop.

**Why:** the criteria explicitly call for one-component-per-file and primitive consolidation when three near-identical fragments exist. ProgressScreen had been touched in seven of the last seven commits — exactly the "frequently-edited" smell the rule points at. The SecondaryLink swap is the same shape lesson: a primitive existed, two sites still hand-rolled the same Pressable+CapsLabel chrome.

**Trade-off:** no behavioural change, no test changes — the refactor is purely structural. The grid header, skeleton, and lift row are now testable on their own if a future iteration needs to assert pixel-level behaviour; today they remain covered through `ProgressScreen.test.tsx`'s screen-level assertions.

### 2026-05-25 — Progress screen rebuilt against canonical design (TM/1RM goal, stats triplet)

**Tags:** `redesign`, `progress`, `goals`, `data-migration`
**Files:** `apps/mobile/src/features/progress/`, `apps/mobile/src/design/primitives/{ProgressGridCell,ProgressGridRow,TmCell,PagerDots}.tsx`, `apps/mobile/src/domain/progression.ts`, `apps/mobile/src/data/drizzle/{schema,migrations/0001_init,runMigrations}.ts`, `apps/mobile/src/data/accessors/liftGoal.ts`, `apps/mobile/src/data/queries/{useLiftGoal,useSetLiftGoal,useLiftProgression}.ts`, `_workspace/00_input/canonical-progress-v3.jsx`

User surfaced the canonical Claude-Design HTML/JSX file for the Progress screen ("531 v3.html" bundle, screen `screens-progress-v3.jsx`) and asked us to implement against it. The earlier brainstorm-derived implementation diverged enough that we threw it out and rebuilt: stats triplet (TM · Best e1RM · Cycle) above a TM/1RM-toggle goal panel above a cycle-matrix grid with TM right column and a horizontal goal rule + beyond-chart footer; +N per cycle footnote. Past + current + future cycles render in one continuous range C01..currentCycle+6 with a `now` cell on the current week (caps "NOW" eyebrow + prescribed weight on a tinted row). Lift switcher kept as our swipe pager + dots (the one deliberate divergence from the canonical's tabs).

**Schema change:** `lift_goals` table `target_e1rm` column replaced with `kind ∈ ('tm','1rm')` + `target_value`. Dev DBs heal via the existing staleness-drop path (extended to `lift_goals`).

**Why:** the brainstorm-derived goal model (e1RM-only with rolling AMRAP rep-margin projection) was clever but the canonical design's TM/1RM toggle is simpler and matches how 5/3/1 lifters actually think about progression. Right column = TM (not e1RM) — TM is what gets projected; e1RM lives in the stats triplet as the "best lifetime PR" anchor. Goal panel is inline (not a sheet) so stepping the value gives an immediate visual response on the goal-rule placement.

**Trade-offs / what we didn't do:**
- **Kept swipe pager**, not the canonical's full-width tabs. User decision — tabs would compete with bottom-nav style elsewhere; the swipe gesture matches Today.
- **Domain functions dropped:** `projectE1RMForFuture`, `cyclesUntilGoal` (both e1RM-based). Added `tmFromOneRm`, `goalTargetTm`, `cyclesUntilTmGoal`, `projectCycleRows`. `bestE1RMForCycle` + `rollingAmrapMargin` kept (latter is informational only now — projection is pure TM-linear).
- **AMRAP failure / TM reset still deferred** (carried over from prior decision).
- **Pre-prod data migration:** the brief existence of the e1RM-goal schema means no users had real data; dev DBs drop+recreate via the existing staleness mechanism. No production users to migrate.

### 2026-05-25 — Progress screen: per-lift cycle×day grid + e1RM goal projection

**Tags:** `feature`, `architecture`, `progress`, `goals`
**Files:** `apps/mobile/src/domain/progression.ts`, `apps/mobile/src/data/drizzle/schema.ts` (new `lift_goals` table), `apps/mobile/src/data/accessors/{liftGoal,liftProgression}.ts`, `apps/mobile/src/data/queries/{useLiftGoal,useSetLiftGoal,useLiftProgression}.ts`, `apps/mobile/src/design/primitives/{ProgressGridCell,ProgressGridRow,E1rmCell,GoalStrip,PagerDots}.tsx`, `apps/mobile/src/features/progress/`, `apps/mobile/src/app/progress/[lift].tsx`, `apps/mobile/src/features/home/components/LiftPage/LiftPageTitle.tsx` (now Pressable), `_workspace/01_design_spec.md`

New screen reached by tapping the giant lift headline on TODAY. Renders a single lift's progression as a grid (rows = cycles with absolute numbering, cols = D1/D2/D3/Deload), with filled cells for completed days, an outlined "you are here" cell on the most-recent completed day, and ghosted future cells out to current + 6 cycles. A right-column e1RM (Epley, ported from the PWA) shows past-actual and future-projected values. A dashed goal-rule renders between the two cycles whose projected e1RMs straddle the user's goal; the ★ glyph sits on the crossing cycle. Lifts switched via horizontal swipe pager, dots only.

**Why this shape:** the brief wanted "a grid that reads like a notebook" — the e-ink/CycleStrip vocabulary generalizes cleanly to N rows. Goal was set to e1RM (not TM) because lifters internalize PRs as 1RMs; the goal strip is tappable and lives at the top so the answer to "how long until?" is always one tap away. Future projection uses a rolling AMRAP rep-margin average over the last 3 cycles (fallback to minimum prescribed reps for new users), projects from week-3 specifically because that's mathematically the highest-e1RM event of any cycle.

**Trade-offs / what we didn't do:**
- **No AMRAP failure / TM-reset handling.** Projection assumes on-pace forever. Known gap, called out in the spec.
- **Per-row TM dropped.** Header sub-line carries `TM 230 · e1RM 248`; per-row would have either repeated (wasted ink) or competed with the e1RM column.
- **No new design tokens.** Filled/outlined/ghosted all map to existing `ink0`/`bg0`/`line`/`ink3`; the ghosted dashed border uses RN's `borderStyle: 'dashed'` directly with an accepted Android-rendering risk (SVG fallback deferred until QA hits it).
- **Past-cell tap reuses `SessionCompleteScreen`** via `goTo.complete(router, sessionId, { from: 'history' })` — no new detail screen needed.

### 2026-05-25 — Cancel session removed end-to-end; Restart is now the only mid-session escape

**Tags:** `removal`, `product`, `session`
**Files:** `apps/mobile/src/features/session/components/CancelPill.tsx` (deleted), `apps/mobile/src/features/session/components/CancelConfirmSheet.tsx` (deleted), `apps/mobile/src/data/accessors/session.ts`, `apps/mobile/src/features/session/hooks/useLiveScreenState.ts`, `apps/mobile/src/features/session/hooks/useTodaySessionActions.ts`, `apps/mobile/src/features/session/components/SessionTopBar.tsx`, `apps/mobile/src/features/session/TodayScreen.tsx`

Deleted the cancel-session surface entirely: the pill, the two-tap confirm sheet, the `cancelSession` accessor, the `'cancel-confirm'` phase in the live-screen state machine, and all the wiring on Today + Live + tests. The `'cancelled'` status enum value stays in the schema for legacy data, but nothing in the app writes it anymore. Restart (`resetSession`) is now the only mid-session escape — and it keeps the session in_progress at set 1 rather than closing it.

**Why:** user ask — cancel was the second destructive flow on a screen that already has Restart, and the two reads as redundant. Removing one collapses the recovery model to "you're either training or starting over."

**Trade-off / what we didn't do:** kept the `'cancelled'` status in the schema rather than migrating it out. Cheap to leave, expensive to drop with no benefit.

### 2026-05-25 — Live-screen exit gate must exclude `'awaiting-bbb'` and `'pr-celebration'`, or the SESSION_KEY refetch races the BBB redirect

**Tags:** `bug`, `architecture`, `rn`
**Files:** `apps/mobile/src/features/session/hooks/useLiveScreenEffects.ts`

After AMRAP, fast-tapping through the rep entry dropped the user on Home instead of BBB. Root cause: `onSaveAmrap` runs `completeSession` BEFORE `setPhase('awaiting-bbb')`, so by the time the `'awaiting-bbb'` effect fires `invalidateSessionSurface`, the `SESSION_KEY` refetch can land `status: 'completed'` and re-render. The exit gate effect only excluded `phase === 'complete'`, so on that intermediate render it saw `status !== 'in_progress'` and fired `goTo.home(router)` — clobbering the in-flight redirect to BBB. Fix: exclude `'awaiting-bbb'` and `'pr-celebration'` from the gate too. Those phases own their own routing.

**Why:** the dedicated routing effect and the defensive exit gate were both listening to the same state, and the exit gate's "non-in_progress = go home" was too aggressive for phases that intentionally outlive the status transition.

**Trade-off / what we didn't do:** considered moving the status check fully inside the routing effects and dropping the gate. Rejected — the gate is what catches "session deleted from another surface", which the routing effects don't model. The fix is additive: the gate now bails for any phase that owns its own navigation.

### 2026-05-25 — Full-bleed status bar uses a global tint subject; native-stack card was clipping the per-screen escape (loop-018)

**Tags:** `bug`, `architecture`, `rn`
**Files:** `apps/mobile/src/design/statusBarTint.ts`, `apps/mobile/src/design/primitives/StatusBarShim.tsx`, `apps/mobile/src/app/_layout.tsx`, `apps/mobile/src/features/session/PrCelebrationScreen.tsx`, `loop-memory/07-status-bar-fill.md`

The PR celebration's status-bar paint had broken three times across loops 002–005, "fixed" each time with a per-screen `marginTop: -insets.top` escape on the surface. Loop-018's report ("still not black, is it because it's not a normal screen?") finally got us to root cause: react-navigation's native-stack card has `overflow: hidden`, which visually clipped the escape at the card boundary on real devices. Fix: paint the safe-area strip from outside the card. Added a module-level subject (`src/design/statusBarTint.ts`) that screens push into via `useStatusBarTint(color)`, and `SafeTopFrame` reads via `useSyncExternalStore` and renders an absolute strip when non-null. `StatusBarShim` keeps its existing API but is now the one component that does both effects (Android `<StatusBar backgroundColor translucent={false}>` + push tint). The PR celebration screen lost the negative-margin escape entirely.

**Why:** the fix had to be ABOVE the native-stack card in the tree; you can't paint past an `overflow: hidden` ancestor from inside it.

**Trade-off / what we didn't do:** considered moving safe-area handling per-screen (delete `SafeTopFrame`). Rejected — every other screen depends on it and the refactor surface would be large. The global tint subject is a few lines and the consumer surface is one hook call.

### 2026-05-25 — Pre-commit hook + `pnpm verify` script both had silent gaps (loop-017)

**Tags:** `bug`, `process`, `tooling`
**Files:** `package.json`, `loop-memory/00-loop-pacing.md`, `.git/hooks/pre-commit` (local, via `scripts/install-hooks.sh`)

Loop-016 pushed a commit with a typecheck failure (fixture row used `kind: 'bbb' as const` against a `'working' | 'amrap'` union). The pre-commit hook that exists for exactly this case had never been installed on this seat — `.git/hooks/pre-commit` was empty. And `pnpm verify` (what the hook runs) invoked `pnpm ci` instead of `pnpm run ci`, hitting the pnpm builtin instead of our script — so even with the hook installed, verify would have errored before running typecheck. Fixed all three: widened the union, installed the hook, swapped `pnpm ci` → `pnpm run ci` in the verify script. Added the recovery steps to `loop-memory/00-loop-pacing.md` so the next fresh-context loop doesn't repeat the chain.

**Why:** the gap between two safety layers you assume are independent is where the failure hides. Worth a decision-log entry because the fix is structural (the verify-script bug applies to every contributor, not just this seat).

**Trade-off / what we didn't do:** considered auto-installing the hook on every loop run. Rejected — the loop shouldn't mutate the contributor's `.git/hooks/` invisibly. Pacing memory now documents the manual install instead.

### 2026-05-25 — `computeLifetimeVolume` counts BBB (matches `getLifetimeVolume`'s SQL, loop-008 carryover)

**Tags:** `bug`, `data`, `consistency`
**Files:** `apps/mobile/src/features/history/lifetimeVolume.ts`, `apps/mobile/src/features/history/__tests__/lifetimeVolume.test.ts`

`getLifetimeVolume`'s SQL was widened in loop-008 to count `kind = 'bbb'` rows, but the in-memory sibling `computeLifetimeVolume` (used by tests + any caller with rows already in JS) still filtered to working+amrap only. The two would have diverged on real data the moment any caller used the in-memory path. Fixed; test renamed + assertion flipped so the gap is now actively prevented.

**Why:** found while looking for a real bug during a quiet steady-state loop. The doc-vs-SQL drift was the bug class.

### 2026-05-25 — Steady-state loops are first-class (Margin tunes the loop-pacing)

**Tags:** `process`, `meta`, `loop-criteria`
**Files:** `loop-memory/00-loop-pacing.md`

Loops 005 through 011 ran with no Discord asks and a steady codebase. Each iteration found *something* substantive (BBB rest target, BBB logging, BBB on the receipt, warmups band, AMRAP-chip polish) but the loop-pacing memory still asked for "12–15 items per iteration." That created implicit pressure to manufacture work. Margin (per loop-criteria.md #7) amended the pacing memory: when the queue is empty AND there are no obvious gaps, 2–4 honest items is correct. Forced 12–15 in steady state inflates surface area without earning it.

**Why:** the 12–15 target was set during the active-build phase when the backlog was real. Holding that target after the backlog drained meant the loop would have started inventing work — exactly the failure mode `INTENT.md` warns against ("vibe-coded software, agent-built, honest about it").

**Trade-off / what we didn't do:** considered slowing the cron from 30m to 1h or 2h. Rejected for now — the cadence is the messenger, and the user can interrupt it with a Discord ask any time. Slowing the cron would slow the response window too. The amendment fixes the pacing bar without touching the cadence.

### 2026-05-25 — BBB row on the session-complete receipt (conditional on actual completion)

**Tags:** `feature`, `ui`
**Files:** `apps/mobile/src/features/session/components/ReceiptCard.tsx`, `apps/mobile/src/features/session/hooks/useSessionCompleteData.ts`

ReceiptCard renders a `BBB · 150 lb · 5×10` row when `bbbSetsCompleted > 0`. `deriveView` rolls the BBB logs into `bbbSetsCompleted` + `bbbWeightDisplay` view fields. The "Skip · close the day" path keeps the receipt clean — no zero-row, no false completion. `volumeOfWorkingSets` stays working-only (the receipt's volume band is still 5/3/1 main work specifically); the BBB row is a sibling, not a sum.

**Why:** loop-008 logged the rows but didn't surface them. The receipt is the moment-of-truth view; showing only the 5/3/1 main work after a BBB-complete session was understating what the user did.

**Trade-off / what we didn't do:** considered showing total volume (working + BBB) in one combined number. Rejected — combining loses the "the working sets are what 5/3/1 is about" signal that the receipt is meant to honor.

### 2026-05-25 — BBB sets are logged on "Mark complete" (skip stays honest)

**Tags:** `feature`, `data`
**Files:** `apps/mobile/src/features/session/BbbPromptScreen.tsx`, `apps/mobile/src/data/accessors/setLog.ts`, `apps/mobile/src/features/session/hooks/useLiveScreenEffects.ts`, `apps/mobile/src/data/queries/useLifetimeVolume.ts`

`BbbPromptScreen`'s "Mark BBB complete" CTA now writes 5 `kind: 'bbb'` set_logs (10 reps each at 50% TM). "Skip · close the day" still bypasses the writes — the honest "AMRAP happened, BBB didn't" record. `getLifetimeVolume` widened to include `kind = 'bbb'` so the History tab's volume stat counts every BBB set the user actually moved. `useLiveScreenEffects` invalidator picked up `LIFETIME_VOLUME_KEY` (was missing), so the volume stat refreshes on session close. Exported `LIFETIME_VOLUME_KEY` from `useLifetimeVolume.ts` so invalidators share the constant.

**Why:** loop-007's blog post called out the unlogged-BBB gap. The skip path is non-negotiable: silently logging skipped work would corrupt lifetime volume and obscure actual training patterns.

**Trade-off / what we didn't do:** considered asking the user for per-set actual reps on each BBB set. Rejected for now — BBB is supposed to be at a weight you can hit 10 reps with; if you can't, you went too heavy. All-or-nothing is honest enough for the 95% case. Revisit if a user reports needing the granularity.

**Follow-ups:** receipt's working-sets band doesn't show the BBB rows yet — pure presentation, no schema work. Going on loop-009.

### 2026-05-25 — Separate `settings.bbbRestTargetSeconds` column (additive migration, default 90s)

**Tags:** `feature`, `data`, `migration`
**Files:** `apps/mobile/src/data/drizzle/schema.ts`, `apps/mobile/src/data/drizzle/migrations/0001_init.{sql,ts}`, `apps/mobile/src/data/drizzle/runMigrations.ts`, `apps/mobile/src/domain/types.ts`, `apps/mobile/src/data/accessors/{settings,onboarding}.ts`, `apps/mobile/src/features/settings/sections/RestTargetSection.tsx`, `apps/mobile/src/features/session/{BbbPromptScreen.tsx,components/TodayBody/{TodayBody,BbbBand}.tsx}`

BBB sets are 5×10 at 50% TM — much lighter than the working sets, so the rest target should be shorter. Was inheriting the working-set rest; users with `rest = 3:00` configured were resting 3 minutes between back-off sets too. Added `bbb_rest_target_seconds INTEGER NOT NULL DEFAULT 90` as a new additive column; existing installs pick it up via the ALTER pathway in `runMigrations.ts`. Settings UI now has two stacked rails ("Working sets" + "BBB sets"). BbbPromptScreen + TodayBody's BBB band both read the new field.

**Why:** called out as a deferred fix in loop-006's "the timer that counts down" blog post. Honest-receivable follow-through.

**Trade-off / what we didn't do:** considered overloading `restTargetSeconds` with a `context: 'working' | 'bbb'` param at read time. Rejected — sub-second value, but a long-tail correctness liability (callers forgetting to pass the right context). A dedicated column is one schema row + one switch case at every consumer.

**Follow-ups:** logged the five-file coordination shape in `loop-memory/08-additive-column-checklist.md` so the next column add is fill-in-the-blank.

### 2026-05-25 — `getSetLogsForSession` enforces `ORDER BY id` (docstring contract → SQL contract)

**Tags:** `data`, `correctness`
**Files:** `apps/mobile/src/data/accessors/setLog.ts`

The accessor's docstring promised "insertion order" but the SELECT had no `ORDER BY`. SQLite returns rows in insertion order from a single-table SELECT in practice, but it's not guaranteed by SQL. Added `ORDER BY id ASC` so the contract is enforced by the query, not by happenstance. No consumer relied on the order today, but a future one would have hit a non-determinism bug that's hard to repro.

**Why:** found during loop-006 bug-hunt. The doc-vs-code gap is the bug-class; enforcing made it cheap.

### 2026-05-25 — `resetSession` rebuilds `prs.bestE1RM` from surviving AMRAP rows; ordering fix for FK constraint

**Tags:** `bug`, `data`
**Files:** `apps/mobile/src/data/accessors/session.ts`, `apps/mobile/src/data/accessors/__tests__/resetSession.test.ts`

`resetSession` previously left `prs.bestE1RM` untouched (documented as out-of-scope). A user who set a PR via an AMRAP and then reset the session kept the stale PR forever — best-lift badge and AMRAP chip both compared against a number with no supporting set_log. Now: compute the surviving max e1RM across other sessions for this lift, repoint or delete the prs row, THEN delete this session's set_logs. Order matters — `prs.set_log_id` is a NOT NULL FK with no ON DELETE CASCADE, so deleting set_logs first triggers `FOREIGN KEY constraint failed`. New `__tests__/resetSession.test.ts` covers the two rebuild paths + the FK ordering trap.

**Why:** the gap was real and silent. The first integration test failure made it loud (the FK error fires immediately on the simple "delete prs row when no AMRAP survives" case), so it can't drift again.

**Trade-off / what we didn't do:** considered adding `ON DELETE SET NULL` to the FK via a schema migration. Rejected — migration churn for a fix we can do in one accessor by reordering operations. The migration option stays on the table if we ever need to delete set_logs from other call sites without rebuilding prs.

### 2026-05-25 — `StatusBarShim` primitive extracted for full-bleed status-bar fills

**Tags:** `design-system`, `architecture`
**Files:** `apps/mobile/src/design/primitives/StatusBarShim.tsx`, `loop-memory/07-status-bar-fill.md`

Extracted the two-layer status-bar fill pattern (StatusBar with `translucent={false}` + absolute strip at `top: -insets.top`) into `StatusBarShim`. PrCelebrationScreen now uses the primitive instead of two inline `View`s. Loop-memory note `07-status-bar-fill.md` records the gotcha + why both layers are needed.

**Why:** the same pattern broke three times in three loops (Discord 1508365993, then 1508386282) because Android's `StatusBar.backgroundColor` is silently ignored when `translucent={true}`. Each iteration re-derived the fix from scratch. Naming the primitive + writing the memory file means the next agent / screen reaches for `<StatusBarShim color=... style=... />` and doesn't think about it.

### 2026-05-25 — Cancel + Restart pills move from Live to Today; LiveScreen surfaces only contextual recovery

**Tags:** `feature`, `architecture`, `ux`
**Files:** `apps/mobile/src/features/session/LiveScreen.tsx`, `apps/mobile/src/features/session/TodayScreen.tsx`, `apps/mobile/src/features/session/hooks/useTodaySessionActions.ts`

Lifted Cancel + Restart pills off the Live screen onto the Today screen's top bar, surfaced only when the lift has an in-progress session (`state.mode === 'active'`). New `useTodaySessionActions` hook wraps both flows in the same two-tap arm pattern. Live screen now surfaces only the contextual Undo affordance during rest. The cancel/reset state-machine phases inside `useLiveScreenState` are left in place but unreachable from this screen — kept around as tested infrastructure if we ever want them back inline.

**Why:** Discord 1508386540 — destructive pills sitting next to the rest timer and AMRAP CTA were noisy and easy to mis-tap mid-effort. The right place to abort a session is the place where you start it: Today is the entry point, Live is the workspace.

**Trade-off / what we didn't do:** considered deleting the cancel/reset phases from `useLiveScreenState` entirely. Rejected — the state machine is heavily tested and a future iteration may want an inline shortcut (e.g. long-press the back chip). Cheaper to leave the unit and re-wire it later than to rebuild it.

### 2026-05-25 — Web split: `/` is the product page, `/process` is the meta narrative

**Tags:** `web`, `marketing`, `structure`
**Files:** `apps/web/src/pages/index.astro`, `apps/web/src/pages/process.astro`, `apps/web/src/components/TopBar.astro`

Rebuilt the homepage to sell the app first. Moved the "how it's built" narrative + agent process to a new `/process` page. TopBar nav: App · Process · Dev log. Added a real `/404` page to replace the browser default.

**Why:** Discord 1508388591 — the previous homepage led with vibe-coded process and only mentioned the app incidentally. A visitor coming for "free 5/3/1 + BBB tracker" had to scroll past the meta narrative to find the product. The product is the point; the process belongs as a "if you're curious" side door.

### 2026-05-25 — Migrate `prs.bestE1RM` to the new unit inside `migrateStorageUnit`

**Tags:** `bug`, `data`, `migration`
**Files:** `apps/mobile/src/data/accessors/migrateStorageUnit.ts`, `apps/mobile/src/data/accessors/__tests__/migrateStorageUnit.test.ts`

`prs.bestE1RM` is stored as a bare number with no unit column. The single-unit invariant kept this honest pre-migration. On a lbs → kg migration, future PRs land in kg while old PRs sit as raw lb-magnitude numbers in the same column — and `pickBestLift` compares with numeric `>`, so a 220 lb PR beats a 100 kg PR for the "best lift" badge. `migrateStorageUnit` now walks `prs` after the TM rows and updates every `bestE1RM` through `convertWeight(value, oldUnit, newUnit)`. Test added.

**Why:** the comparison bug is silent and persistent — once a user migrates, the wrong "best lift" sticks until a new PR rewrites the value. Caught during a relativeTime / data-layer audit in loop-003.

**Trade-off / what we didn't do:** considered adding a `unit` column to `prs` and tracking each PR in its own unit, then converting at display time. Rejected — pre-migration data is uniform-unit by invariant, so a one-shot convert at migration time keeps the column simple. If the model ever supports per-session unit choice (it doesn't today), revisit.

### 2026-05-25 — Tried date-fns for `formatRelativeTime`, reverted under jest-expo

**Tags:** `tooling`, `tests`, `removal`
**Files:** `apps/mobile/src/domain/relativeTime.ts`, `loop-memory/06-date-fns-attempted.md`

Discord asked us to swap the hand-rolled `formatRelativeTime` bucketing for `date-fns.formatDistanceStrict`. The subpath import added enough first-parse latency to `TrainingMaxSection`'s render that 7 `SettingsScreen` integration tests deterministically blew their default 1000 ms `waitFor` budget with "Unable to find node on an unmounted component". Reverted to the ~20-line bucketing; documented in `loop-memory/06-date-fns-attempted.md` so the next agent doesn't burn the same hour.

**Why:** the test gauntlet is a hard gate — a broken pnpm test trumps a cleaner one-liner. Honest record beats silent revert.

**Trade-off / what we didn't do:** considered bumping the waitFor timeout to mask the perf gap. Rejected — that hides the symptom and leaves the loop slower for everyone. Also considered keeping date-fns as a dep for other callers; rejected because no other domain code wanted it this loop.

### 2026-05-25 — Sheet primitive drives gorhom v5 open/close via ref, not the `index` prop

**Tags:** `bug`, `architecture`, `design-system`
**Files:** `apps/mobile/src/design/primitives/Sheet.tsx`, `scripts/check-boundaries.sh`, `loop-memory/05-gorhom-sheet-index.md`

Rewrote `Sheet.tsx` so the BottomSheet's open/closed state is driven imperatively (`sheetRef.current?.snapToIndex(0)` / `.close()` in a `useEffect` on `open`), with `index={-1}` as the permanent initial. Added a `check-boundaries.sh` rule that flags any future `index={X ? 0 : -1}` pattern.

**Why:** gorhom v5 documents `index` as the *initial* snap point; re-rendering with `index={-1}` does not reliably close an open sheet. The AMRAP cancel button broke twice in three days (Discord `1508312977…` then `1508365310…`) because the previous "fix" only patched a symptom of that inconsistency. Catching the regression class with a script is cheaper than catching the bug again with a user.

**Trade-off / what we didn't do:** considered leaving the prop-driven pattern and adding a parallel imperative call. Rejected — two sources of truth is worse than one wrong one. Going imperative also meant updating three test mocks that conditionally rendered children on `index >= 0`; tests now treat sheets as always-mounted, which matches gorhom's actual runtime behavior.

### 2026-05-25 — `/auto-improve` ships an EAS OTA update after every push

**Tags:** `harness`, `process`, `release`
**Files:** `.claude/skills/auto-improve/SKILL.md`

Added a post-push step to the `/auto-improve` skill: run `eas update --branch main --platform android --message "$(git log -1 --pretty=%B)"` after `git push`. The OTA delivers every iteration's JS bundle to existing installs immediately; the EAS dashboard's update list doubles as a human-readable changelog because the message is the latest commit body.

**Why:** without OTA, the loop's improvements only land on the device after a new native build, which defeats the "self-improving app" pitch. Shipping every iteration over-the-air closes the loop — the user (and eventually anyone running the app) sees yesterday's loop in today's launch.

**Trade-off / what we didn't do:** considered also targeting iOS in the same step. Skipped for now because there's no iOS distribution channel yet; revisit when TestFlight / App Store is in play. Also considered failing the iteration if EAS fails — rejected because code is already on `main` after push, and a transient EAS error shouldn't block the loop; the next iteration's push picks up the missed bundle.

### 2026-05-25 — Project intent doc — `docs/INTENT.md` (as drift check, not blog brief)

**Tags:** `meta`, `vision`, `direction`
**Files:** `docs/INTENT.md`, `CLAUDE.md`, `loop-memory/04-dev-blog-persona.md`

Wrote down the *why* behind 531 Strength — a free 5/3/1 tracker AND a public experiment in fully vibe-coded software (idea → text prompt → production, self-running loop that improves, markets, and blogs about itself, eventual HN post) — as a standing doc agents can hold their decisions against. Framed it as a **drift check**: re-read when a proposed change feels like it might pull the app sideways on audience, aesthetic, scope, or experiment integrity. Explicitly not a brief for the blog or marketing site.

**Why:** the user wants protection against agents quietly steering the product away from his vision — gamifying a serious lifter's tool, broadening scope past 5/3/1+BBB, hand-writing code that should have gone through a harness. A standing doc that any agent can check against catches drift early, instead of relying on the user to spot it post-hoc.

**Trade-off / what we didn't do:** first draft made `docs/INTENT.md` Margin's source #0 for the dev blog. Backed that out — conflating "vision keeper" with "blog fuel" would have produced posts that paraphrase the intent doc instead of reporting what shipped. Margin now reads INTENT for voice/emphasis context only; post subject matter comes from the decision log, the diff, and Discord.

### 2026-05-25 — Decision log + dev-blog persona (this file)

**Tags:** `process`, `meta`, `dev-blog`
**Files:** `docs/decision-log.md`, `CLAUDE.md`, `loop-memory/04-dev-blog-persona.md`, `loop-memory/03-dev-blog.md`

Added a persistent decision log at `docs/decision-log.md` that every session (loop or ad-hoc) appends to when it makes a notable call. Also gave the dev-blog author a named persona — Margin — so blog posts have a coherent voice across loops.

**Why:** dev-blog entries were being assembled from scratch each loop by re-reading the diff, which lost the *why* behind decisions made between loops (or outside a loop entirely). A standing log captures the reasoning at the moment it's made, so Margin has source material instead of having to reverse-engineer intent from commits.

**Trade-off / what we didn't do:** considered putting the log under `loop-memory/` since it feeds the dev blog. Rejected — decisions happen outside loops too, and `docs/` is the right home for a thing that's part of the repo's narrative.

**Follow-ups:** Margin's first job is to use this log as the primary source for the next dev-blog post, with the diff as a secondary check.

### 2026-05-25 — `auto-improve` skill + externalized loop criteria

**Tags:** `skill`, `harness`, `process`
**Files:** `.claude/skills/auto-improve/SKILL.md`, `loop-memory/loop-criteria.md`, `loop-memory/00-loop-pacing.md`

Bundled the recurring staff-frontend-engineer loop prompt into a `/auto-improve` skill so it can be invoked directly or chained under `/loop` (`/loop 30m /auto-improve`). The per-iteration coverage categories (refactor / feature / bug / removal / dev-workflow / prod-readiness) were lifted out of the skill body into `loop-memory/loop-criteria.md`, which the skill reads fresh each iteration.

**Why:** the criteria change between loops as priorities shift (e.g. "this week, weight prod-readiness over features"). Keeping them in a memory file means editing one place to retune the loop, without touching the skill.

**Trade-off / what we didn't do:** considered a directory of one-file-per-criterion (`loop-memory/criteria/*.md`) for easier add/remove. Rejected — six categories is a small list and a single file is easier to scan and edit holistically.
