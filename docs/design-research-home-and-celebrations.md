# Design research — Home, celebrations, and day-preview

> Research note (2026-06-13). Commissioned from Alex: rethink the Home page,
> simplify busy screens, make finishing a cycle / bumping the TM a bigger
> moment, chase awwwards-grade polish, and add a way to preview any day's
> working sets by tapping it.
>
> This is a **proposal**, not a spec. The drift check is `docs/INTENT.md`:
> e-ink, paper, monochrome, a well-designed logbook — not a SaaS dashboard.
> Every idea below is held against that. Where an idea risks pulling sideways,
> it says so. Nothing here ships until it goes through `rn-design-spec` →
> `rn-frontend` → `rn-qa`.

---

## 0 · What the app does today (grounding)

The running app is the source of truth (DESIGN.md is historical). Current
state of the surfaces in scope:

- **Home** (`features/home`) — a horizontal carousel, one page per enabled
  lift. Each `LiftPage` stacks: eyebrow (`C3 · W2 · in-progress`), tappable
  lift title, a `TM TEST` / `LAST TRAINED` hint, the **`TopSetBlock`** (the
  single climax set — e.g. `185 lb × 5+`, `85% TM`, mini plate viz), the
  **`CycleStrip`** (D1–D4 schemes, current day amber-bordered), **`LiftStats`**
  (TM · BEST e1RM · CYCLE), a `SEE PROGRESS →` link, and the `Begin/Resume`
  pill.
- **Today** (`features/session/TodayBody`) — the full session: top-set hero,
  warmups band, all three working sets, BBB band.
- **Session complete** — masthead, title, a one-line `CycleCompleteBand`
  (`★ Cycle 01 · COMPLETE`), TM-adjustment note + apply sheet (week 4), the
  full-screen-worthy `PRCertificate` for PRs, a receipt, and a `CycleGrid` of
  progress dots.
- **PR moment** (`features/session/PrCelebration`) — a genuine moment: the
  `Stronger.` typewriter hero, status-bar tint, amber period.
- **Progress** (`features/progress`) — per-lift "Cycle matrix"; **past** cells
  are already tappable → they open the historical session receipt.

The palette is e-ink paper (`#E7E3D6`) and near-black ink (`#1A1812`). Every
accent token collapses to ink **except** `amber` (`#8E5345`), which is the one
permitted spark of colour and is currently spent almost entirely on the PR
period and the cycle-strip "today" border.

---

## 1 · Home: top set, or the day's working sets?

**Short answer: keep the top set as the hero, but stop hiding the other two.**

### Why the top set earns the hero slot
The top set is the one number that answers the only question a lifter asks
walking in: *is today heavy?* `85% × 5+` vs `70% × 3` is the whole texture of
the day. It's also the AMRAP set — the set that makes PRs and drives e1RM. The
"the math is the feature" principle (DESIGN §1.3) is right to elevate one
number. Replacing it with a flat 3-row table would make Home read like every
other logger and lose the glanceability.

### But the top set alone under-informs
A serious lifter mentally loads the bar *before* the warmups are done. They
want the two ramp weights too, so they can plan plate changes. Right now those
live one tap away on Today. Competitor 531 apps (Five/Three/One, KeyLifts) all
surface "current **and upcoming** sets" on the home surface / widget — it's
table stakes for the audience. The top set answers "how heavy"; the working-set
ladder answers "what do I load, in what order."

### Proposal — "hero + quiet ladder"
Under the `TopSetBlock`, add a compact, **non-interactive** working-set ladder:
three hairline rows, mono numerals, no plate viz, no card chrome.

```
TOP SET
185 lb  × 5+          85% TM · TM 245
▔▔▔▔▔▔▔▔▔▔▔▔ [mini plate bar] ▔▔▔▔▔▔▔▔▔▔▔▔

WORKING SETS
1   65%   140 lb × 5
2   75%   165 lb × 5
3   85%   185 lb × 5+      ← top set, ink-emphasised
```

- The ladder is glance-only on Home; the *interactive* version lives on Today.
- It replaces nothing — it absorbs the visual budget freed by the simplification
  in §2 (removing `LiftStats` and the redundant cycle/TM repeats). Net density
  stays flat or drops.
- On week 4 the ladder collapses to the single TM-test row (already a special
  case in the code) — no awkward empty rows.

This directly composes from existing pieces: `WorkingSetsBand` already renders
this exact ladder on Today; a `compact`/`readOnly` variant is the smallest
honest change.

---

## 2 · "Too busy" — where to simplify

The strongest single finding: **Home repeats the same three facts up to three
times each.**

| Fact | Shown in |
|---|---|
| Cycle number | eyebrow (`C3`), `CycleStrip` context, `LiftStats` "CYCLE" cell |
| Week / day | eyebrow (`W2`), `CycleStrip` (current-day border) |
| Training max | `TopSetBlock` meta (`TM 245`), `LiftStats` "TM" cell |
| Best e1RM | `LiftStats` cell — and it's the headline of the Progress screen |

`LiftStats` (TM · BEST e1RM · CYCLE) is almost entirely redundant on Home: TM is
already in the top-set meta, CYCLE is in the eyebrow, and BEST e1RM is the
Progress screen's whole job. It's three cells of chrome earning very little.

### Proposal
1. **Delete `LiftStats` from Home.** Reclaim the vertical space for the
   working-set ladder (§1). TM/e1RM/cycle context is one swipe away on Progress,
   where it belongs and is the focus.
2. **Demote the `SEE PROGRESS →` link.** The lift title is *already* a tap
   target to Progress (`LiftPageTitle` → `openProgress`). Two affordances to the
   same place is noise. Keep the title-tap (with a subtle chevron on the title),
   drop the standalone link — or keep only one.
3. **Let the `CycleStrip` own week/day context** and drop `W2` from the eyebrow,
   leaving the eyebrow as just `CYCLE 03` (or the in-progress state). One source
   of truth per fact.

Result: the page becomes eyebrow → title → **one dominant number + its ladder**
→ cycle strip → CTA. Five blocks instead of eight, more negative space, the
logbook metaphor intact. This is the "creative impact" — restraint *is* the
aesthetic here (confirmed by the 2026 minimalist/negative-space direction in the
trend research), not a new visual gimmick.

The same redundancy audit should run on Today and Session-complete as a
follow-up — but Home is where it bites first and hardest.

---

## 3 · Bigger celebration: finishing a cycle + bumping the TM

**This is the highest-leverage opportunity in the whole brief**, because of a
real asymmetry in the current app:

> A single-rep AMRAP PR gets a full-screen `Stronger.` typewriter moment.
> Completing an **entire 4-week cycle** gets a one-line band. Applying the
> **TM increase** — the literal point of 5/3/1, the thing that makes you
> stronger for years — gets a calm sheet.

The emotional weight is inverted. In 5/3/1 the cycle is the unit of progress and
the TM bump is the payoff; that should be the app's loudest, proudest moment.

### Proposal — a dedicated "Cycle cleared" moment
Reuse the `PrCelebration` scaffolding (it already nails the e-ink celebration
language: typewriter hero, status-bar tint, amber accent, restrained motion):

1. **Trigger:** when `isCycleComplete` on the session-complete view (and ideally
   gated to the last session of the cycle, not every week-4 day).
2. **Hero:** `Cycle 03.` / `Cleared.` — same typewriter cadence as `Stronger.`,
   amber period.
3. **The TM ladder is the payoff, animated.** The four lifts list with their old
   TM rolling up to the new TM via an **odometer/number-roll** (`245 → 250`),
   `+5` / `+10` deltas inking in per lift. This makes the abstract "+5 upper /
   +10 lower" rule *visible as a win* instead of a footnote.
4. **The climactic action is applying the bump.** Today the TM apply is a quiet
   sheet; here it becomes the confirming gesture of the celebration — one
   `Lock in cycle 04` pill that commits the new TMs and rolls the odometers.
5. **Restraint guardrails (INTENT):** no confetti colour storm, no emoji, no
   sound. The existing PR confetti is monochrome bars/dots — match that. The
   amber period + the number-roll *is* the spark. One moment of motion, earned.

This also resolves a UX gap: right now the week-4 TM adjustment is easy to skip
and the bump can silently not happen. Making it the celebration's payoff means
the program actually progresses.

### Smaller related win
The `CycleCompleteBand` (the one-liner) can stay on the receipt as the *record*
of the event — the celebration is the *moment*, the band is the *log entry*.
Two different jobs; keep both.

---

## 4 · Awwwards-grade polish, through the e-ink lens

The trend research is unambiguous that 2026 "award" polish = **restraint,
negative space, considered microinteractions, and typographic craft** — not
flashy chrome. That maps cleanly onto this app. Concrete, on-brand moves:

1. **Shared-element number transition.** When you tap `Begin session`, the
   `TopSetBlock` weight on Home should *become* the 120px weight on the live
   screen — the number flies and grows rather than the screen hard-cutting.
   Reanimated 4 shared transitions make this cheap. It's the single most
   "expensive-feeling" microinteraction available and it's pure typography, so
   it's perfectly on-brand.
2. **Ink-fill cycle strip.** When a day completes, the `CycleStrip` / `CycleGrid`
   cell should fill like ink soaking paper (a quick mask wipe, ~220ms, the
   standard ease) instead of a state swap. The `JustCompletedAnimator` already
   hints at this — extend the language.
3. **Odometer numerals** for any number that *changes* as a result of user
   action: the TM on bump (§3), the live e1RM as reps tick on the AMRAP stepper,
   the rest timer. Tabular mono + a roll = premium and legible.
4. **Tactile press physics.** Every pill/cell gets a consistent press scale
   (~0.97) + a single haptic tick. Already partly present (`Haptics.selectionAsync`
   on past cells) — make it a primitive so it's uniform, not per-call-site.
5. **Paper grain.** A near-invisible (2–4% opacity) paper-fibre texture over the
   `bg0` canvas would make the e-ink metaphor physical instead of "flat beige."
   This is the one *visual* (vs motion) polish lever; must stay subliminal and be
   a single shared layer, not per-screen.
6. **Carousel as page-turn.** The Home/Progress lift carousels are plain paged
   FlatLists. A subtle parallax or page-curl easing on swipe sells the "flipping
   pages in a logbook" metaphor. Optional / lowest priority — risk of "motion for
   motion's sake," so prototype and judge against INTENT before committing.

Priority order for impact-per-risk: **1 > 3 > 2 > 4 > 5 > 6.**

---

## 5 · Preview any day's working sets by tapping

Today, **past** Progress-matrix cells open the historical receipt, but there's
no way to *preview* a day's prescription without starting a session — and the
Home `CycleStrip` (D1–D4) isn't tappable at all. A lifter who wants to see "what
does week 3 day look like" or "what was last Tuesday" has no read-only path.

### Proposal — a `DayPreviewSheet` (bottom sheet, read-only)
One reusable `@gorhom/bottom-sheet` (already a dependency) that takes a
`(lift, cycle, week)` and renders the full prescription **read-only**:

- warmups ramp · the three working sets · BBB · plate viz for the top set;
- no `Begin session` mutation, no DB write (mirrors the preview-mode the code
  already supports on Today — `completedIndices = []`, nothing persisted);
- if the day is in the past and was completed, show the *actual* logged reps
  alongside the prescription (it becomes a mini-receipt); if future/incomplete,
  show prescription only.

Wire it to two triggers:

1. **Home `CycleStrip` cells** → tap D1/D2/D3/D4 to preview that day of the
   current cycle. Turns the strip from decoration into navigation.
2. **Progress `Cycle matrix` cells** → tap any cell (not just completed past
   ones) to preview that cycle/day. Future cells become "here's what's coming."

This is one new component serving two surfaces, reusing `TodayBody`'s bands in a
read-only mode. It's the cleanest scope-to-value ratio in the brief and it
respects INTENT (no new product surface — it's a lens onto data the app already
computes).

---

## 6 · Other user-facing improvements surfaced along the way

- **Week-4 / TM-test legibility.** The TM-test day is a genuinely different day
  (single 100% set, no BBB) but on Home it's a small hint. Worth a clearer
  "verification day" treatment so users don't expect a normal session.
- **Home-screen widget.** Every competitor ships one; it's the highest-frequency
  glance surface for this audience ("what do I lift today"). Out of scope for a
  redesign pass but worth logging to the backlog.
- **Resume affordance.** The `Resume · set N of 3` copy is good; consider
  surfacing it on the `LiftTab` itself (a small dot already exists for
  in-progress) so an interrupted session is visible without swiping to its page.

---

## 7 · Recommended sequencing

Grouped by impact-per-effort, smallest honest changes first:

1. **§2 simplify Home** (delete `LiftStats`, de-dupe facts) — pure removal, lowest
   risk, immediately less busy.
2. **§1 working-set ladder on Home** — reuses `WorkingSetsBand`, fills the space §2
   frees.
3. **§5 `DayPreviewSheet`** — one component, two surfaces, high user value, no
   new product surface.
4. **§3 cycle-cleared celebration** — highest emotional payoff; reuses
   `PrCelebration` scaffolding; pairs with the §4.3 odometer.
5. **§4 polish layer** — shared-element number flight, ink-fill, paper grain — as
   a dedicated polish pass once the structure above is settled.

Each item should enter the pipeline as its own `rn-design-spec`. Items 1–3 are
behaviour-preserving / additive and low-risk; items 3–4 touch motion and must be
judged against `docs/INTENT.md` ("motion for motion's sake — out") before
shipping.

---

### Sources
- [Best Mobile App UI/UX Design Trends for 2026 — natively.dev](https://natively.dev/blog/best-mobile-app-design-trends-2026)
- [Mobile UI/UX — Design Trends Shaping 2026 — uistudioz](https://uistudioz.com/blog/mobile-ui-ux-the-design-trends/)
- [Color Scheme Trends in Mobile App Design — Envato](https://elements.envato.com/learn/color-scheme-trends-in-mobile-app-design)
- [Five/Three/One — 531 Workouts (App Store)](https://apps.apple.com/us/app/-/id1560266240)
- [KeyLifts — 531 Workout Log (App Store)](https://apps.apple.com/us/app/-/id1437949461)
</content>
</invoke>
