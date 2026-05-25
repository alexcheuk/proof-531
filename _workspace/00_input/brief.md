# Progress screen — brief

## One-liner

Visualize a single lift's progression as a grid of cycles × days, with projected future cycles toward an e1RM goal.

## Intent

A scannable "where am I, where am I going" view. The lifter looks at one screen and immediately sees: their current cycle, the AMRAP performance behind them, the projected weights ahead, and how many cycles until they hit their e1RM goal. It is meant to make slow progress *feel* legible — the kind of thing a 5/3/1 lifter would draw in a notebook.

Aesthetic: e-ink ledger, monochrome. No charts, no curves — a grid that reads like a printed training log.

## Locked decisions (from brainstorm — do not re-litigate)

### Visual layout — Variant B "filled blocks"

- **Grid:** rows = cycles (absolute numbering, e.g. C5, C6, C7…), columns = D1, D2, D3, Deload.
- **Completed day cells:** filled block treatment (e-ink shading), show top set weight on first line, "×N" AMRAP reps on second line.
- **Last completed day:** outlined treatment (heavier border, no fill) — the "you are here" marker.
- **Future / projected day cells:** ghosted/dotted treatment, projected weight only (no reps line).
- **Deload column:** same treatment as other days but no AMRAP; ✓ when logged, dash/em-dash when projected.
- **Right column:** e1RM per cycle (past = actual, future = projected).
- **Goal line:** dashed horizontal rule between the cycles where projected e1RM crosses the user's target; ★ glyph on the crossing cycle's e1RM cell.

### Range / scroll

- Always show **current cycle + 6 future cycles**.
- Past cycles available by scrolling up.
- Current cycle anchored visually as the boundary between actual (above) and projected (below).

### Lift navigation

- **Horizontal swipe pager** between the 4 lifts (Press / Bench / Squat / Deadlift).
- Page indicator dots only — no chevrons, no tabs.
- User enters the screen on the lift they tapped from TODAY; pager lets them swipe to the others.

### Entry point

- **Sub-screen reached from TODAY.** Tap a lift name (or designated lift affordance) on the TODAY screen → push Progress with that lift selected.
- **Bottom nav stays 3-tab** (TODAY / HISTORY / YOU). No new tab.
- HISTORY tab remains the existing placeholder; Progress is not part of HISTORY.

### Goal

- **e1RM only** (no TM goal mode).
- Per-lift goal.
- Set/edit by **tapping the goal strip** at the top of the screen.
- Goal strip copy: "goal · e1RM {N}" and "~{N} cycles to go" underneath.
- **e1RM formula:** Epley `w × (1 + reps/30)` — match the PWA's `epley1RM` exactly, including the `reps === 1 ⇒ weight` short-circuit (see `~/Development/531-pwa/src/features/session/domain/epley.ts`).
- **Past e1RM** = computed from each cycle's best AMRAP set (max e1RM across D1/D2/D3 of that cycle).
- **Future projected e1RM** = uses rolling average of user's AMRAP rep margin over last 3 cycles. For new users with <3 cycles of history, fall back to assuming minimum prescribed reps (5/3/1).

### Interaction

- Tap **past cell** → opens that day's session detail screen (the SessionCompleteScreen analog — see PWA refs).
- Tap **future cell** → no-op (read-only projection).
- Tap **goal strip** → opens a small sheet to set/edit e1RM target for the current lift.

## Deferred — do not design for now

- **AMRAP failure / TM reset handling.** Flag this as a known gap in the spec. No UI for it yet. The projection currently assumes the user stays on-pace and never resets.

## Reference ASCII mock (visual intent, not literal spacing)

```
┌────────────────────────────────────────┐
│ ‹                                  ⛯   │
│              B E N C H                 │
│           TM 230 · e1RM 248            │
│            ○  ●  ○  ○                  │
│  ╌╌╌╌╌╌╌╌  goal · e1RM 285  ╌╌╌╌╌╌╌╌  │
│           ~4 cycles to go              │
│         D1     D2     D3   Deload  e1RM│
│  C5    ▓190▓  ▓210▓  ▓230▓  ▓140▓  245 │
│         ×7     ×4     ×2     ✓         │
│  C6    ▓195▓  ▓215▓  ▓235▓  ▓145▓  258 │
│         ×9     ×5     ×3     ✓         │
│  C7    ▓200▓  ▓220▓  ┃240┃  ·150·  262 │ ◄ now
│         ×6     ×4     ×3     ─         │
│  C8    ·205·  ·225·  ·245·  ·155·  268 │
│  C9    ·210·  ·230·  ·250·  ·160·  275 │
│  C10   ·215·  ·235·  ·255·  ·165·  281 │
│  ═══════════════════════════  goal 285 │
│  C11   ·220·  ·240·  ·260·  ·170·  288 │ ★
│  C12   ·225·  ·245·  ·265·  ·175·  295 │
│  C13   ·230·  ·250·  ·270·  ·180·  301 │
└────────────────────────────────────────┘
```

## Open questions for the designer to resolve (and document the choice)

1. **Empty state — brand-new user, zero completed cycles.** Probably: show projected rows starting at C1 with no goal line; goal strip shows a "set a goal" affordance. Designer specifies copy + treatment.
2. **Goal strip "before goal is set" state.** Copy + visual treatment.
3. **Session detail screen on past-cell tap.** Confirm `SessionCompleteScreen.tsx` is the target. If it requires data the mobile app doesn't yet have, scope it out as a follow-up and design the tap as a no-op for now (with a note in the spec).
4. **TM display.** Per-row TM was removed from the right column (now e1RM). TM still appears in the header stat line. Confirm header-only is sufficient, or specify a compact per-row treatment (e.g. `230 / 262`) if scanability needs it.
5. **e-ink token mapping.** Pick the design tokens used for: filled (▓), outlined (┃), ghosted (·), goal-rule (╌╌╌), achievement (★). Must work in light and dark theme. Cross-reference the PWA's CycleStrip vocabulary (`bg-ink-0` active, `text-ink-3 opacity-70` ghost, `✓` glyph) — this is the established e-ink visual language.

## Out-of-scope reminders

- No charts, no graphs, no animated transitions on the goal line.
- No editing future projections by the user (would conflict with the read-only stance).
- No notifications / nudges ("you'll hit your goal in N weeks!").
- No social / sharing.
