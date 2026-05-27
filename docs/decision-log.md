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

### 2026-05-27 — TM suggestion UI: visual variants + in-place apply sheet (expedition 13)

**Tags:** `feature`, `session`, `architecture`
**Files:** `apps/mobile/src/features/session/components/TmAdjustmentNote.tsx`, `apps/mobile/src/features/session/components/TmApplySheet.tsx`, `apps/mobile/src/features/session/SessionCompleteScreen.tsx`

The TM suggestion card on Session Complete now has visual variants: inverted (ink0 bg, paper text) for increment suggestions — mirroring the PR Certificate — and amber background for reset suggestions. Tapping opens a `TmApplySheet` that previews the current → new TM and applies the change directly via `setTrainingMax`, replacing the old pattern of navigating to Settings.

**Why:** Discord 1509328872 — the suggestion card was invisible and unintuitive. The inverted card for a PR-like "go up" moment mirrors the PR Certificate's celebration treatment; the amber signals a downward correction. The apply sheet removes the friction of navigating to Settings to manually enter the same value the system already computed.

**Trade-off / what we didn't do:** The apply sheet for `hold` is a no-op (no DB write, just closes). Could be suppressed entirely but the user tapped the card expecting interaction — closing with "No change" is more informative than nothing happening.

### 2026-05-27 — TTS read-aloud expanded: sign-off required, tone variability (expedition 13)

**Tags:** `skill`, `blog`, `process`
**Files:** `.claude/skills/commission-expedition-log/SKILL.md`

Updated the TTS read-aloud section in `commission-expedition-log` from "two short sentences, ~30 words" to 4–6 sentences (~60–90 words). The Logger must now close with a required verbatim sign-off: "Signing off — [Name], Logger of Expedition [N]. For those who come after." The style guidance now explicitly permits — and encourages — non-gloomy registers: wry, flat, proud, exhausted-but-amused.

**Why:** Discord 1509329727 — the TTS was too short and too uniformly solemn. The sign-off was inconsistently applied; making it required ensures bit continuity. Tone variation ensures the ambient track doesn't become a drone.

### 2026-05-27 — Cut the cross-stack fill-in animation; rebuild it cell-local

**Tags:** `bug`, `architecture`, `removal`, `animation`
**Files:** `apps/mobile/src/features/session/sessionCompletedSignal.ts` (deleted), `apps/mobile/src/features/progress/components/JustCompletedAnimator.tsx` (new), `apps/mobile/src/features/progress/components/ProgressLiftPage.tsx`, `apps/mobile/src/features/progress/components/ProgressLiftRow.tsx`, `apps/mobile/src/features/session/SessionCompleteScreen.tsx`, `apps/mobile/src/app/routes.ts`

The "black screen on consecutive close-the-day" bug had been "fixed" three times (c379aa5 reversed dismiss/navigate order, 440c63c added a reset timer, fff1cfd reversed back), and the regression returned each time. Per the systematic-debugging skill's 3+ fixes rule, stopped patching and questioned the architecture. The structural fault was a module-level signal store (`sessionCompletedStore`) driving a Reanimated worklet on a tab screen that never unmounts: when progression data refetched mid-navigation, `Animated.View` keys churned around the same shared values, and Reanimated 4 on the New Architecture surfaced this as "Should not already be working" + "passing animated style to a non-animated component" — rendering the Progress tab black.

Two commits:
1. **Cut** (commit 988dd98) — deleted the signal store, `useFillInStyle`, `usePulseStyle`, the `playLastDoneAnimation` state, and the timer reset. ~200 lines removed, 8 added. Crash gone; Progress cells render statically.
2. **Rebuild** (this commit) — `goTo.progress(..., { justCompleted: sessionId })` carries the id as a route param. `ProgressScreen` reads it from `useLocalSearchParams` and forwards it only to the lift in the URL. `ProgressLiftRow` wraps the matching cell in a new feature-layer `JustCompletedAnimator` keyed on the sessionId; mount runs the fill-in once, unmount cancels animations. Added `scrollRef` + per-row `onLayout` capture in `ProgressLiftPage` so the active cycle row scrolls into view once measured (keyed by `${lift}:${currentCycle}` so swipes and cycle advances re-snap but data refetches don't fight the user's scroll position).

**Why:** Route params are tied to navigation events, not module state. They don't fire signals mid-stack-dismissal, they're naturally scoped to a single navigation, and they retire automatically when the user navigates again. Cell-local Animated.Views have a clean React lifecycle: new sessionId → new key → fresh mount → fresh animation. There is no across-session state for the Reanimated runtime to confuse.

**Trade-off / what we didn't do:** Considered keeping the module store and patching the reset-timer race directly (Fix #4). Rejected: the runtime crash was downstream of a stable Animated.View instance fighting a key change during navigation, not the timer per se. Three prior fixes had each rearranged surface mechanics without touching that root, and each had regressed. The cut was the only fix that survives future changes to dismiss-order, tab config, or Reanimated upgrades.

**Follow-ups:** None. The "scroll further down to the next-session cell after fill-in" idea was discussed but not built — the active-cycle scroll already lands the just-completed cell in viewport because the just-completed session is in the active cycle.

### 2026-05-27 — Shared `LogSheetFooter` + `useLogSheetState` extractions (expedition 11)

**Tags:** `refactor`, `architecture`, `removal`
**Files:** `apps/mobile/src/features/session/components/LogSheetFooter.tsx`, `apps/mobile/src/features/session/hooks/useLogSheetState.ts`

Extracted a shared `LogSheetFooter` component (Cancel + Save button pair) that both the AMRAP sheet and the TM Test sheet now use — they were identical except for testID strings and accessibility labels. Also extracted `useLogSheetState` as the shared hook body; `useAmrapLogState` and `useTmTestLogState` are now thin wrappers that differ only in `initialReps` (prescribed vs. 0). Removed `AmrapFooter.tsx` and `TmTestFooter.tsx`. Also replaced the identical `sectionHeader` raw-RNText style in `ReceiptCard` and `TmTestReceiptBand` with the `CapsLabel` primitive.

**Why:** The TM Test Week feature (expedition 10) correctly modeled itself after the AMRAP sheet for consistency, but the copy-then-diverge approach left four files with near-identical implementations. A future change to the button style or the save guard would have needed four edits instead of one.

**Trade-off / what we didn't do:** Considered keeping `AmrapFooter` and `TmTestFooter` as thin wrappers over `LogSheetFooter` to avoid updating callers. Rejected — the wrappers would still be duplicate files with no independent value. Updating the two call sites is cheaper than carrying three files forever.

### 2026-05-27 — `useRef` guard against spam-tap on Begin CTA (expedition 11 pre-work)

**Tags:** `bug`, `session`, `concurrency`
**Files:** `apps/mobile/src/features/session/hooks/useTodayScreenState.ts`, `apps/mobile/src/features/session/hooks/useLiveScreenEffects.ts`

Added a synchronous `useRef` guard (`inFlightRef`) to `useTodayScreenState.onPressCta`. Two taps within a single render cycle both saw `starting === false` (React state is async) and both ran the preview branch, pushing duplicate `/session/live` entries with the same `sessionId`. After AMRAP save, the hidden lower `LiveScreen`'s exit gate saw `sessionStatus` flip to `'completed'` and `replace()`'d the visible route back to `/`, bouncing the user home. Added `useIsFocused()` guard in `useLiveScreenEffects` as defense-in-depth so any future duplicate-stack path can't trigger the exit gate from a non-focused screen.

**Why:** Discord 1508935260 — "if I press Begin session and every CTA until the AMRAP logging, it goes straight back to Home screen instead of completion screen." The root cause was React state not being synchronous; the fix is a ref that flips synchronously inside the handler.

**Trade-off / what we didn't do:** The `starting` state stays (drives the disabled-button UI); the `inFlightRef` is the actual concurrency lock. Two sources of truth for "is a session starting" is a small smell, but the alternatives (`useReducer`, a context-level lock, optimistic routing) were heavier than the symptom warranted.

### 2026-05-27 — Reverted session→tabs navigation order: dismiss-first, then navigate

**Tags:** `bug`, `navigation`, `session`
**Files:** `apps/mobile/src/features/session/SessionCompleteScreen.tsx`

Restored the dismiss-first pattern for the "Close the day" CTA in `SessionCompleteScreen`. A prior fix (loop-017, Discord 1509123493) reversed the order to `navigate() first, dismissAll() after` to avoid a brief flash, but `router.navigate('/(tabs)/progress')` from inside the `session` group does not reliably switch the active tab in the parent `(tabs)` navigator — the navigation action doesn't propagate to the right navigator scope.

**Why:** Discord 1509284142 — "A recent change makes completing a session no longer go to the Progress page." The dismiss-first rule was already documented in `loop-memory/12-cross-stack-navigation.md` but the loop-017 fix violated it anyway in pursuit of the UX polish.

**Trade-off / what we didn't do:** The brief flash after dismissAll but before the tab switch is back. Investigated `router.navigate()` with `segments`/`relativeToDirectory` options — Expo Router v3 does not expose those reliably from a nested group context. Dismiss-first is the documented correct pattern.

### 2026-05-27 — Removed permanently-dead cycle-progress fields from History data layer

**Tags:** `removal`, `history`
**Files:** `apps/mobile/src/features/history/hooks/useHistoryScreenData.ts`, `apps/mobile/src/features/history/components/AchievementStrip.tsx`, `apps/mobile/src/features/history/components/AchievementCaptions.tsx`, `apps/mobile/src/features/history/HistoryScreen.tsx`

Removed `sessionsThisCycle`, `cycleTotalSessions`, and `currentCycle` from the History data hook's return shape and from every component that accepted them. All three values were always `undefined` — the "cycle progress" caption in `AchievementCaptions` was permanently hidden.

**Why:** Per-lift cycle tracking replaced the legacy single-cycle field. The three fields were left in place with `undefined` values and apologetic comments ("kept so callers don't lose the field name"), which was honest but still dead code. Removing them cuts noise from every call site.

**Trade-off / what we didn't do:** Could have kept them as optional props forever. The convention of "mark undefined, keep the shape" drifts into API pollution — the comments were already signalling the cost.

### 2026-05-27 — Fixed `playLastDoneAnimation` not replaying on consecutive sessions

**Tags:** `bug`, `progress`
**Files:** `apps/mobile/src/features/progress/components/ProgressLiftPage.tsx`

Added a 1200 ms `setTimeout` reset that flips `playLastDoneAnimation` back to `false` after the fill-in + pulse animation finishes (~880 ms). Without the reset, completing a second consecutive session for the same lift called `setPlayLastDoneAnimation(true)` when the value was already `true` — React skips the state update as a no-op, so the animation hooks never re-ran.

**Why:** The fill-in animation is the only feedback that a session was just logged when arriving on the Progress tab. Silently not playing on the second consecutive session made the tab feel stale.

### 2026-05-27 — Replace all Reanimated `entering` props with explicit hook-based animations

**Tags:** `bug`, `architecture`, `reanimated`
**Files:** `apps/mobile/src/features/session/components/PRCertificate/PRCertificate.tsx`, `apps/mobile/src/features/session/components/PrCelebration/PrCelebrationSkeleton.tsx`, `apps/mobile/src/features/shared/LiftTab.tsx`, `apps/mobile/src/features/progress/components/ProgressLiftRow.tsx`, `apps/mobile/src/features/progress/components/ProgressLiftPage.tsx`

Replaced all uses of the `entering={FadeIn/FadeInDown}` declarative prop with explicit `useSharedValue` + `useEffect` + `cancelAnimation` animations throughout the session and progress surfaces. Also fixed `ProgressLiftPage` to use `useSyncExternalStore` for post-session animation instead of a `useEffect([lift])` that silently no-ops on second consecutive sessions.

**Why:** Production crash: "Should not already be working." Reanimated's layout-animation registry is stateful. When `PRCertificate` unmounts mid-navigation (user navigates away during a session) and remounts on the *next* session, the registry still holds the prior entry. On second mount the `entering` prop tries to re-register — the registry refuses. Explicit animations with `cancelAnimation` in their cleanup have no registry and can re-run cleanly on every mount.

**Trade-off / what we didn't do:** Considered patching via `LayoutAnimationConfig.skipEntering(true)` before the problematic remounts — rejected because it's a global flag with imprecise timing and would suppress other valid animations. Explicit hooks are surgical and testable.

**Follow-ups:** If any future component needs an entrance animation, use `useSharedValue + useEffect + cancelAnimation` — not the `entering={}` prop.

### 2026-05-27 — Website hero updated for iOS/Android equal emphasis; hero copy fixed

**Tags:** `web`, `convention`
**Files:** `apps/web/src/pages/index.astro`, `apps/web/src/pages/process.astro`

Added an "iOS · App Store Soon" ghost pill alongside the Android APK download in the hero and sign-off sections so both platforms get equal visual weight. Updated the hero lede copy to say "iOS App Store submission is in progress" instead of the previous claim that it was already on the App Store and Play Store. Also fixed the hardcoded "1.0.2 · cycle 4" version in `process.astro`'s colophon (actual version is 1.0.0).

**Why:** Discord task: "iOS and Android should be the same emphasis." The prior design buried iOS in body text while Android got a concrete download CTA. Equal emphasis = both get a pill-shaped affordance of equal visual weight.

### 2026-05-27 — Official app name "531 Strength" applied across website meta + app.json

**Tags:** `web`, `convention`, `store`
**Files:** `apps/web/src/layouts/Base.astro`, `apps/web/src/pages/rss.xml.ts`, `apps/web/src/components/TopBar.astro`, `apps/web/src/components/Footer.astro`, `apps/mobile/app.json`, `apps/web/src/pages/process.astro`, `apps/web/src/pages/blog/expedition-logs.astro`

The official product name is "531 Strength". Updated `og:site_name`, RSS feed title, page `<title>` tags, default meta description, and `app.json` to use the full name consistently. The website wordmark ("531·LEDGER") is a design-identity element for the site and was intentionally left unchanged.

**Why:** User confirmed the name via Discord. The website had a mix of "531" and "531 Strength" — the OG social-sharing card in particular still said just "531".

### 2026-05-27 — `SessionCompleteTitle` prop renamed `week` → `cycleDay`; text fixed to say "day N"

**Tags:** `convention`, `refactor`
**Files:** `apps/mobile/src/features/session/components/SessionCompleteTitle.tsx`, `apps/mobile/src/features/session/SessionCompleteScreen.tsx`

Renamed the `week` prop to `cycleDay` to match the UI terminology change (cycles use "days" not "weeks"). Fixed the rendered text from "squat day, week 1" to "squat day, day 1" for consistency with the rest of the UI (CycleStrip, Settings section, Progress grid).

**Why:** Prior loop changed Settings and Progress to say "days" but missed the session complete screen. The prop name "week" was also semantically off — it holds a cycle-day number (1–4), and naming it "week" would mislead any future reader.

### 2026-05-27 — Removed unused `PagerDots` design primitive

**Tags:** `removal`
**Files:** `apps/mobile/src/design/primitives/PagerDots.tsx`, `apps/mobile/src/design/primitives/index.ts`

Deleted `PagerDots` from the design system. The primitive was exported in the barrel but had zero feature-level importers (confirmed by grep). No test, no usage.

**Why:** Dead surface area in the design system. Keeping unused primitives misleads future engineers into thinking the component is used or maintained. Deletion is reversible if a real consumer appears.

### 2026-05-27 — `LOWER_BODY` exported from domain; duplicate feature-level definitions removed

**Tags:** `domain`, `refactor`, `removal`
**Files:** `apps/mobile/src/domain/increments.ts`, `apps/mobile/src/features/settings/sections/ActiveLiftsSection.tsx`, `apps/mobile/src/features/settings/sections/ProgressionRulesSection.tsx`

Exported `LOWER_BODY` (the `Set<Lift>` encoding which lifts use larger cycle increments) from `domain/increments.ts` and removed the two identical private copies in `ActiveLiftsSection` and `ProgressionRulesSection`. Both feature files already imported `tmIncrement` from the same domain module — the local set was pure duplication.

**Why:** Three identical `ReadonlySet<Lift>` literals with the same values. Any future change to what counts as "lower body" (e.g. OHP were moved) required three edits. Domain constants belong in domain.

### 2026-05-27 — Dead `LIFTS` export removed from `domain/types.ts`; `DEFAULT_LIFTS` in history screen replaced with canonical import

**Tags:** `removal`, `domain`
**Files:** `apps/mobile/src/domain/types.ts`, `apps/mobile/src/features/history/hooks/useHistoryScreenData.ts`

`domain/types.ts` exported `LIFTS` in 5/3/1 programming order (`['press', 'deadlift', 'bench', 'squat']`) — a different ordering from `domain/labels.ts`'s `LIFTS`. No feature code imported the types.ts version. Removed it. `DEFAULT_LIFTS` in the history screen (an inline `['squat', 'bench', 'deadlift', 'press']`) replaced with an import of `LIFTS` from `domain/labels`.

**Why:** Two exports with the same name and different values in peer domain modules is a trap. The types.ts version had no importers (confirmed by grep). Dead code removed; inline fallback consolidated with the canonical label-ordered `LIFTS`.

### 2026-05-27 — Privacy policy page added at `/privacy`

**Tags:** `web`, `store`
**Files:** `apps/web/src/pages/privacy.astro`, `apps/web/src/components/Footer.astro`

Added a simple privacy policy page at `/privacy` describing the app's data posture (none — local SQLite only, no analytics, no accounts, OTA-update metadata only). Added link to the footer's "Et cetera" column.

**Why:** App Store and Play Store require a privacy policy URL for any submitted app. Without it, store review is blocked.

### 2026-05-27 — Git commit email changed to GitHub noreply format to unblock Vercel

**Tags:** `process`, `deployment`
**Files:** `.git/config`

Changed `git config user.email` from `loop@531.dev` to `1242663+alexcheuk@users.noreply.github.com`. Vercel's deployment protection matches commit authors against GitHub accounts; `loop@531.dev` has no GitHub account behind it and was blocking every push from deploying.

**Why:** Alex reported in `#task-queue` that Vercel was refusing to deploy. The noreply email format (`{user_id}+{username}@users.noreply.github.com`) is how GitHub surfaces commits from the privacy-email-on setting — it resolves back to the `alexcheuk` account, which Vercel can match.

**Trade-off / what we didn't do:** Could have added `loop@531.dev` as a secondary GitHub email or disabled Vercel's deployment protection check. Both require access to external settings the loop seat doesn't have. The git-config change is local and reversible.

### 2026-05-27 — process.astro updated to reflect expedition/Logger era

**Tags:** `web`, `meta`
**Files:** `apps/web/src/pages/process.astro`

Updated the `/process` page's loop-diagram step 4 ("verso (scribe)" → "the logger"), the expanded loop steps section (replaced "Hand it to Verso" with expedition framing and a link to `/blog/expedition-logs`), and the persona section (reflected Verso's promotion to Paintress; added an expedition-note callout with link to expedition logs).

**Why:** The page still described Verso as the scribe writing each post, which became stale after the Logger era started on 2026-05-27. Alex asked to update it and add a link to the expedition logs.

### 2026-05-26 — `LiftTabs` moved from `home` to `shared` (boundary violation fix)

**Tags:** `architecture`, `refactor`
**Files:** `apps/mobile/src/features/shared/LiftTabs.tsx`, `apps/mobile/src/features/shared/LiftTab.tsx`, `apps/mobile/src/features/shared/__tests__/LiftTabs.test.tsx`

`ProgressScreen` was importing `LiftTabs` from `features/home/components/` — a cross-feature import that violated the one-way boundary rule. Moved both components and the test to `features/shared/`. Both `HomeScreen` and `ProgressScreen` now import from `@/features/shared/LiftTabs`.

**Why:** the CLAUDE.md boundary rules say features are peers; a feature importing from another feature creates an implicit dependency that makes the codebase fragile to refactors.

### 2026-05-26 — Reanimated black screen fix: `cancelAnimation` on unmount

**Tags:** `bug`, `session`, `animation`
**Files:** `apps/mobile/src/features/session/PrCelebrationScreen.tsx`

Added `cancelAnimation(scale)` / `cancelAnimation(opacity)` in the cleanup return of `useScaleStyle` and `useFadeStyle` hooks. Without cleanup, in-flight `withTiming` animations were left running after the screen unmounted, causing a `ReanimatedError: Perhaps you are trying to pass an...` crash on the second consecutive PR session.

**Why:** Reanimated 4 is stricter about orphaned shared-value animations. The crash manifested only on the 2nd+ session because the first session's animations had time to settle before unmount; back-to-back sessions hit the edge case reliably.

### 2026-05-27 — Renamed `post-as-verso` skill to `commission-expedition-log`

**Tags:** `skill`, `convention`, `meta`
**Files:** `.claude/skills/commission-expedition-log/SKILL.md` (renamed from `.claude/skills/post-as-verso/SKILL.md`), `.claude/agents/verso.md`, `CLAUDE.md`, `loop-memory/{03-dev-blog,04-dev-blog-persona,14-lore,loop-criteria,notes-from-alex}.md`, `.claude/skills/rn-design-audit/SKILL.md`

Reversed the same-day decision to keep the `post-as-verso` skill name "for call-site stability." On audit, the cascade was 14 markdown references and zero code — the three orchestrator skills (`auto-improve`, `initial-implement`, `rn-expo-pipeline`) don't name the skill at all; they let Claude pick it up by description. The "call-site stability" claim was imagined.

The new name describes what the skill does (commission an expedition log) rather than what voice the post will be in. The `post-as-X` pattern ties a skill to a single persona, which directly conflicts with the rotating-Logger frame just landed. Any future `post-as-<persona>` skill name is a smell.

**Trade-off / what we didn't do:** Did not rename `.claude/agents/verso.md`. The agent file represents Verso the Paintress (the constant who summons each Logger), and `verso.md` is the right name for that role. Skills should be persona-neutral; agent files can be tied to characters that persist across handoffs.

### 2026-05-27 — Dev blog reframed as Expedition Logs (Verso promoted to Paintress)

**Tags:** `meta`, `web`, `persona`, `convention`
**Files:** `loop-memory/14-lore.md`, `loop-memory/04-dev-blog-persona.md`, `loop-memory/03-dev-blog.md`, `loop-memory/notes-from-alex.md`, `.claude/agents/verso.md`, `.claude/skills/post-as-verso/SKILL.md`, `apps/web/src/content.config.ts`, `apps/web/src/lib/posts.ts`, `apps/web/src/components/ScopeFilter.astro`, `apps/web/src/pages/blog/expedition-logs.astro`, `apps/web/src/pages/blog/index.astro`, `CLAUDE.md`, `apps/web/src/content/blog/2026-05-27-<slug>.md` (Verso's promotion post)

The dev blog now sits inside a fiction: every loop's post is a **field log** written by **the Logger of Expedition N**, a rotating anonymous doomed character. Verso, the previous scribe, is promoted to **Paintress** in the lore — he relays Alex's tasking and presides over the gommage, but he no longer writes posts. Alex is never named in body from this date forward; the expeditioners do not know Alex exists. The motto `For those who come after.` closes every Logger entry, above a `— <one-off name>, Logger of Expedition N` sign-off. A new filter page `/blog/expedition-logs` carries a colophon explaining the frame to first-time visitors, plus three e-ink-respecting easter eggs (Plex Mono body, per-row expedition stamp, `— archived, expedition 33` colophon footer).

**Why:** the blog has been good but the framing has been a single named persona (Margin → Verso) that gets shaky with rotation. Loggers are honest about what the loop actually is — fresh-context Claude agents that come and go each loop. The motto + field-log frame turn the rotation from a liability into the *point*. It also gives Verso a clearer fictional role (the Paintress, the relay) without forcing him to be the chronicler of work he didn't ship.

**Trade-off / what we didn't do:**
- Rejected renaming `rn-designer`/`rn-frontend`/`rn-qa` agent files to Designer/Painter/Inspector. Narrative-only reskin — the agents stay utilitarian under the hood.
- Rejected continuing the loop-number-as-expedition-number scheme; Expedition 1 begins fresh, `loopId` continues its existing numbering in parallel. The two diverge by a fixed offset and that's fine.
- Rejected a stable named Logger character; rotating anonymous is closer to the truth of the system and gives more voice variety.
- Rejected animated easter eggs (gommage-fade on sign-offs, smoke effects). They would have broken the e-ink restraint.

**Follow-ups:**
- Verso's promotion post ships in this commit (off-cycle, `scope: ['meta']`, written as Verso, the last time Alex appears in any post).
- First real Logger post ships in the next live loop under the new regime.
- After three Logger posts have landed, read them back-to-back and check for voice averaging — if the three registers are indistinguishable, tighten the persona doc with concrete register examples.

### 2026-05-27 — Fix consecutive-session black screen via `navigate()` over `replace()`

**Tags:** `mobile`, `bug-postmortem`, `navigation`
**Files:** `apps/mobile/src/app/routes.ts`, `apps/mobile/src/features/session/SessionCompleteScreen.tsx`

`goTo.progress()` was using `router.replace()` to land on the Progress tab after closing a session. On the second consecutive session, `dismissAll()` popped back to `/session/today` and `replace()` pushed a second `/(tabs)` entry into the root stack — two mounted tab navigators, black screen. Fixed by switching the default to `router.navigate()`, which finds the existing `(tabs)` entry in the root stack and routes to it rather than pushing a duplicate.

**Why:** `replace()` always creates a new history entry; `navigate()` deduplicates by finding the existing route in the stack first. The bug only appeared on the second consecutive session because the first session built the root stack correctly; it was the re-entry that clobbered it.

**Trade-off / what we didn't do:** Considered clearing the whole root stack first, but that would kill any "back" affordance from the Progress tab to the home screen. `navigate()` is the minimal change.

---

### 2026-05-27 — Replace Week 4 deload with TM Test Week (Wendler's 7th Week Protocol)

**Tags:** `mobile`, `domain`, `architecture`, `5/3/1`
**Files:** `apps/mobile/src/domain/{schemes,progression,labels,types}.ts`, `apps/mobile/src/data/{drizzle/schema,accessors/liftProgression,queries/useLiftProgression}.ts`, `apps/mobile/src/features/session/components/{TmTestLogSheet,TmTestReceiptBand,TmAdjustmentNote,TodayBody/TmTestNote}.tsx`, `apps/mobile/src/design/primitives/{ProgressGridCell,TopSetBlock}.tsx`, `_workspace/01_design_spec.md`

The Original 5/3/1 deload (40/50/60% × 5 working sets) was mechanically redundant with the warmup ramp (40/50/60% × 5/5/3) — the lifter ramped to 60% × 3, then re-ramped to 60% × 5. Six sets, top weight ~2 reps apart. Replaced Week 4 with the **7th Week TM Test Protocol** from *Forever 5/3/1*: warmups unchanged, then a single bounded set at 100% TM with a 3–5 rep target. BBB hard-skipped on W4. Post-session a calm TM-adjustment note suggests `+5/+10`, `Hold`, or `−10% reset` depending on reps achieved — never auto-applied. New `'tm-test'` `SetKind` joins the enum; legacy `'working'` deload rows kept forward-only (old visual preserved). Migration was zero-SQL — the existing `kind` column has no CHECK constraint, so the union widening is type-only.

**Why:** the user (chasing 225 → 315 bench) noticed mid-session that the deload week's working sets were essentially a second warmup. Confirmed by reading the schemes file — same percentages, ~2 reps apart. The deload was a ghost week. Wendler himself moved away from it in *Forever 5/3/1*; the TM Test gives Week 4 a purpose (verify the TM the lifter has been working off for three weeks) without breaking the calm e-ink-logbook feel.

**Trade-off / what we didn't do:** Considered (a) just skipping warmups on W4 — the smallest possible fix that preserves Original 5/3/1, (b) 5s PRO deload (65/75/85% × 5), (c) recovery-only week, and (d) adding a setting toggle. All rejected. INTENT.md is explicit that the app is for a serious 5/3/1 lifter and we don't ship a menu of options; we pick the version of Week 4 that respects the lifter's time. TM Test is the most opinionated of the realistic options and the one Wendler's own modern writing endorses. The cost: it introduces a "did I pass?" moment that pure 5/3/1 philosophy partly tries to avoid — accepted on the bet that for the target audience (intermediate, goal-driven) the verification beat is welcome.

**Follow-ups:** Manual verification against a physical Expo build before announcing — the pipeline's Metro export was green but visual fidelity wasn't sighted in the simulator. Dev blog post from Verso covering the deload critique + TM Test rationale, ideally referencing INTENT.md's "no menu of options" stance.

### 2026-05-27 — Loop criteria become hybrid: on-disk file + Discord `#loop-criteria` pinned messages

**Tags:** `harness`, `convention`, `process`, `skill`
**Files:** `.claude/skills/auto-improve/SKILL.md`, `loop-memory/loop-criteria.md`, `loop-memory/discord-channels.md`, `apps/web/src/pages/process.astro`, `docs/discord-loop-cycle.md`

The `/auto-improve` loop now reads its per-iteration rubric from **two surfaces, merged**: the stable categories in `loop-memory/loop-criteria.md` and the **pinned messages** in a new Discord channel `#loop-criteria`. Pin a message to add a criterion, unpin to retire it. The pin list IS the live ruleset; the file is the slow-changing half. On conflict, the pin wins. Pins promoted to permanent shape get moved into the file (and the pin removed) so the channel doesn't accumulate steady-state rules. Channel ID gets discovered + cached into `loop-memory/discord-channels.md` on first run.

Alongside this, `loop-memory/discord-channels.md` now carries the **canonical curl recipes** for every Discord call the loop makes — read pins, read messages, react `:+1:` / `:white_check_mark:`, post to `#auto-improvements`, discover a channel by name. The skill instruction is "copy the recipe, don't re-derive the API surface each loop." Includes the URL-encoded emoji codepoints, the `User-Agent` header that dodges Cloudflare 1010, the `jq -n --arg` pattern that survives commit-subject summary bodies, and `allowed_mentions.parse:[]` to defuse stray `@everyone`. A new `docs/discord-loop-cycle.md` carries a Mermaid diagram of the full cycle so the channel layout is documented once, not re-inferred from the skill. The `/process` page got a "three channels" block + updated step copy to surface the new dynamic-rubric surface to outside readers.

**Why:** the file-only criteria forced Alex to commit + push to change the rubric, which was friction enough that the rubric drifted from current intent between commits. Pins are zero-friction (one click in Discord) and let Alex steer a loop without touching the repo. The curl-recipe consolidation is the same instinct in a different direction — every prior loop spent some attention re-deriving "what's the right Discord endpoint shape" instead of shipping; baking the recipes into the channel cache file kills that tax.

**Trade-off / what we didn't do:** considered a flat `#loop-criteria` channel where every message is a criterion (no pin/unpin), with the bot reacting `:-1:` to retire a rule. Rejected — accumulates noise, requires bot writes to a channel that's supposed to be human-curated, models state Discord already models for free via pins. Considered keeping criteria entirely in the file — rejected for the friction reason above. Considered moving the curl recipes into a shell-script library under `scripts/` — rejected because the skill is the only consumer, the recipes are short, and a markdown file is faster to read mid-loop than to grep across a script library.

**Follow-ups:** first loop that needs the `#loop-criteria` channel ID has to discover it via `GET /guilds/$GUILD_ID/channels` and write the result back into `loop-memory/discord-channels.md`. If pins ever start landing without context that the loop can act on, consider a lightweight "criterion template" sentence pattern; not yet.

### 2026-05-27 — KPI strip on the home page grows a fifth tile: Units · lb + kg

**Tags:** `web`, `marketing`, `copy`
**Files:** `apps/web/src/pages/index.astro`, `loop-memory/10-home-page-illustration-audit.md`

The home page's KPI strip went from four tiles to five — added a Units tile (`lb + kg`, with the note "Both unit systems, throughout. Plates, training maxes, history — flip in Settings and everything re-snaps to the destination unit"). Discord 1509010001: "Add to the website, the app support lbs and kg plates and units." The grid switches `repeat(4, 1fr)` → `repeat(5, 1fr)` at desktop with tighter padding above 1100px so condensed numerals don't crowd the right border; the tablet breakpoint wraps to 2-2-1 with the lonely fifth tile spanning both columns to keep the strip closed. Also ticked the loop-038 audit item on HeroPhone Frame B's rest controls (`−30s / +30s / Skip ›`) — verified against the real RestTimerControls; no drift.

**Why:** the lb/kg toggle that shipped last loop on the plate calculator is a feature, but only a visitor who scrolled to the plate section and noticed the toggle would know. Promoting it to the KPI strip — sitting between Telemetry and Price, the strip a first-time visitor reads after the hero — surfaces it as a product fact, not an Easter egg. The deferred goal-calc lb/kg work from loop-021 doesn't change the headline claim; the unit support genuinely covers the user's training-max + plate + history surfaces.

### 2026-05-27 — Marketing site grows a lb/kg unit toggle on the plate calculator; warmup band on Today collapses by default

**Tags:** `web`, `mobile`, `feature`, `convention`
**Files:** `apps/web/src/pages/index.astro`, `apps/web/src/lib/plates.ts`, `apps/mobile/src/features/session/components/TodayBody/WarmupsBand.tsx`, `apps/mobile/src/features/session/__tests__/TodayScreen.test.tsx`

Two Discord asks from the same cluster shipped together.

The plate calculator now has a LB / KG segmented toggle in its header (Discord 1509000979). Flipping the toggle converts + snaps the displayed weight to the destination unit (250 lb → 115 kg, snapped to a plate-loadable 2.5-kg increment), updates every readout label (per side / bar / per-side caption), and re-decomposes the plates against the new unit's plate set (`PLATES_KG` / `BAR_KG`). `convertWeight`, `barWeight`, and `stepFor` helpers live in `~/lib/plates` so the snap rule stays in one place. The goal calculator was NOT extended this iteration — it shows "+10 lb per cycle (or +5 kg)" as a static caption today and a full toggle there is its own design question (do the steppers also flip? do the lift-specific TM defaults swap to kg-sensible numbers?). Noted as a follow-up.

The Today screen's warmups band on mobile now defaults to collapsed (Discord 1508998906). The header (caps "WARMUPS · 40 · 50 · 60% TM") stays visible and is tappable to expand into the three SetRow lines + the "Same bar · lb" hint. State is per-mount (re-collapses on next visit) so the default is always "out of the way".

**Why:** the plate-math marketing pitch is in lbs everywhere on the site, which silently filters out the kg half of the audience — adding the toggle is the smallest move that makes the section work for both. The warmup-band collapse is about screen real estate: the three rows live between the masthead and the working sets, which on taller phones pushes the actual work below the fold; a tappable header keeps the cheat sheet one tap away without making it the loudest thing on the screen.

**Trade-off / what we didn't do:** considered a global lb/kg pref in the TopBar that affects every interactive thing on every page; rejected for now because the toggle only does anything on the home page (the only page with interactive numeric widgets). The plate-card-local toggle is cheaper to ship and the bar for graduating it to global is "we have a second interactive widget that needs it".

### 2026-05-27 — Astro `<style>` is scoped; JS-injected elements need their layout-critical styles inlined

**Tags:** `web`, `bugfix`, `gotcha`
**Files:** `apps/web/src/pages/index.astro`, `loop-memory/13-marketing-interactivity.md`

The plate-calculator interactivity that shipped one loop ago had a follow-up: the SSR'd plates rendered with rotated labels (the typewriter `-90°` you see between sets in the real app), but the moment the user tapped the ± stepper, the JS-rebuilt plates rendered the labels flat. Discord 1508997365 caught this immediately ("the plate number is wrong, should be vertical aligned + rotated, style it like the actual app"). Root cause: Astro `<style>` blocks are scoped by default — selectors like `.plate-label { transform: rotate(-90deg); }` in `PhonePlateBar.astro` get a generated `data-astro-cid-*` attr that the SSR'd elements carry but dynamically-injected spans do not. Fix: inline rotation + font + layout styles on the JS-created label and plate elements via `style.cssText` so they don't depend on the scoped class. Rule + escape route written into `loop-memory/13-marketing-interactivity.md` so the next interactive widget on the marketing site doesn't relearn this.

**Why:** the symptom was small (a number that pointed the wrong way) but the bug class is the kind you fix once and then never see again if it's documented. The previous "dev" — me, an hour earlier — shipped the JS path without testing past the first paint, which is exactly the failure mode worth pinning to memory.

**Trade-off / what we didn't do:** considered making the `PhonePlateBar.astro` style block `is:global` so the JS path would pick up the same rules. Rejected — `is:global` leaks selectors like `.plate-label` to every page on the site and breaks the whole point of Astro's scoped styles. Inlining the four layout-critical rules on JS-rendered elements is local, explicit, and survives any future restructuring of the source component's styles.
### 2026-05-27 — Home-page plate calculator is now interactive — vanilla JS that re-renders off the same `~/lib/plates` math the mobile app uses

**Tags:** `web`, `marketing`, `interactivity`, `convention`
**Files:** `apps/web/src/pages/index.astro`, `loop-memory/13-marketing-interactivity.md`

The `#plate` section's TARGET WEIGHT readout used to be a hardcoded `250 lbs` and a single SSR snapshot. Replaced with a ± stepper that drives a vanilla-JS re-render of the plate stacks + readout numbers (per side / plate count / caption groups), all off `~/lib/plates.decompose` so the visualisation can't drift from the mobile primitive. Also removed the thick vertical line that was bisecting the plate-bar pane — a stray `linear-gradient` left over from an earlier `pc-right` background experiment that read as a UI defect, not the intended seam (Discord 1508988417). New loop-memory note `13-marketing-interactivity.md` documents the pattern — same shape the goal calculator uses, so the next interactive widget on the marketing site has a precedent.

**Why:** Discord 1508988573 — "for the TARGET WEIGHT section, might as well add a little interactiveness to change the weight, and see the plates adjust." The whole section was a plate-math marketing pitch but you couldn't actually run plate math; making it interactive turns it into a calculator the visitor can use, which is the right kind of "show, don't tell" for a 5/3/1 tracker home page. Companion bugfix from the same Discord cluster (1508988417) was the dead `linear-gradient` line — both shipped together because both touched the same `.pc-right` block.

**Trade-off / what we didn't do:** Considered reaching for a React island (Astro supports them) so the widget could be a small component. Rejected — would have shipped a framework runtime for two widgets total (this + the goal calculator). The vanilla-JS-imports-from-`~/lib` pattern is small enough that the bundle stays negligible, and the math source-of-truth stays in one place via the TS module.

### 2026-05-26 — Cross-stack nav from the (session) stack to a (tabs) destination must `dismissAll()` first

**Tags:** `architecture`, `bugfix`, `convention`
**Files:** `apps/mobile/src/features/session/SessionCompleteScreen.tsx`, `loop-memory/12-cross-stack-navigation.md`

`router.replace('/(tabs)/<tab>')` from inside the (session) stack does not pop the session stack — it only swaps the topmost screen. The result was the symptom reported in Discord 1508935241: after "Close the day" on the session receipt, a stale session screen (the ink-0 PR celebration in the most common case) stayed mounted under the Progress tab and read as "a black screen that can't be dismissed". Fix is `router.canDismiss() && router.dismissAll()` immediately before the cross-stack hop. `SessionCompleteScreen.handleClose` is the first site; the rule is in `loop-memory/12-cross-stack-navigation.md` for future close-the-day-and-go-to-X paths.

**Why:** the reporter said the app was unusable after the (otherwise correct) close-day → Progress transition. Symptom didn't reproduce in jest because the test stack mocks `router.replace` as a `jest.fn()` — no real native-stack to leak underneath. The bug was a one-line addition wrapped in the right precondition.

**Trade-off / what we didn't do:** considered baking `dismissAll()` into `goTo.progress` itself, but rejected — `goTo.progress` is also called from inside the (tabs) stack (LiftPage), where there is no session stack to dismiss and `canDismiss()` is `false` anyway. Keeping the dismiss at the call site means the cost is paid only where it's needed and the helper stays a pure path-builder.

### 2026-05-26 — `SessionCompleteScreen` no longer bounces home on a stale `'in_progress'` cache read

**Tags:** `architecture`, `bugfix`, `cache`
**Files:** `apps/mobile/src/features/session/hooks/useSessionCompleteData.ts`, `apps/mobile/src/features/session/SessionCompleteScreen.tsx`, `apps/mobile/src/features/session/BbbPromptScreen.tsx`

`SessionCompleteScreen`'s `data.notCompleted` check used to fire `goTo.home(router)` whenever the per-session cache (`SESSION_KEY(id)`) read `status !== 'completed'`. The cache is fresh on the route from PR celebration → BBB (the `awaiting-bbb` effect in `useLiveScreenEffects` invalidates it), but **not** on BBB → Complete — `BbbPromptScreen.onMarkComplete` invalidated set-logs, the sessions list, and lifetime volume, but never `SESSION_KEY`. The result was the AMRAP → Home symptom in Discord 1508935260. Two belt-and-braces fixes landed: the screen now exposes `cancelled` (only an explicit `'cancelled'` status bounces home; a stale `'in_progress'` waits for the refetch and the loading layout shows in the meantime), and BBB also re-invalidates `SESSION_KEY` so the cache cannot land stale.

**Why:** "wait for the refetch" is the right default for a transient cache fluke — the prior "bounce home if it doesn't say `'completed'`" was paranoid and dropped the user out of the receipt flow on the very read that was about to resolve. The added BBB invalidation is cheap and removes the window where the race even exists.

### 2026-05-26 — Optional inverted Live screen — opt-in via Settings, threaded through a nested `ThemeProvider`

**Tags:** `feature`, `theming`, `convention`
**Files:** `apps/mobile/src/design/theme.ts`, `apps/mobile/src/domain/types.ts`, `apps/mobile/src/data/drizzle/schema.ts`, `apps/mobile/src/data/drizzle/runMigrations.ts`, `apps/mobile/src/data/drizzle/migrations/0001_init.ts`, `apps/mobile/src/data/accessors/settings.ts`, `apps/mobile/src/data/accessors/onboarding.ts`, `apps/mobile/src/features/session/LiveScreen.tsx`, `apps/mobile/src/features/settings/sections/LiveScreenLookSection.tsx` (new)

Added a `liveScreenInverted` boolean to `Settings` and a Settings → Live screen look toggle (Paper / Inverted). When inverted, the Live set + rest screens render in the PR-celebration palette family. Threaded via a nested `ThemeProvider invert` — the provider swaps the `colors` table once (bg/ink families flip, lines redrawn off paper, amber kept) and every primitive that reads `useTheme()` picks up the inverted palette automatically. The alternative was per-component `inverted` props and a deep refactor of every Live primitive; the nested provider was one ThemeProvider edit and four-line LiveScreen change.

**Why:** Discord 1508984314 — the user wanted the LIVE workout/REST screens to invert similarly to PR celebration. The toggle ships the result without forcing the look on anyone, and the implementation is small enough that the next loop can extend the same `invert` prop to the Today and Complete screens with no new infrastructure.

**Trade-off / what we didn't do:** considered a third "auto" mode that follows the system theme — rejected for now because the app's whole palette is e-ink paper by design (see `INTENT.md`); offering OS-dark would imply OS-light is also wired up, and it isn't. The opt-in toggle keeps the default behavior unchanged and the inverted look as an explicit choice.

### 2026-05-26 — `useUpdateSettings` consolidates the `updateSettings + invalidate(SETTINGS_KEY)` pair

**Tags:** `refactor`, `convention`
**Files:** `apps/mobile/src/features/settings/hooks/useUpdateSettings.ts` (new), `apps/mobile/src/features/settings/sections/{PlateSet,RestTarget,LiveScreenLook}Section.tsx`

Pulled the `useDb + useQueryClient + async commit` boilerplate (`updateSettings(db, patch); invalidateQueries({ queryKey: SETTINGS_KEY })`) into `useUpdateSettings()`. Three sections adopted it in this iteration; the next section that needs to write a single field uses one import and one call instead of three plus a closure. `UnitsSection` was left alone — it routes through the more specialized `setDisplayUnit` wrapper, which carries its own intent.

**Why:** five identical commit-and-invalidate blocks meant the next setting (this loop's `liveScreenInverted`) was going to be the sixth. Easier to write the small hook now and keep new sections to a single line.

### 2026-05-26 — Marketing site v2: ported from the Anthropic Design HTML drop, then audited the phone mockups against the real app

**Tags:** `web`, `marketing`, `primitive`, `convention`
**Files:** `apps/web/src/pages/index.astro`, `apps/web/src/pages/process.astro`, `apps/web/src/pages/blog/index.astro`, `apps/web/src/pages/blog/tag/[scope].astro`, `apps/web/src/components/{TopBar,Footer,ScopeFilter}.astro`, `apps/web/src/components/illustrations/PhonePlateBar.astro` (new), `apps/web/src/lib/plates.ts` (new), `apps/web/src/styles/tokens.css`

Replaced the entire marketing site (home, process, dev log + the tag pages) with a port of the Anthropic Design HTML mockups Alex commissioned. Home now leads with the v2 hero phone, KPI strip, program ledger, the interactive **Goal calculator** (mirrors the mobile `GoalPanel`: TM/1RM toggle, lift picker, ± steppers, days/week, outputs `~N work days away · ≈ K mo at D/wk · X cycles` from `cyclesUntilTmGoal` math), plate-loader card, cycles matrix, screens rail, dev-log/process CTA pair, dark sign-off. Process and Dev log got equivalent treatment with real post-counts driving the Verso/Margin attribution math.

The screens rail (the "what the app looks like" surface) was the source of the meaningful audit work. First pass had four issues Alex flagged: the standalone plate-calc SVG showed `[45, 35, 25, 10]` for 250 lb (wrong — greedy decomposition is `[45, 45, 10, 2.5]`); the Live screen was rendered as a dark/inverse modal that doesn't exist in the app; the History screen rendered fake `weight × reps → e1RM` rows that the app doesn't track; lift-tabs/cycle-strip/stat-grid used wordings (`W1`, `Last`) that diverge from the source (`D1`, `TM`). Resolved by:

- Building `apps/web/src/lib/plates.ts` and `apps/web/src/components/illustrations/PhonePlateBar.astro` as **verbatim ports** of `apps/mobile/src/domain/plates.ts` + `apps/mobile/src/design/primitives/PlateBar/`. Same greedy `decompose()`, same `sizeFor()` ramp, same `groupPlates()` for the PER SIDE caption. Three size variants (`mini`/`full`/`hero`) so home, live, plan, and the standalone calc card all share one source of truth.
- Rewriting the four screens-rail phones to mirror the actual app's screen composition (`LiftPage`, `LiveHeader` + `TopSetBlock`, `HistoryScreen` with `AchievementStrip` + `SessionListRow`, `TodayBody` with `WorkingSetsBand`). Wordmark is `531. LEDGER` (matches `Masthead.tsx`), tabs are `D1–D4`, stats are `TM / BEST e1RM / CYCLE`, the Plan working-set rows follow `SetRow` shape.

Then Alex set the inverse rule via a 2026-05-26 feedback memory ([[marketing-screens-liberty]]): **accuracy is not screenshot fidelity**. Marketing mockups are allowed to scale, trim secondary chrome, and foreground the marketing-relevant detail — but must never invent screens or fake metrics. Applied that rule immediately to trim the Live and Plan cards for fit, sharp-corner the `PrimaryPillButton` (it's `borderRadius: 0` in the real app despite the name), scale phone frames 300×620 → 360×760 with proportional content bumps, and rewrite the screens-rail CSS so `padding-inline: max(32px, calc((100vw - 1568px) / 2))` centers four phones on wide viewports and lets them horizontal-scroll on narrow ones (the old `max(32px, calc((100vw - 1080px) / 2))` capped at content-wide and left the rail flush-left at every viewport ≥ ~1100 px).

**Why:** Alex commissioned the Anthropic Design HTML mocks specifically to replace the previous bespoke marketing site. The screens rail is the conversion surface — it's where a stranger decides whether the app is for them — so it has to read as the actual product, not a stylised brochure. The plate viz lying about its decomposition (`[45, 35, 25, 10] = 115 ≠ 102.5`) and the History rows lying about features the app doesn't have were the kind of small-but-permanent credibility holes that erode trust silently.

**Trade-off / what we didn't do:** Considered rendering the marketing screens with the actual mobile `react-native-web` build (would guarantee fidelity by sharing the literal components), rejected — RNW pulls a 200kB+ runtime for a couple of static illustrations, the mobile components also pull DB-aware hooks via TanStack Query, and the boundary rules mean web can't import from `apps/mobile/` anyway. Verbatim porting the math (`lib/plates.ts`) and rebuilding the layout in plain HTML+CSS keeps the marketing site static-rendered and gives us the right level of "shares the math, not the layout file" coupling.

**Follow-ups:** None concrete. The marketing-screens-liberty memory is now the canonical rule for any future drift; cross-check it whenever a screen or chip is added inside a phone mockup.

### 2026-05-26 — Skill audit from the Snyk article: vendor what fits, pull concepts from the rest

**Tags:** `skill`, `harness`, `convention`, `removal`
**Files:** `.claude/skills/vercel-react-native-skills/` (new, vendored), `.claude/skills/rn-design-audit/SKILL.md` (new), `.claude/agents/rn-qa.md`, `.claude/agents/rn-designer.md`, `loop-memory/11-typography.md` (new), `loop-memory/04-dev-blog-persona.md`, `CLAUDE.md`

Walked the eight skills from the Snyk "top Claude skills for UI/UX engineers" article against the 531 harness. Of the eight: vendored one (Vercel React Native Skills — 37 RN/Expo rules, exact stack match), pulled concepts from three (Vercel composition patterns → `rn-designer` and `rn-qa`, Bencium design-audit protocol → new `rn-design-audit` skill with 531-specific dimensions, Butterick typography → new `loop-memory/11-typography.md` for Verso), skipped four (Vercel React Best Practices is too Next.js-heavy; Vercel Web Design Guidelines is web-DOM only; AccessLint requires Chrome CDP and can't audit RN; UI/UX Pro Max is a design DB and conflicts with locked tokens), and scoped Anthropic `frontend-design` to `apps/web/` only via a CLAUDE.md note (its "BOLD aesthetic" mandate fights the e-ink system on mobile).

`rn-qa` gains two new audit sections — §7 RN best-practices (consults the vendored Vercel skill in priority order) and §8 component-API check (flags boolean-prop proliferation, render-X props, missing compound shapes for primitives). `rn-designer` gains a composition-rules block in its "New primitives" template so spec-time API decisions get the same lens. `rn-design-audit` is invokable directly when the user wants a standalone visual polish pass — three-phase (Critical / Refinement / Polish), reads `DESIGN.md` / `INTENT.md` / `tokens.ts` / PWA refs / live app, waits for approval before any implementation.

**Why:** the harness had no shared rubric for RN-specific runtime quality (list virtualization, GPU-only animations, native modals) — every QA pass had to re-derive what "good" looks like for React Native. Same for component-API design — `rn-designer` was specifying primitives without a consistent stance on boolean-prop sprawl. And there was no standalone visual-audit path; everything had to go through the per-feature pipeline. Importing/adapting from existing skill ecosystems is cheaper than writing these from scratch, but the Snyk article doesn't differentiate web-flavored skills from RN-flavored ones, and several would have actively hurt the project (Web Design Guidelines triggering on RN code, frontend-design rewriting e-ink screens with brutalism).

**Trade-off / what we didn't do:** considered installing all three Vercel skills (RN + composition-patterns + react-best-practices) directly. Rejected for the latter two — composition-patterns is 8 rules small enough to fold into agent prompts, and react-best-practices' 70-rule surface is mostly Next.js noise for an Expo app. Considered uninstalling `frontend-design` entirely. Rejected — it's plausibly useful for the marketing site under `apps/web/`, so scope-restriction via CLAUDE.md preserves optionality. Considered installing AccessLint via its MCP. Rejected — RN doesn't have a Chrome DOM for the engine to crawl. Considered making `rn-design-audit` a mode of `rn-qa`. Rejected — they have different inputs (audit needs the live app, QA needs the spec) and different outputs (phased plan vs. pass/fail report); mixing modes would muddy both.

**Follow-ups:** validate the new `rn-qa` audit sections on the next feature that runs through `rn-expo-pipeline` — confirm the priority-walk through Vercel's RN rules doesn't bloat the QA report. If `rn-design-audit` gets invoked, the first run is the real test of whether the dimensions list is the right cut for the e-ink system. If the typography file changes anything in how Verso writes, log it.

### 2026-05-26 — Blog posts get a structural `scope` field and the dev log gets filter pages

**Tags:** `website`, `schema`, `blog`, `convention`
**Files:** `apps/web/src/content.config.ts`, `apps/web/src/lib/posts.ts`, `apps/web/src/components/ScopeFilter.astro` (new), `apps/web/src/pages/blog/index.astro`, `apps/web/src/pages/blog/tag/[scope].astro` (new), `apps/web/src/content/blog/*.md` (×50), `loop-memory/03-dev-blog.md`

Added a required `scope` array field to the blog content schema with enum values `mobile | web | loop | meta`. Posts can carry multiple scopes (a single loop often ships across surfaces). Backfilled all 50 existing posts with heuristic-assigned scopes — distribution: 28 mobile, 14 web, 11 meta, 7 loop, which confirms the imbalance Alex flagged (the website was barely getting touched). Created `/blog/tag/<scope>` static pages via `getStaticPaths` and a `ScopeFilter` chip-bar component shown at the top of `/blog` and each tag page. `tags[]` stays untouched for fine-grained content labels.

**Why:** the dev log had grown to 50 posts on a flat index with no filter, and the only structural distinction available — the free-form `tags[]` array — was wildly inconsistent (mix of areas, categories, surfaces). Alex wanted to be able to see at a glance how many posts touched the website vs the mobile app. Static tag pages also make the breakdown shareable and SEO-visible.

**Trade-off / what we didn't do:** considered query-string client-JS filtering (`/blog?scope=mobile`). Rejected — static pages are Astro-native, work without JS, share cleanly, and the chip-bar UX is essentially identical. Also considered making `scope` single-value (forcing the writer to pick a primary). Rejected — many real loops ship across mobile + web; forcing a single value would lose signal on cross-cutting posts. Also considered re-tagging into `scope` alone and dropping the existing `tags[]`. Rejected — the free-form tags carry content nuance (`bug-postmortem`, `refactor`, `removal`) that's worth keeping; the two dimensions are orthogonal.

**Follow-ups:** the verso agent and `post-as-verso` skill inherit the new schema via `03-dev-blog.md` — next post written through the skill will need to set `scope`. If `meta` and `loop` turn out to be hard to distinguish in practice, collapse them; the chip bar handles three or four equally well.

### 2026-05-26 — RELEASE.md + MARKETING.md catch up

**Tags:** `docs`, `release`
**Files:** `docs/RELEASE.md`, `docs/MARKETING.md`

Two more doc drifts:

- **RELEASE.md** smoke-test step 4 said "'Close the day' returns home". That changed in loop-035 (Discord 1508779267 — Close the day now routes to Progress with a one-time fill-in animation on the just-completed cell). Fixed.
- **RELEASE.md** hotfix flow described a hand-rolled `git commit && git push` and leaned on the EAS preview-on-main workflow to fire an OTA. The standing path (since 2026-05-25) is the `pnpm release-ota` wrapper. Documented the wrapper, explained why it carries the `--environment production --non-interactive` flags (newer eas-cli refuses non-TTY runs without them) and the `%s`-vs-`%B` message choice (the body often has unbalanced quotes/backticks). Also called out the runtime-version fingerprint gotcha for native-dep changes.
- **MARKETING.md** privacy section said `docs/PRIVACY.md` was "TODO before submission". The file exists and is ready for store submission — it just needs hosting at a public URL. Fixed the framing.

**Home-page note (loop-048):** category 8 not touched. Same restraint as loop-047 — the page is in steady state, recent loops shipped the meaningful items (favicon, RSS link, skip-link), forcing more would be manufacturing surface.

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
