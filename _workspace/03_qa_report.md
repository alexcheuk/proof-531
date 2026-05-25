# QA report — Progress screen (feat/progress-screen)

## Verdict
**PASS**

## Static checks
- `pnpm typecheck` — exit 0 (mobile + web)
- `pnpm lint` — exit 0 (Biome, 451 files)
- `pnpm test` — exit 0 (155 suites / 939 tests; new coverage: `progression.test.ts`, `liftGoal.test.ts`, `liftProgression.test.ts`, `GoalStrip.test.tsx`, `ProgressGridCell.test.tsx`, `ProgressScreen.test.tsx`)
- Metro bundle (`expo export --platform ios`) — exit 0 (3.4 MB hbc; every import resolved)

## Boundary checks
| Rule | Result |
|------|--------|
| (a) Hex literals outside `src/design/` | clean — only matches in pre-existing test assertions; nothing introduced |
| (a) Suspicious px literals outside `src/design/` | clean — matches are JSDoc/comment lines only |
| (b) React/async/Drizzle inside `src/domain/` | clean — `progression.ts` is pure |
| (c) Direct `drizzle` import outside `src/data/` | clean — only test files import drizzle-orm/better-sqlite3 (legit test infra) |
| (d) Barrels in `features/` or `domain/` | new Progress feature has none; only pre-existing barrels remain |
| (e) One-way import direction | clean — `features/progress/` imports `@/app/routes` per declared boundary helper pattern |

## Spec compliance
All 7 "decisions on open questions" verified in code:

| Spec section | Verified at |
|--------------|-------------|
| Entry via `LiftPageTitle` Pressable (≥44pt hitSlop, haptic on press-in) | `LiftPageTitle.tsx:38-89`, `LiftPage.tsx:71,94` |
| Route `/progress/[lift]` thin shell with `isLift` guard | `apps/mobile/src/app/progress/[lift].tsx`, `_layout.tsx` |
| `goTo.progress(router, lift)` helper | `routes.ts:91-95` |
| Lift pager (FlatList pagingEnabled) + decorative PagerDots | `ProgressScreen.tsx:119-137`; `useProgressCarouselSync` |
| Header-only TM line `TM 230 · e1RM 248` | `ProgressScreen.tsx:292` |
| Filled / outlined / ghosted cell variants per token table | `ProgressGridCell.tsx:72-87` |
| Deload ✓ / em-dash markers | `ProgressGridCell.tsx:116-120` |
| E1rmCell past `ink0` / projected `ink2` / optional ★ | `E1rmCell.tsx:50-58, 67-68` |
| GoalRuleRow dashed `lineStrong` | `GoalRuleRow.tsx` |
| GoalSheet — NumberStepper + live "in ~M cycles" + Save/Clear + optimistic + rollback | `GoalSheet.tsx`, `useSetLiftGoal.ts` |
| `lift_goals` schema + migration + runMigrations entry | `schema.ts:76`, `0001_init.ts:58`, `runMigrations.ts` |
| Session-complete invalidates `['liftProgression']` prefix | `useLiveScreenEffects.ts:159` |
| Empty state copy `LOG A SESSION TO LIGHT UP THIS GRID` | `ProgressScreen.tsx:237` |
| No-goal copy `SET AN e1RM GOAL` / `TAP TO PICK A TARGET` | `GoalStrip.tsx:67-70` |
| Past-cell tap → `goTo.complete(router, sessionId, { from: 'history' })` | `ProgressScreen.tsx:230-232` |
| Future cell non-interactive (`accessibilityRole: 'text'`, no Pressable) | `ProgressGridCell.tsx:140-148` |
| Property-test invariants (all 6) | `progression.test.ts:45-66, 86-108, 127-143, 192-208, 231-255, 277-292` |
| Skeleton scaffold | `ProgressScreen.tsx:430-446` |
| QueryShell error envelope | `ProgressScreen.tsx:92-95, 168` |

**Refactor noted:** spec showed `currentRow` as a separate field on `LiftProgression`. Implementer folded the current cycle as `futureRows[0]` and surfaced it via the `eyebrow='CURRENT'` label — functionally equivalent, simpler render. Acceptable.

## Cross-layer consistency
Traced `useLiftProgression` return → `ProgressScreen.ProgressLiftPage` → `LiftHeader` → `GoalStrip` → `ProgressGridBody` → row → cell. Every destructured field exists on the emitted shape. No field-rename happens between layers — the same property names (`topWeight`, `projectedWeight`, `crossesGoal`, `e1rmKind`, `cyclesUntilGoal`) flow through the entire stack. The `cell.kind === 'last-done'` discriminant correctly maps to `variant='outlined'` and preserves the past-tap callback (spec: "tap outlined cell: treat as a past cell").

## Implementer's flagged items
1. **Android dashed borders** — accepted platform risk per spec; no SVG fallback implemented. iOS PASS, Android requires device QA.
2. **Outlined "you are here" placement** — verified: data hook sets `kind: 'last-done'` exactly when `s.sessionId === mostRecentSessionId` (newest `startedAt`). Correct per spec.
3. **`GoalSheet title=" "` workaround** — confirmed: SheetLayout always renders `<Heading>{title}</Heading>`. The single-space node emits an invisible vertical gap. Nit (see Findings).
4. **Pager dot count with disabled lifts** — logic correct; visual review unverifiable from this environment.

## Findings

### Nit-1 — `title=" "` workaround leaks a Heading whitespace node
- **Where:** `GoalSheet.tsx:127`; `SheetLayout.tsx:88-90`
- **Fix (follow-up):** make `SheetLayout.title` optional; skip the `<Heading>` when only `eyebrow` is supplied.

### Nit-2 — Cell accessibility labels omit unit
- **Where:** `ProgressScreen.tsx:391, 407`
- **Description:** Spec a11y section specifies `'… {weight} {unit} for {reps} reps'` / `'projected {weight} {unit}'`. Implementation emits unitless numbers.
- **Fix:** thread `unitGlyph` into `ProgressGridBody` and concatenate into labels. One-line change in two places.

### Nit-3 — `LiftHeader` blends best-PR e1RM into the header line
- **Where:** `ProgressScreen.tsx:209` (`currentE1RM={Math.max(data.currentE1RM, bestE1RM)}`)
- **Description:** Header reads max of current-cycle best and all-time PR. Defensible UX, but a small drift from the data hook's cycle-scoped `currentE1RM`.
- **Fix:** none required; consider a brief code comment explaining the intentional preference.

## Known platform risks
- **Android dashed-border rendering** — `borderStyle: 'dashed'` on ghosted `ProgressGridCell`, `GoalStrip`, and `GoalRuleRow` may render unevenly on some Android driver/skia combinations. Spec accepted the risk; no SVG fallback. Requires Android device QA.
- **Pager snap feel under reduced-motion / 2-3 enabled lifts** — not exercised by behavior tests; mirrors working Home hook so risk is low. Manual device verification recommended.
