# PWA reference files for Progress screen

The PWA at `~/Development/531-pwa/` has **no existing Progress screen** — `HistoryScreen.tsx` is a placeholder with empty-state copy only. The Progress screen is **net-new**, not a port. However, several PWA files supply the visual language, domain math, and tap-target priors the designer must align with.

## Visual language (the e-ink vocabulary to match)

- `~/Development/531-pwa/src/features/home/components/CycleStrip.tsx`
  - The established 4-week grid pattern in the PWA. Look at:
    - **Active cell:** `bg-ink-0` (inverted ink-on-paper, ink fills the cell, background text inverts)
    - **Done cell:** plain bg + corner `✓` glyph at top-right
    - **Future cell:** `text-ink-3 opacity-70`
    - **Grid chrome:** `border border-line-strong` outer, `border-l border-line` between cells
    - **Eyebrow:** `caps mb-2` with text "THIS CYCLE"
  - The Progress screen's cell treatments should be a direct generalization of this: filled = active vocabulary, outlined = a new "last-completed" treatment, ghosted = future vocabulary.

- `~/Development/531-pwa/src/components/masthead.tsx` (referenced by HistoryScreen)
- `~/Development/531-pwa/src/components/ui/title-block.tsx` (referenced by HistoryScreen)
- `~/Development/531-pwa/src/features/history/HistoryScreen.tsx` — placeholder, but the chrome it sets up (Masthead + TitleBlock) is the standard tab-screen pattern.

## Domain math (port faithfully)

- `~/Development/531-pwa/src/features/session/domain/epley.ts`
  - `epley1RM(weight, reps)` — `weight * (1 + reps/30)`, with `reps === 1` short-circuit returning the raw weight.
  - The mobile app must use this exact formula. The shortcut is load-bearing (avoids the 225→233 onboarding artifact noted in the comment).
- `~/Development/531-pwa/src/features/session/domain/schemes.ts` — week-to-scheme mapping (5·5·5+, 3·3·3+, 5·3·1+, Deload).
- `~/Development/531-pwa/src/features/session/domain/increments.ts` — TM progression rules (+5 upper / +10 lower per cycle by default).

## Tap target on past cells (session detail)

- `~/Development/531-pwa/src/features/session/SessionCompleteScreen.tsx`
  - The "stamped receipt" view shown after a session completes (Rev 4).
  - **Confirm in the spec:** is this the right destination for "tap a past cell on the Progress grid"? It currently is reached only as a post-completion screen, parameterized via `useParams`. The Progress screen would need to route to it with a session ID.
  - If the mobile port of `SessionCompleteScreen` doesn't exist yet (likely), scope the tap as out-of-this-feature and either disable past-cell taps or push to a placeholder with a "Coming soon" TitleBlock. **Designer to call this in the spec.**

## Data — what does Progress need to read?

- `~/Development/531-pwa/src/db/accessors/session.ts` — session reads.
- `~/Development/531-pwa/src/db/accessors/setLog.ts` — per-set reads, where AMRAP top sets live.
- The mobile equivalents will live under `src/data/accessors/` once implemented. Designer should specify a per-lift accessor signature like `useLiftProgression(liftId): { history: CycleRow[], currentCycle: CycleNumber, ... }`.

## Routing entry point

- `~/Development/531-pwa/src/app/routes.tsx` — PWA route table.
- `~/Development/531-pwa/src/features/home/HomeScreen.tsx` — the TODAY screen source of truth.
- In the mobile app, the Progress screen is reached from TODAY by tapping a lift. Designer should specify:
  - The exact affordance on TODAY (tap the lift name? a separate icon? long-press?). Defer to existing TODAY screen design if a port already exists in `apps/mobile/src/features/`; otherwise specify the affordance and note that TODAY needs an update.
  - The expo-router path (e.g. `/progress/[lift]`).

## What the PWA does NOT have

- No multi-cycle history grid.
- No e1RM goal-setting UI.
- No e1RM projection logic.
- No goal-line achievement marker.

These are all net-new for mobile. The designer is not porting them; they are designing them fresh, but consistent with the e-ink vocabulary above.
