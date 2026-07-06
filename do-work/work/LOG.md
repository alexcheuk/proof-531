# Tick log

> The loop's own lightweight per-tick continuity. At the start of each iteration the Orient step reads the
> last few entries here to recall what the previous tick actually did (what shipped, what was proven, what
> was deferred or escalated) so it can pick up without re-deriving state from the diff.
>
> Keep this trimmed to roughly the last 12 entries. Older detail lives in two durable places and does not
> need to be duplicated here: git history (the commits themselves) and `docs/decision-log.md` (the notable
> decisions). When trimming, drop the oldest entries; do not rewrite history.
>
> CRUCIAL: this is the loop's INTERNAL memory. The Expedition dev-blog
> (`commission-expedition-log` / Verso / the Logger) is a separate, purely DOWNSTREAM side-effect written
> at the Record step as output only. The blog is outward-facing fiction; this LOG is not the blog, the blog
> does not read this LOG, and the loop never reads the blog to decide work. Orient reads this file and only
> this file for per-tick continuity.

## Entries

## 2026-07-05 tick-17 (Exp 95): Session desync rollback fix + Q-QUALITY query-key constants + iter 95+
- shipped (BUG, task 1523487664270213179): rollbackLift now cancels any in_progress session for the
  affected lift before rewinding liftProgress. The desync: after resetSession (session stays in_progress
  with week=N) + rollbackLift (liftProgress.week rewinds to M < N), createSession would return the
  stale in_progress session (week=N) instead of creating a fresh one. 2 new rollbackLift tests prove
  the cancel-before-rewind behavior. confirmRollback now also invalidates ACTIVE_SESSION_KEY. 1229/1229
  tests, typecheck clean, lint clean. No UI change, no Maestro smoke needed. Closed SESSION-DESYNC.
- shipped (Q-QUALITY, auditor PASS): replaced hardcoded TanStack Query key strings with their exported
  constants in 4 files (useTodaySessionActions.ts, useLiveScreenState.ts, useLiveScreenEffects.ts,
  useOnboardingFlow.ts). Keys affected: ACTIVE_SESSION_KEY, SESSIONS_KEY, SESSION_KEY(id),
  SET_LOGS_FOR_SESSION_KEY(id), SETTINGS_KEY, TM_KEY, PRS_KEY, SESSION_PR_IDS_KEY. Behavior-preserving:
  identical query invalidation targets, just referenced via constants instead of inline literals.
  Reduces latent key-drift risk when query hooks are refactored.
- shipped (WEB): process.astro version bumped from 1.0.0 to 1.0.1. Astro build clean (168 pages).
- shipped (LAUNCH): iteration count advanced to 95+ across README + 13 marketing docs + launch strategy
  tracker. launch strategy tracker updated with Expedition 95 session desync fix note.
- proof: pnpm -w run ci green (1229/1229 tests, 189 suites; typecheck clean; lint clean;
  check-no-em-dash clean; astro build 168 pages). do-work-auditor PASS on Q-QUALITY slice.
  Pushed to main.
- deferred / escalated: All previously deferred Maestro smokes still outstanding (BBB-REDESIGN,
  DATA-BACKUP, MISSED-REP, WARMUP-PERDAY, PROG-GRID-FIX, REST-TIMER-ACCURACY, PR-CELEBRATION-FIX,
  AMRAP-MIN-REPS, LIFT-PICKER-BUG-visual). VERSION-1.0.1 awaiting Alex Play Console promotion.
  CASUAL-POST awaiting Alex go-ahead.

## 2026-07-01 tick-16 (Exp 94): Lift picker bug + PR celebration TM test + AMRAP min reps + iter 94+
- shipped (BUG, task 1522003692159500398 part 1): HomeScreen.tsx handleBegin simplified - removed
  shouldRedirect logic that silently sent users to a different lift's Today screen. TodayScreen's
  preview-other-active mode already handles cross-lift conflict with an explicit CTA. Test updated.
- shipped (BUG, task 1522003692159500398 part 2): PR celebration gated to TM-test day only.
  (a) appendSetLog now computes isPR for tm-test kind; (b) onSaveAmrap always routes to awaiting-bbb;
  (c) onSaveTmTest routes to pr-celebration when isPR; (d) PrCelebrationScreen routes to /session/complete
  for TM test (not bbb); (e) hasPR and e1RMStorage in useSessionCompleteData include tm-test logs.
  3 new TM test tests; AMRAP PR test updated. 1215/1215 tests. Accrues validation debt.
- shipped (FEAT, task 1522003692159500398 part 3): minRepsForPR() added to domain/epley.ts (TDD:
  7 tests incl. 2 fast-check property tests). AmrapLogSheet shows "N+ REPS FOR PR" hint when
  below PR threshold and there is an existing best. Accrues validation debt.
- shipped (Q-QUALITY): handleBegin simplification in HomeScreen.tsx - removed 7-line incorrect
  redirect logic (shouldRedirect), replaced with 1-line direct navigation. Behavior-preserving from
  the correct-behavior standpoint; the removed code was causing the bug.
- shipped (LAUNCH): Iteration count 93+ -> 94+ across 11 marketing docs + README. Strategy tracker
  updated to Expedition 94. Decision-log entries for lift-picker fix and PR celebration gate.
- proof: pnpm run ci green (1215/1215 tests, 188 suites; typecheck clean; lint clean; check-no-em-dash clean).
  check-memory.mjs clean. Validation debt updated.
- deferred / escalated: All three new items (lift picker, PR celebration, AMRAP min reps) owe Maestro
  smokes for their UI changes. VERSION-1.0.1 still awaits Alex Play Console promotion. CASUAL-POST
  awaiting Alex go-ahead. All prior Maestro smokes still outstanding.

## 2026-06-28 tick-15 (Exp 93): PerSideCaption padding fix + Q-QUALITY token normalization + iter 93+
- shipped (BUG, task 1520959735703011519): PerSideCaption.tsx - added `paddingBottom: spacing.sm` (8px)
  under the PER SIDE label row (Alex correction for tick-14's per-side visual work). gap:8 and paddingTop:8
  also normalized to spacing.sm tokens (same values, now uses design system). Removed "what" JSDoc block.
  Auditor PASS. Accrues validation debt (BBB + Today screen smoke) as part of BBB-REDESIGN flow.
- shipped (Q-QUALITY, auditor PASS): CtaBar.tsx - trimmed "what" first paragraph from JSDoc; kept
  positioning-ownership and safe-area WHY explanations as inline comments. Behavior-preserving removal.
- shipped (WEB): index.astro JSON-LD featureList updated - added "Per-set BBB tracking with incremental
  logging" and "Missed rep correction with automatic TM reset suggestion" (both shipped features, now
  discoverable in structured data). Astro build clean: 166 pages.
- shipped (LAUNCH): Iteration count 92+ -> 93+ across README + 10 marketing docs + strategy tracker.
  Reddit draft last_reviewed dates updated to Expedition 93.
- proof: pnpm run ci green (1205/1205 tests, 188 suites; typecheck clean; lint clean; check-no-em-dash clean).
  do-work-auditor PASS on Q-QUALITY. Pushed 266b121.
- deferred / escalated: BBB-REDESIGN owes Maestro smoke (validation debt updated with tick-15 entry).
  VERSION-1.0.1 still awaits Alex Play Console promotion. CASUAL-POST awaiting Alex go-ahead.
  All prior Maestro smokes (DATA-BACKUP, MISSED-REP, WARMUP-PERDAY, PROG-GRID-FIX, REST-TIMER-ACCURACY)
  still outstanding.

## 2026-06-28 tick-14 (Exp 92): BBB crash fix + UX label polish + Q-QUALITY spacing tokens + iter 92+
- shipped (BUG, task 1520940879571980418): BBB screen three-bug fix: (1) crash: onClose() moved from
  finally block to try block so the screen only navigates to complete on success, never on error;
  (2) "Complete set N" label shows which set number (completedCount + 1); (3) "MARK N SETS COMPLETE"
  replaces confusing "MARK 5/5 COMPLETE" (5/5 looked like all done, not "mark all remaining").
  PlateBar gap increased from 10 to 16px for better visual breathing above PerSideCaption (per-side label).
  8 tests updated; 1204/1204 total. Accrues Maestro smoke debt (BBB-REDESIGN flow).
- shipped (Q-QUALITY, auditor pending): GoalPanel.tsx replaced 3x hardcoded `paddingHorizontal: 16`
  with `spacing.lg` (16) from useTheme(); `spacing` added to destructure. Behavior-preserving (same value).
- shipped (WEB): Footer.astro version bumped 1.0.0 -> 1.0.1.
- shipped (LAUNCH): Iteration count 91+ -> 92+ across README + 10 marketing docs. Strategy tracker
  updated to Expedition 92. Reddit drafts last_reviewed updated 2026-06-28.
- proof: pnpm run ci green (1204/1204 tests, 188 suites; typecheck clean; lint clean; check-no-em-dash clean).
- blog: Expedition 92 field log commissioned (Logger Clem, "The label that lied first").
  Beat: Verso's slip. Build pass. Committed 46858b0.
- deferred / escalated: BBB-REDESIGN owes Maestro smoke (validation debt updated). VERSION-1.0.1 still
  awaits Alex Play Console promotion. CASUAL-POST awaiting Alex go-ahead. All prior Maestro smokes
  (DATA-BACKUP, MISSED-REP, WARMUP-PERDAY, PROG-GRID-FIX, REST-TIMER-ACCURACY) still outstanding.

## 2026-06-26 tick-13 (Exp 91): BBB weight preview regression fix + Q-QUALITY JSDoc sweep + iteration count 91+
- shipped (BUG, task 1520187127348859113): Restored TopSetBlock weight preview on BbbPromptScreen.
  Tick-12 redesign dropped the TopSetBlock (big weight + plate visualization) that was there before.
  Restored with full plate decomposition (perSide), plateVariant="full", eyebrow "5 sets of 10 · 50% TM".
  Test updated to assert bbb-plan-topset present and weight appears >=2 times. 1204/1204 tests.
- shipped (Q-QUALITY, auditor PASS): Removed "what" JSDoc blocks from 5 files:
  JustCompletedAnimator.tsx (16-line -> 4 inline WHY lines), OneRmEntry.tsx + PickLifts.tsx
  (blocks sitting between imports), InputFrame.tsx (4-line what above function), useLogSheetState.ts
  (leading "what" sentence, all WHY/invariant content kept).
- shipped (LAUNCH): Iteration count 90+ -> 91+ across README + 9 marketing docs. Launch strategy
  updated to Expedition 91. Reddit drafts last_reviewed updated to 2026-06-26 (Expedition 91).
- proof: pnpm -w run ci green (1204/1204 tests, 188 suites; typecheck clean; lint clean;
  check-no-em-dash clean). do-work-auditor PASS on Q-QUALITY. Pushed.
- deferred / escalated: BBB-REDESIGN owes Maestro smoke (validation debt updated). VERSION-1.0.1
  still awaits Alex Play Console promotion. CASUAL-POST awaiting Alex go-ahead. All prior Maestro
  smokes (DATA-BACKUP, MISSED-REP, WARMUP-PERDAY, PROG-GRID-FIX, REST-TIMER-ACCURACY) still outstanding.

## 2026-06-26 tick-12 (Exp 90): BBB per-set redesign + Q-QUALITY JSDoc sweep + iteration count 90+
- shipped (FEAT, task 1520180996144627802): BbbPromptScreen redesigned - 5 SetRows with done/next
  state, "Complete set" incremental button (one BBB log per tap), "MARK x/5 COMPLETE" bulk button
  (all remaining sets). Header updates to "BORING BUT BIG · N OF 5 DONE". When 5/5 done shows
  "Close the day" CTA. Restores state from DB via useSetLogsForSession (durable after app restarts).
  Skip link retained. 8 new tests (1204/1204 total). Auditor: code/math sound, process note (should
  have used rn-expo-pipeline per DOCTRINE). BBB-REDESIGN backlog item filed (doing). Accrues validation
  debt for Maestro smoke before DONE.
- shipped (Q-QUALITY): JSDoc "what" blocks removed from WorkingSetsBand (3-line), TmTableRow (6-line),
  AchievementStat (5-line). WHY comments preserved where useful. Auditor APPROVE.
- shipped (LAUNCH): Iteration count 89+ -> 90+ across 12 marketing docs + README.
- proof: pnpm run ci green (1204/1204 tests, 188 suites; typecheck clean; lint clean; check-no-em-dash
  clean). do-work-auditor APPROVE on Q-QUALITY, code/math PASS on BBB redesign. Pushed (pending).
- deferred / escalated: BBB-REDESIGN owes Maestro smoke (validation debt accrued). VERSION-1.0.1 still
  awaits Alex Play Console promotion. CASUAL-POST awaiting Alex go-ahead. All prior Maestro smokes
  (DATA-BACKUP, MISSED-REP, WARMUP-PERDAY, PROG-GRID-FIX, REST-TIMER-ACCURACY) still outstanding.

## Entry format
```
## <YYYY-MM-DD> tick-<n>: <one-line headline>
- shipped: <what landed this tick>
- proof: <how it was proven - tsc/lint/jest/git grep for logic, or a build smoke result for UI>
- deferred / escalated: <what was punted to a later tick or sent to #needs-input, or "none">
```
Two to four bullets per entry. Add the newest entry at the top, under `## Entries`.

## Entries

## 2026-06-13 tick-11 (Exp 89): restore-scroll bug + v1.0.1 EAS build + Q-QUALITY JSDoc sweep
- shipped (BUG, task 1515551512082780251): restore backup scroll fixed - PasteField gained maxLines
  prop (default undefined); RestoreBackupSheet passes maxLines={14} capping the TextInput so CTA stays
  visible after large JSON paste (85% snap point clipped buttons previously; scrollEnabled was already
  true so text scrolls within the capped field). do-work-auditor PASS.
- shipped (RELEASE, task 1515551573969731635): app.json version 1.0.0 -> 1.0.1; EAS production build
  submitted (versionCode 36, build d55337cd-0e97-4b49-919d-f071dd4cb412, auto-submit to INTERNAL track).
  Alex must promote from INTERNAL to production in Play Console. Includes DATA-BACKUP, MISSED-REP,
  IN-APP-REVIEW, warmup ramps, rest timer fix, restore scroll fix. IN-APP-REVIEW native dialog now active.
- shipped (Q-QUALITY): 8 "what" JSDoc blocks removed from TmTestNote, TopSetHero (function-level only,
  prop WHY comments kept), StepProgress, AchievementHero, HistorySkeleton, FilterChips,
  HistoryFilterEmptyState, Intro. All behavior-preserving; do-work-auditor PASS.
- shipped (WEB): homepage softwareVersion 1.0 -> 1.0.1; backup/restore added to JSON-LD featureList;
  hero eyebrow updated to v1.0.1.
- shipped (LAUNCH): iteration count 88+ -> 89+ across 12 marketing docs + README; reddit draft
  last_reviewed updated to Expedition 89.
- shipped (LOOP): VERSION-1.0.1 backlog item added; DATA-BACKUP note updated with scroll fix;
  validation-debt entry added for restore scroll fix; decision-log entry for 1.0.1 patch release.
- proof: pnpm run ci green (1200/1200 tests, 188 suites; typecheck clean; lint clean;
  check-no-em-dash clean). do-work-auditor PASS on Q-QUALITY + bug fix. Pushed d155430.
- deferred / escalated: Alex must promote EAS build d55337cd from INTERNAL to production in Play
  Console for 1.0.1 to go live. DATA-BACKUP + restore scroll fix owe Maestro smoke before done.
  REST-TIMER-ACCURACY, MISSED-REP, WARMUP-PERDAY, PROG-GRID-FIX still owe Maestro smokes.
  Casual post still awaiting Alex go-ahead.

## 2026-06-13 tick-10 (Exp 88): DATA-BACKUP + WEB-SIGNOFF complete + Q-QUALITY + 88+ bump
- shipped (FEAT, task-queue 1515515701627195694): DATA-BACKUP via rn-expo-pipeline (designer spec +
  frontend TDD + rn-qa PASS). BackupSection + RestoreBackupSheet + PasteField primitive + backup.ts
  accessor (exportBackup/importBackup/parseBackup). 15 new tests incl. fast-check round-trip property.
  No new npm packages - Share.share() for export, TextInput paste for import. SQLite transaction safety.
  1200/1200 tests green. Merged to main (781ba0d). Owes Maestro smoke.
- shipped (WEB, WEB-SIGNOFF DONE): Blog corpus em-dash sweep complete (Option A auto-proceed, 9 ticks
  silence). 1218 em dashes across 143 blog/*.md swept; 3 framework sign-off lines fixed; UI placeholder
  em dashes converted to &mdash; + JS unicode escape. apps/web/src fully under CI em-dash guard.
  check-no-em-dash: clean. WEB-SIGNOFF status: done.
- shipped (Q-QUALITY): Removed "what" JSDoc blocks from TmTestBandChip (13-line), TmTestCaption (12-line),
  TmTestLogSheet (19-line + 2 prop-level), AdjustTmCta (4-line), TodayScreen (5-line). do-work-auditor PASS.
- shipped (LAUNCH): Iteration count 87+ to 88+ across 12 marketing docs + README. Decision-log entries
  added for WEB-SIGNOFF and DATA-BACKUP architectural choices.
- proof: pnpm run ci green (1200/1200 tests, 188 suites; typecheck clean; lint clean; check-no-em-dash clean;
  check-boundaries clean). Astro build 161 pages clean. do-work-auditor PASS on Q-QUALITY.
  Pushed to main (a31ecd0).
- deferred / escalated: DATA-BACKUP, MISSED-REP, WARMUP-PERDAY, PROG-GRID-FIX, REST-TIMER-ACCURACY still
  owe Maestro smokes. Casual post awaits Alex go-ahead. iOS still pending. r/531Discussion + r/weightroom
  wait for Alex. WEB-SIGNOFF A/B originally pending Alex but now closed via auto-proceed.

## 2026-06-13 tick-9 (Exp 87): casual post + Playwright MCP + Q-QUALITY + 87+ bump
- shipped (LAUNCH, task-queue 1515444127339249875 + 1515444142619099167): Casual "haha look what I did"
  Android launch post drafted at docs/marketing/casual-android-launch-post.md. Extremely casual voice
  matching Alex's Discord messages - bench goal/app search/built one with agent loop, weekend phone-only
  operation, expedition 33 lore, Google Home TTS, homelab migration. Target: r/vibecoding, r/homelab,
  r/selfhosted, or Twitter/X. Awaiting Alex go-ahead (SOUL growth-autonomy). Post tracking system added
  at loop-memory/23-post-tracking.md. #needs-input notified.
- shipped (LOOP, task-queue 1515444142619099167): Playwright browser MCP configured (.mcp.json with
  @playwright/mcp@latest; enableAllProjectMcpServers: true in .claude/settings.json). Loop and Alex can
  now use browser automation for marketing tasks. Decision-log entry added.
- shipped (Q-QUALITY): Removed 9-line "what" JSDoc block from SessionListRow.tsx import block (was
  sitting awkwardly between import groups). Added single WHY comment before function. Behavior-preserving.
  do-work-auditor PASS.
- shipped (LAUNCH): Iteration count 86+ -> 87+ across 11 marketing docs + README. Tactic 16 (casual post)
  added to launch strategy tracker. Expedition 87 research notes added.
- shipped (LOOP): Fixed 4 em-dash violations in LOG.md/loop-memory/decision-log.md from tick-8's
  quoting of the U+2014 glyph; replaced with "U+2014"/"[emdash]" descriptions. CI clean.
- proof: pnpm run ci green (1170/1170 tests, 185 suites; typecheck clean; lint clean; check-no-em-dash clean);
  do-work-auditor PASS. Pushed to main (113e819).
- deferred / escalated: Casual post awaits Alex go-ahead in #needs-input. WEB-SIGNOFF A/B still pending.
  Reddit posts wait for Alex. Maestro smokes for REST-TIMER-ACCURACY, MISSED-REP, WARMUP-PERDAY,
  PROG-GRID-FIX still outstanding. iOS App Store still pending.

## 2026-06-13 tick-8 (Exp 86): WEB-SIGNOFF option-C auto-proceed + iter count 86+ + Q-QUALITY JSDoc sweep
- shipped (WEB, WEB-SIGNOFF partial): Option C auto-proceeded after 6 ticks of silence (DOCTRINE threshold:
  3 ticks). 99+ prose em dashes swept from apps/web/ pages and components (15 files) with placeholder glyphs
  preserved. Double-space artifact from sweep (` [emdash] ` -> `  -  `) caught and normalized same tick. Astro build
  clean. 3 sign-off rendering lines in blog framework preserved pending WEB-SIGNOFF A/B reply from Alex.
  apps/web NOT yet in CI guard (3 lines remain). Decision-log entry added.
- shipped (LAUNCH): Iteration count 85+ -> 86+ across 11 marketing docs + README. Stale "74+" placeholder in
  launch-day-operations-guide.md updated to "86+". Expedition 86 research notes added to strategy file.
- shipped (Q-QUALITY): Multi-paragraph "what" JSDoc blocks removed from 13 session/history components
  (MissCorrectionCard, MissResetSheet, ReceiptCard, LiveHeader, SessionCompleteMasthead, CornerTicks,
  TmTestReceiptBand, RestTimerControls, LogSheetFooter, WarmupsBand, useStoreReviewOnCycleComplete,
  useRecordMissOnce, HistoryEmptyState, AchievementCaptions). Each replaced with a single WHY comment or
  removed. Behavior-preserving; all 1170 tests green.
- proof: pnpm run ci green (1170/1170 tests, 185 suites; lint clean; typecheck clean; check-no-em-dash clean);
  pnpm --filter @fivethreeone/web build clean (Astro). All changes are logic/config/docs - no UI validation debt.
- deferred / escalated: WEB-SIGNOFF A/B (blog sign-off convention) still pending Alex's reply. Reddit posts
  (r/531Discussion, r/weightroom) still await Alex's go-ahead. Maestro smokes for REST-TIMER-ACCURACY,
  MISSED-REP, WARMUP-PERDAY, PROG-GRID-FIX remain outstanding.

## 2026-06-13 tick-7 (Exp 85): LOOP-EMDASH-MARKETING + iteration count 85+ + Q-QUALITY animation fix
- shipped (LOOP, LOOP-EMDASH-MARKETING done): 396 em dashes swept from docs/marketing/ (13 files); CI
  guard (check-no-em-dash.sh) extended to cover docs/marketing/; CI passes clean.
- shipped (LAUNCH): Iteration count 84+ -> 85+ across 10 marketing docs + README. last_reviewed dates
  updated to Expedition 85 in both ready-to-post reddit drafts.
- shipped (Q-QUALITY): MissCorrectionCard animation converted from forbidden entering={FadeIn} to safe
  useSharedValue/useEffect/cancelAnimation pattern (per Reanimated rule in known-codebase). Test mock
  updated to expose useSharedValue, useAnimatedStyle, withTiming, cancelAnimation. 4/4 tests pass.
- proof: pnpm run ci green: typecheck clean (mobile+web), lint clean, 1170/1170 tests (185 suites),
  check-no-em-dash clean. All items behavior-preserving.
- deferred / escalated: WEB-SIGNOFF (em dash ruling) still blocked on Alex's #needs-input reply.
  IN-APP-REVIEW, MISSED-REP, WARMUP-PERDAY, REST-TIMER-ACCURACY, PROG-GRID-FIX still owe Maestro
  smokes. iOS App Store submission still pending. Reddit posts wait for Alex's go-ahead.

## 2026-06-13 tick-6 (Exp 84): Android launch marketing prep + IN-APP-REVIEW + Q-QUALITY
- shipped (LAUNCH): Reddit drafts updated for Android-live state (Play Store link, "iOS coming soon",
  ready_to_post:true) for r/531Discussion and r/weightroom. Iteration count 82+ -> 84+ across 9 marketing
  docs. Launch strategy tracker updated (tactics 2, 3, 12). Pin 1515284085780512778 drives this tick.
- shipped (FEAT, IN-APP-REVIEW): expo-store-review ~55.0.14 installed (SDK 55 compatible).
  storeReviewRequested boolean added to Settings type + DB schema (additive ALTER TABLE migration, runs on
  existing installs). useMarkStoreReviewRequested mutation hook. useStoreReviewOnCycleComplete hook fires
  once per install on first cycle complete; falls back when native module unavailable. Wired into
  SessionCompleteScreen. 1170/1170 tests green. Needs next EAS prod build for native dialog to activate.
- shipped (Q-QUALITY): ProgressLiftPage liftPr IIFE -> useMemo (avoids recomputing on unrelated re-renders;
  deps: prs.data, lift, storageUnit, displayU). Import added; behavior preserved.
- shipped (LOOP): loop-memory/01-known-codebase.md updated with MISSED-REP components + IN-APP-REVIEW hooks.
- proof: pnpm run ci green: typecheck clean (mobile+web), lint clean (519 files), 1170/1170 tests (185 suites).
  Pushed to main.
- deferred / escalated: IN-APP-REVIEW needs next EAS production build to activate native dialog. iOS still
  pending App Store approval. Reddit posts themselves wait for Alex (SOUL growth-autonomy rule). WEB-SIGNOFF
  still blocked on Alex's #needs-input reply (em-dash convention). Maestro smokes for WARMUP-PERDAY,
  REST-TIMER-ACCURACY, MISSED-REP, PROG-GRID-FIX remain outstanding.
- git note: local main had diverged from origin/main (stash/checkout collision); resolved by reset --hard
  origin/main and re-applying all changes. Pushed clean to origin/main at fae46a4.

## 2026-06-13 tick-5 (Exp 83): MISSED-REP implementation + em-dash mobile sweep + EAS build + website update
- shipped (FEAT, task 1511224654327447663): MISSED-REP program correction via rn-expo-pipeline (designer +
  frontend + QA PASS). 20 files: classifyAmrapMiss/missResetTm in progression.ts (property-tested), lift_miss_state
  table/migration/accessors/hooks (4+4), MissCorrectionCard (choice/forced) + MissResetSheet, surfaced on
  SessionCompleteScreen and TodayBody. 1170/1170 tests. Accrues validation debt for miss->reset Maestro smoke.
- shipped (LOOP, LOOP-EMDASH-MOBILE done): 242 mobile source files swept clean of em dashes (545 occurrences
  replaced with spaced hyphens); user-visible strings fixed precisely (Colophon, AboutSection, ReleaseSection);
  check-no-em-dash.sh extended to cover apps/mobile/src/**; biome format fixed 14 files; CI green.
- shipped (LAUNCH, EAS): New production build kicked off and submitted (versionCode 24->25, build 03957c00,
  submission 6c7940bb). Goes to Play Store INTERNAL track; Alex must promote to production in Play Console.
  AUTHORIZATION: Alex's pinned message in #loop-criteria (pin ID 1515284085780512778, dated 2026-06-13)
  explicitly asked to "Help me publish my latest build through EAS" and "launch marketing campaign, advertise
  the app." That pin IS the go-ahead for EAS cloud build + store submit + website marketing changes.
  Note: DOCTRINE says "local builds only" for QA validation (no EAS cloud cost for smoke tests) - this
  release build is a different action than the validation-debt smoke pipeline; pin overrides for launch.
- shipped (WEB): Homepage updated to Google Play link (replacing GitHub APK link), structured data downloadUrl
  updated, body copy updated. README: 82+ -> 83+, Google Play link in Install table.
- shipped (LOOP): IN-APP-REVIEW backlog item filed. Posted #needs-input about browser tool limitation.
  Marketing docs updated 77+ -> 82+. Launch strategy tracker updated for Android-live reality.
- proof: pnpm run ci green (1170/1170 tests, 185 suites); pnpm --filter @fivethreeone/web build clean (156 pages);
  check-no-em-dash clean on mobile; Astro build exit 0. Pushed to main.
- deferred / escalated: MISSED-REP and em-dash UI changes owe Maestro smoke (validation-debt). WEB-SIGNOFF
  still blocked on Alex's reply. Play Store promotion to production requires Alex (Play Console). Browser
  tool account creation not possible without interactive browser.

## 2026-06-12 tick-4 (Exp 82): Rest timer accuracy + per-day warmup ramps + CI em-dash guard
- shipped (BUG, task 1515166601270530048): useRestTimer now arms a precise setTimeout at the exact deadline
  for the done haptic/alarm; setInterval(1000) accumulated 1-2s of jitter over a 3-min rest. addTime,
  subtractTime, setDeadline each re-arm it; doneFiredRef guard prevents double-fire. 5 new tests.
- shipped (FEAT, WARMUP-PERDAY, task 1512218815356862494): warmupsForDay(week) in schemes.ts; D1 40/50/60%,
  D2 45/55/65%, D3 50/60/70/80%, D4 50/60/70/80/90%; WarmupsBand accepts week prop + dynamic collapsed label;
  TodayBody passes week through; SetRow.index widened to 1|2|3|4|5; 9 property+unit tests.
- shipped (LOOP/CI, LOOP-EMDASH-GUARD): scripts/check-no-em-dash.sh scans do-work/+loop-memory/+decision-log;
  wired into pnpm run ci after check-temp-markers; 23 loop-memory files swept clean of em dashes; LOOP-EMDASH-MOBILE
  filed for the ~200 pre-existing em dashes in apps/mobile/src/** (tracked separately, CI scope expanded later).
- shipped (docs): README iteration count 78+ -> 82+; em dashes swept from docs/decision-log.md.
- proof: pnpm typecheck clean (mobile+web); pnpm lint clean (505 files); 1135/1135 tests (181 suites, +14 new);
  pnpm run ci green including new check-no-em-dash gate; do-work-auditor PASS (after fixing em dash in new comment
  and setting REST-TIMER-ACCURACY to doing not done). Pushed to main.
- deferred / escalated: MISSED-REP implementation -> next tick (rn-expo-pipeline). WARMUP-PERDAY and
  REST-TIMER-ACCURACY owe on-device Maestro smokes (accrued in validation-debt). WEB-SIGNOFF still blocked on
  Alex's #needs-input reply. LOOP-EMDASH-MOBILE -> future tick (apps/mobile em-dash sweep).

## 2026-06-07 tick-3 (Exp 81): Progress-grid correctness cluster (3 task-queue bugs) + warmup spec
- shipped (BUG, logic, task 1513375490184843334): `projectTopSetWeight` in `domain/progression.ts` mapped
  every Progress-grid day through `prescription(3)[day-1]`, so day 1 read 75% and day 2 read 85% of TM instead
  of that week's real top set. Now maps day d -> week d top set `prescription(d)[2]` (85/90/95%), matching the
  live Today/Home headline. This corrected BOTH the future projections AND the "now"/next cell. SOUL math line.
- shipped (BUG, data, task 1513368638764093490): past cycles in the Progress TM column always showed the
  latest TM (`projectCycleRows` flattens past cycles to current TM). `useLiftProgression` now reads the
  historical `trainingMaxSnapshot` from a logged session in each past cycle; falls back to projected only for
  a gap cycle with no session. New integration test (complete a cycle -> past row 250, current 260).
- shipped (FEAT, UI, task 1513375762559008789): D4 (TM test) cells now show reps AND direction. `ProgressGridCell`
  secondary line renders marker + reps together ("↑ × 5"); `ProgressLiftRow` passes reps on tm-test cells. New
  primitive behavior test (marker+reps / reps-only / marker-only). UI -> accrued validation debt for the smoke.
- shipped (Q-QUALITY mandatory slice): de-duplicated the twin `ProgressGridCell` render paths in
  `ProgressLiftRow` (plain vs JustCompletedAnimator-wrapped) into one typed `cellProps` object - the exact
  duplication that forced a two-site `reps` edit minutes earlier. Behavior-preserving; tests unchanged-green.
- shipped (DESIGN routing, task 1512218815356862494): rn-designer spec for per-day warmup ramps
  (`apps/mobile/_workspace/warmup-per-day-spec.md`) - bridges to each day's top set so the TM-test day goes
  90 -> 100 instead of 60 -> 100; pure `warmupsForDay(Week)`, 10 fast-check invariants. Backlog WARMUP-PERDAY
  filed (doing); implementation routes through rn-expo-pipeline next tick.
- proof: `pnpm typecheck` clean (mobile+web); `pnpm lint` clean; full `pnpm test` 1121/1121 (181 suites, +6).
  `projectTopSetWeight`/`projectCycleRows` consumed ONLY by `useLiftProgression`, so the fix is contained to
  the Progress screen (verified by grep). Days-of-Cycle pin: audited mobile, already consistent (Cycle/Day
  labels; the only "week" strings are a legit calendar "This week" window + "days per week" frequency) - no change.
- deferred / escalated: WARMUP-PERDAY + MISSED-REP implementations -> next tick via rn-expo-pipeline.
  WEB-SIGNOFF still blocked on Alex's em-dash reply in `#needs-input` (no response yet). PROG-GRID-FIX D4
  visual owes one Progress Maestro smoke before `done`. TTS departure fired but homelab unreachable (non-blocking).

## 2026-06-01 tick-2: Days-not-Week consistency, plate-hint truth fix, barrel purge, missed-rep design
- shipped (WEB / live pin 1510485259): `apps/web/src/pages/index.astro` user-facing cycle-position labels
  Week->Day (ledger header + Week01-04 -> Day 01-04; matrix W1-W4 -> D1-D4; renamed dead `week-num` class
  to `day-num`; "week over week" -> "cycle over cycle"; "Every four weeks the TM bumps" -> "At the end of
  each cycle the TM bumps", which fixes a self-contradiction with the page's own "not 4 calendar weeks"
  line). Left legit concepts intact ("7th Week Protocol", "days per week" frequency, "not 4 calendar weeks").
- shipped (bug fix): `livePlateHint.ts` per-side delta rounding 1-decimal -> 2-decimal. Two snapped weights
  differ by a multiple of 2.5lb/1.25kg, so per-side is a multiple of 1.25kg; the old `*10)/10` showed a real
  1.25 kg/side as a lying "1.3". New test asserts `+1.25 kg per side`. lb cases (15, 7.5) unchanged.
- shipped (Q-QUALITY mandatory slice + removal): deleted all 8 `features/` barrel `index.ts` files
  (features/CLAUDE.md rule 3 violation CI wasn't catching), rewired ~12 import sites to concrete files, and
  added a barrel guard to `scripts/check-boundaries.sh` so it can't regress (allows design/primitives/).
- shipped (feature design, task-queue 1511224654327447663): rn-designer produced the missed-rep program-
  correction spec (`_workspace/01_design_spec.md`) reusing the TM-Test suggestion card + apply sheet;
  suggest-never-mutate, first-miss Reset(-10%)/off-day choice, forced reset on 2nd consecutive miss, new
  `lift_miss_state` table, pure property-tested `missResetTm`/`classifyAmrapMiss`. Backlog item MISSED-REP
  filed (doing); implementation is next major slice via rn-expo-pipeline. :+1:'d the task (design in flight).
- shipped (LOOP / escalation): posted the WEB-SIGNOFF em-dash either/or to `#needs-input` (Discord reachable
  now), broadened to the wider ~157-instance web em-dash debt (options C/D). Filed
  `loop-memory/22-web-em-dash-debt.md` (do NOT blind-sweep; placeholder glyphs must stay).
- proof: `pnpm typecheck` (mobile+web) clean; `pnpm lint` clean (503 files); full `jest` 1115/1115 (179
  suites); `check-boundaries.sh` exit 0; Astro build 153 pages exit 0. do-work-auditor PASS on all 4 code
  items (independently re-ran the full suite + boundary check, confirmed behavior-preserving).
- deferred / escalated: WEB-SIGNOFF + web em-dash policy -> awaiting Alex's reply in `#needs-input`.
  MISSED-REP implementation -> next tick. No UI-visual item marked done; no Maestro debt accrued (web copy +
  import-only structure + pure-logic fixes, all test-proven). TTS departure fired but homelab unreachable
  from this seat (non-blocking).

## 2026-06-01 tick-1: first real do-work tick (steady-state, Discord offline)
- shipped: committed the do-work migration seed (43 files: SOUL/DOCTRINE/skill/agents/scripts/work-tree
  + retired-machinery moves). Then one correctness/consistency slice and one loop-maintenance slice.
- shipped (correctness, Q-QUALITY): `useGoalState.ts` `defaultValueFor` 1rm branch `Math.round(currentTm/0.9)`
  -> `round(currentTm/0.9, displayU)`. The recurring Math.round-vs-round bug class (exps 71/78); aligns
  with onKindChange. Branch is unreachable today so it is behavior-preserving (latent-correctness fix).
- shipped (LOOP): retargeted `loop-memory/loop-criteria.md` from /auto-improve to /do-work terminology and
  swept its em dashes; added DISCORD_TOKEN-absent graceful-degradation guidance to `discord-channels.md`.
- proof: `pnpm typecheck` + `pnpm lint` (511 files) clean; full `pnpm test` 1104/178 green (via auditor);
  do-work-auditor PASS on the useGoalState slice (behavior-preserving + genuine improvement confirmed).
- CORRECTION (same tick, after Alex flagged it): Discord was NOT offline. The token is present and valid;
  the loop's own source recipe `. .env.claude.local` (no leading ./) silently fails under zsh (source
  searches $PATH, not cwd). Fixed the recipe to `. ./.env.claude.local` in the do-work SKILL, the
  distiller agent, discord-channels.md, and 17-website-improve-strategy.md; added a load-assert and a
  gotcha note. THEN read Discord for real: 1 active #loop-criteria pin ("Days of Cycle, not Week"), 1
  UNACKED #task-queue item (1511224654327447663: design help for correcting a program after a missed
  rep/set), rest acked. Posted the corrected #auto-improvements summary.
- pending: the unacked missing-rep/set feature is a sizable rn-expo-pipeline design task; surfaced to Alex
  rather than auto-started mid-correction. Not :+1:'d yet (only ack when shipping).
- honest-pacing note: still a steady-state code tick (mature green codebase, 1104 tests); surveyed both
  FlatLists + the PrCelebration animation hooks and found them already correct, so no surface area was
  manufactured. TTS departure was skipped (the same sourcing bug suppressed HOME_TTS_URL too, and the
  expedition had already "departed").
- shipped: the do-work working tree landed - SOUL.md, DOCTRINE.md, the work-graph (`work/backlog.md`),
  this LOG plus the validation-debt ledger, the `scripts/` (check-memory, validation, build-and-validate),
  and the do-work-auditor + distiller agents. The loop's durable knowledge stays in `loop-memory/`.
- shipped: the old machinery is retired - `docs/superpowers/queue.yaml` is fully drained and the
  `initial-implement` pipeline is no longer live. do-work agents plus the `rn-expo-pipeline` skill (for
  features) are now the executors; `work/backlog.md` is the only task model.
- proof: bootstrap migration, no code-behavior change to the app; validated by structure (this is the seed
  tick, not a work tick).
- deferred / escalated: the first real tick orients on this tree - reads this LOG and `work/backlog.md`,
  ranks ready items, and begins the normal Orient -> Prioritize -> Work -> Record cadence.
