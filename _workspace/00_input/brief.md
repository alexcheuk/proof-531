# TM Test Week — replace Wendler Original 5/3/1 deload with 7th Week Protocol

**Slug:** `tm-test-week`
**Mode:** Spec only. Stop after design. Do NOT implement.
**Working branch (mandated by session):** `claude/deload-set-research-q9Fni` (not `feat/<slug>` — environment override). No commit at end of spec phase.

## Problem statement

Week 4 in the current app prescribes a classic Wendler deload — 40/50/60% × 5 working sets. But warmups (applied to every session) are 40/50/60% × 5/5/3. On deload day the lifter ramps to 60% × 3, then immediately re-ramps to 60% × 5. Six sets, top weight ~2 reps apart. The week is mechanically redundant — and motivationally a ghost week. The user (a serious lifter chasing 2-plate → 3-plate bench) wants Week 4 to *do something*.

## The replacement: 7th Week TM Test (from Forever 5/3/1)

Replace the three deload working sets with a single TM Test:

- **Warmups stay** (40/50/60% × 5/5/3 — unchanged).
- **Single top set:** 3–5 reps at 100% of current TM. Target range, not AMRAP — the goal is *verify*, not grind. Hard cap (suggested ~5 reps; designer can pick exact UX wording).
- **BBB skipped on Week 4.** Test set IS the work. Existing accessories: designer's call — lean toward keeping accessories optional/light.
- **TM-adjustment suggestion** computed from reps achieved at TM:
  - **5+ reps** → TM was conservative. Suggest standard 5/3/1 next-cycle increment: +5 lb (upper) / +10 lb (lower).
  - **3–4 reps** → TM is honest. Suggest hold (no increment this cycle).
  - **0–2 reps** → TM is too high. Suggest −10% reset.
- The suggestion is **a calm note, never automatic**. The lifter is the decision-maker. Wherever the existing post-cycle TM-bump flow lives, the suggestion plugs into that — surfaced, not enforced.

## What changes in the app

Designer scope:

1. **Domain (`src/domain/schemes.ts`, `src/domain/progression.ts`)**
   - Week 4 working sets: replace three-set deload prescription with a single `tm-test` set at 100% TM, 3–5 rep target.
   - New `SetKind` value: `'tm-test'`. Distinct from `'amrap'` (different UX semantics — bounded target, not max-effort).
   - BBB prescription on Week 4: empty array (or however the codebase already represents "no BBB").
   - New pure function: `tmAdjustmentSuggestion(repsAchieved: number): { kind: 'increment' | 'hold' | 'reset'; deltaLb?: number; resetPct?: number }`. Property-testable. Designer specifies exact signature.

2. **Today + Live screens (`apps/mobile/src/features/session/`)**
   - Week 4 session: warmups band → single TM Test set with a rep-target band (e.g. "3–5 @ 100%").
   - Visual differentiator vs AMRAP — different label ("TEST" not "AMRAP"), different post-set affordance.
   - Post-set: TM-adjustment suggestion shown calmly, e-ink style. No celebration, no streak motion.

3. **Home cycle strip (`apps/mobile/src/features/home/components/CycleStrip.tsx`)**
   - Week 4 label changes from "Deload" → designer's pick ("Test", "TM Test", "Verify" — designer decides what reads best on the strip in 5–6 chars).

4. **Progress grid (`apps/mobile/src/features/progress/`)**
   - Week 4 cell needs a new variant. Shows reps achieved at TM with a pass/hold/reset glyph.
   - Historical view: at-a-glance scan of which cycles had a passed TM test.
   - Coordinate with the already-shipped progress redesign (see `_workspace_archive/20260527-011104/00_input/canonical-progress-v3.jsx` and `canonical-progress-final.png` for the current canonical look — Week 4 cell needs to fit that grid system).

5. **Settings prescription view (`apps/mobile/src/features/settings/sections/CyclePrescriptionSection.tsx`)**
   - Week 4 row reflects the new prescription. "TM × 3–5" (or designer's pick).

## Constraints (drift check against INTENT.md)

- **Opinionated replacement, not a toggle.** Do not add a setting "use deload instead of TM test." The app is for a serious 5/3/1 lifter; pick one and ship it.
- **E-ink monochrome holds.** Calm paper-logbook. No celebratory animation on a passed TM test. The number IS the celebration.
- **Suggestion, not automation.** The TM-adjustment is surfaced; the lifter decides.
- **Forward-only schema migration.** New `'tm-test'` kind is introduced. Old logged `'working'` deload sets in the DB (from cycles already completed under the old prescription) keep their old kind and render under the existing visual. Do not retroactively re-label history.
- **No new design tokens** unless absolutely required. Reuse existing ones. If a new token is genuinely needed, justify it in the spec's `## New primitives` section.

## PWA reference

The PWA at `~/Development/531-pwa/` is **not present in this remote execution environment**. The Explore agent already confirmed this. Treat this feature as **net-new** — there is no PWA behavior to port. Design from scratch within the existing 531-mobile token system and component library.

## Deliverable

`_workspace/01_design_spec.md` with the standard rn-design-spec sections (per `.claude/skills/rn-design-spec/SKILL.md`):

- Intent
- PWA reference (state explicitly: net-new, no PWA source)
- Screens & flow
- Per-screen breakdown (Today, Live, Home, Progress, Settings — all under Week 4 conditions)
- Data contract (domain types, accessor shapes, hook return types)
- Domain logic (new pure functions including `tmAdjustmentSuggestion`, signature + property-test ideas)
- Migration handling (DB schema notes; how old `'working'` deload sets coexist with new `'tm-test'` sets)
- Token usage (which tokens; justification if any new ones)
- Component-level behavioral assertions for QA (a checklist QA can run later)
- Out of scope
- Open questions (surface to user; pipeline pauses on non-empty list)

**Stop after writing the spec.** No implementation, no QA, no commit.
