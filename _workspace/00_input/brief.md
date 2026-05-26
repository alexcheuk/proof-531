# Progress screen — REVISION brief

The original implementation (archived under `_workspace_archive/`) was based on a brainstorm. The user then surfaced a canonical design bundle from Claude Design (claude.ai/design) — the file `canonical-progress-v3.jsx` in this directory is the source of truth from here on.

## Decisions (locked, user-confirmed)

1. **Goal model: TM/1RM toggle** (per canonical). 1RM ≈ TM / 0.9. Drop e1RM-as-goal.
2. **Lift switcher: keep our swipe pager + dots** (diverge from canonical's tabs).
3. **Right column: TM per cycle** (per canonical). e1RM stays only as a stat in the stats triplet.
4. **Scope: full redesign per canonical** — masthead, title block, stats triplet, goal panel, cycle matrix, beyond-chart footer, footnote.

## What stays from the prior shipped feature

- Entry: tap `LiftPageTitle` headline on TODAY (and the new `SEE PROGRESS →` link).
- Route: `/progress/[lift]`.
- Past-cell tap → SessionCompleteScreen with `from: 'history'`.
- Swipe pager + dots between lifts (diverges from canonical tabs per user call).

## What changes

- `lift_goals` schema: `target_e1rm` → `target_value` + new `kind ∈ ('tm','1rm')` column.
- Domain: drop `projectE1RMForFuture` and `cyclesUntilGoal` (e1RM-based). Add `tmFromOneRm`, `cyclesUntilTmGoal`. Keep `bestE1RMForCycle`, `rollingAmrapMargin`, `projectTmForCycle`, `projectTopSetWeight`.
- `useLiftProgression`: rows expose `tm` (not `e1rm`). Add `bestE1RM` (for the stats triplet, derived from past cycles). Add `targetTM` (derived from goal kind/value). `crossesGoal` is set on the cycle whose `tm >= targetTM`.
- Primitives: drop `E1rmCell` + `GoalStrip`. Add `TmCell`. Add `now` variant to `ProgressGridCell`. Update `ProgressGridRow` for current-cycle treatment (inverted label tile + subtle row tint).
- Feature: drop `GoalSheet` (replaced by inline `GoalPanel`). Add `GoalPanel`, `StatsTriplet`, `BeyondChartFooter`. Redesign `GoalRuleRow` per canonical (2px+1px ink rules spanning grid).
- Screen layout follows canonical top-to-bottom: Masthead → TitleBlock (eyebrow + "Progress.") → Lift pager → StatsTriplet → GoalPanel → Cycle matrix → Footnote.

## Out of scope (still deferred)

- AMRAP failure / TM reset handling.
- Charts, sparklines.
- Future-cell editing.
- Notifications / sharing.

## Reference

- `canonical-progress-v3.jsx` — authoritative JSX prototype. Match visually; don't copy the React structure verbatim.
- `canonical-progress-final.png` — visual reference for the bottom 2/3 of the screen.
- `~/Development/531-pwa/` — PWA source of truth; CycleStrip is the closest visual relative for the grid vocabulary.
