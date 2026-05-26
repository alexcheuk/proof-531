# 531 Strength

> A 5/3/1 + BBB + Assistance training tracker built for the gym floor.
> Mobile-first. Glanceable. Honest about progress.

---

> **Status note (2026-05-26).** This document is the **original product spec**.
> Sections 1 (product direction) and 2 (the program) still describe what got
> built. Section 3 onward (visual language, information architecture, screens)
> reflects the original "dark canvas / hot-orange accent / Space Grotesk +
> JetBrains Mono" target. During Phase A the visual language pivoted to
> **paper / e-ink / amber-dot / IBM Plex Sans + Mono + Sans-Condensed**, and
> the tab bar landed at four tabs (Today / Progress / History / Settings),
> not five. The pivot is documented across `apps/mobile/src/design/tokens.ts`
> (the authoritative source of design tokens), `CLAUDE.md` (current stack),
> and the decision log. This file is kept as historical record of the
> original direction — useful for context, **not authoritative for current
> design work**. When in doubt, trust the running app.

---

## 1 · Product direction

### Who it's for
Intermediate-to-advanced lifters running Jim Wendler's **5/3/1** linear-periodization program. People who already know the system, want a clean log, and don't want their app to nag them about "rest day reminders" or "compete with friends." They want to walk in, see what the bar should weigh, do the work, walk out.

### What it does
- Holds your **training maxes** (TM = 90% of 1RM) and snaps every working set to the right percentage and rep target for the current week.
- Lets you **log AMRAP sets** with live estimated-1RM feedback.
- Shows a **plate calculator** so you know which plates to load before you start adding them.
- Tracks **cycle progression** — auto-bumps TMs +5 (upper) / +10 (lower) after each 4-week cycle.
- Programs your **BBB volume** (5×10 @ 50% TM) and surfaces an assistance library by movement pattern (push / pull / legs / core).
- Keeps a **history with PRs** as estimated 1RMs from your top AMRAPs.

### What it explicitly doesn't do
- No social feed. No friends. No comparing.
- No "AI coach." No recommendations beyond the program math.
- No streak guilt. Missing a day doesn't punish you — you pick up where you left off.
- No prescriptive schedule. **You pick the lift. Press start.**
- No emoji, gamification badges, or motivational quotes.

### Design principles
1. **Glanceable in gym lighting** — dark canvas, hot accent, large monospaced numerics. Read at arm's length, sweaty hands, fluorescent overhead.
2. **One-handed input** — every tap target ≥ 44px. Steppers always on the same horizontal axis. AMRAP entry isolated on the live screen.
3. **The math is the feature, not the screen** — the percentages, plate calc, and progressive overload happen invisibly. The user sees a weight and a rep target. That's it.
4. **Respect the user's intelligence** — no tutorial popovers. No "Are you sure?" modals on routine actions. If you tap "set complete," the set is complete.
5. **Progress over perfection** — show estimated 1RMs (which lie a little) instead of strict tested 1RMs (which lie a lot and require dangerous testing days). The user sees a number that goes up, slowly, for years.

---

## 2 · The program (for reference)

531 Strength implements the standard Wendler protocol:

| Week | Set 1 | Set 2 | Set 3 (AMRAP) | Scheme name |
|------|-------|-------|---------------|-------------|
| 1    | 65% × 5 | 75% × 5 | 85% × 5+ | "5/5/5+" |
| 2    | 70% × 3 | 80% × 3 | 90% × 3+ | "3/3/3+" |
| 3    | 75% × 5 | 85% × 3 | 95% × 1+ | "5/3/1+" |
| 4    | 40% × 5 | 50% × 5 | 60% × 5  | Deload     |

Percentages are of **Training Max** (90% of true 1RM, never of true 1RM itself — Wendler's whole point).

After each 4-week cycle: **+5 lbs upper body**, **+10 lbs lower body** to the TM. Repeat.

**BBB (Boring But Big):** 5 × 10 of the same main lift @ 50% TM, performed after the main 5/3/1 work.

**Assistance:** 50–100 reps each from four buckets — push, pull, single-leg, core. User-chosen from a library.

---

## 3 · Visual language

### Mood
Athletic-technical. The aesthetic reference is closer to a fuel-injection diagnostic readout or a Linear / Vercel admin console than to a typical fitness app. No serif italics. No editorial photography. No gradient hero blobs.

### Color
| Token | Hex | Role |
|---|---|---|
| `--bg-0` | `#0B0C0E` | App canvas, deepest |
| `--bg-1` | `#131519` | Card surface |
| `--bg-2` | `#1B1E24` | Raised surface, history table rows |
| `--bg-3` | `#262A32` | Input, hover, active chip |
| `--ink-0` | `#FAFAF5` | Primary text |
| `--ink-1` | `#D8D8D2` | Secondary text |
| `--ink-2` | `#8E8F8A` | Tertiary / caps labels |
| `--ink-3` | `#5C5E5A` | Muted / disabled |
| `--line`  | `rgba(250,250,245,0.08)` | Hairlines |
| `--hot`   | `#FF5530` | **Primary accent — energy, current, AMRAP, PR-on-dark** |
| `--lime`  | `#D4FE3F` | Completed states (subtle, used sparingly) |
| `--ice`   | `#5BB6F0` | Info |
| `--amber` | `#FFB13A` | Deload week |
| `--red`   | `#F03A3A` | Overdue, warning |

The accent is **one color** — `--hot` orange — used aggressively. Active states, current week, AMRAP badges, PR moments, primary CTAs, the dot in the wordmark. Every other surface is greyscale. This contrast does the work.

### Typography
- **Display / UI sans:** Space Grotesk (400/500/600/700). Tight geometric, slight humanist warmth, holds at all sizes.
- **Tabular numerics & all caps labels:** JetBrains Mono (400/500/600/700). Every weight, percentage, rep count, set number, and timestamp lives here.
- **No serif.** No italics. Editorial flourish is replaced with caps + wide tracking.

Type vocabulary:
- `eyebrow` — 11px JetBrains Mono, uppercase, +0.16em tracking, `--ink-2`
- `caps` — 10px JetBrains Mono, uppercase, +0.18em tracking, `--ink-2`
- `weight-num` — JetBrains Mono 500, tabular-nums, -0.04em tracking. The number itself.
- `display heading` — Space Grotesk 600, big sizes (32–64px), -0.025 to -0.035em tracking

### Shape
- Radii: 4 / 8 / 12 / 18 / 999 — no 6 or 10, never reach for half-pills.
- Borders are hairlines (`rgba(250,250,245,0.08)`), not card outlines.
- Cards are 12px radius, padded 16–22px.
- Primary buttons are full pill (999), inverse fill (`--ink-0` on dark = brutalist white pill with dark text), or hot fill.

### Motion
- Default ease `cubic-bezier(0.2, 0.7, 0.2, 1)` over 0.22s. Soft tail, no bounce.
- PR confetti — 24 pieces, no faces, no emoji — colored bars and dots that fan out for 1.4s.

---

## 4 · Information architecture

### Bottom tab bar (5 tabs)

| Tab | Route | Purpose |
|-----|-------|---------|
| Home | `home` | Free-pick lift selector. Always the landing screen. |
| Train | `today` | Detail view of the picked lift's session — three sets + BBB + assistance. |
| Cycle | `cycle` | 4-week × N-lift grid showing the whole cycle at a glance. |
| History | `history` | Past sessions, PR strip, filterable by lift. |
| You | `settings` | Units, plate set, percentage split, TMs, active lifts, rest timers. |

### Out-of-flow screens
- **Onboarding** — first-run flow, shown only when user has no TMs.
- **Live lift** — full-screen dark overlay invoked by tapping a set on the Today screen.
- **PR celebration** — modal overlay triggered when an AMRAP set produces a new estimated 1RM.

---

## 5 · Screens

### 5.1 Onboarding
Four-step flow:

1. **Intro** — wordmark, the elevator pitch ("Get strong slowly."), three bullet points about how the program works.
2. **Lift selection** *(new)* — "Which lifts are you training?" with four togglable lift cards. User can pick 1–4. Single-lift mode is fully supported.
3. **Per-lift entry** — repeated once per enabled lift. Two modes via a segmented control:
   - "I know my 1RM" → single weight stepper
   - "Calculate it" → weight stepper + reps stepper, runs Epley `1RM = weight × (1 + reps/30)`
   Bottom card shows the computed 1RM and the derived TM (90%) in `--hot`.
4. **Review** — list of enabled lifts with their 1RMs and TMs. Conservative-is-good note. "Start cycle 1" CTA.

### 5.2 Home — the free picker
The most important page. Replaces the typical "today's prescribed lift" hero.

- Greeting eyebrow ("good morning,")
- Headline: **"Pick a lift. Press start."** (the second line in `--hot`)
- Cycle status pill — `C3 · W2 · week 2 scheme · 3/3/3+`
- **Lift picker grid** — one card per enabled lift:
  - Caps lift name (SQUAT / BENCH / DEAD / PRESS)
  - "Top set · 90%" eyebrow
  - Big weight + unit + reps target
  - Last-session strip ("3D AGO · 8 REPS") or "NOT STARTED"
  - Whole card tappable → opens Train view for that lift
- Single-lift mode → one big full-width card instead of grid
- Stats row: "This cycle N/M" with progress bar, "Active lifts N/4" with mini chips
- Last-cycle progression notice ("+10 deadlift training max — cycle N cleared")

**Rationale:** people are off-schedule. They miss days. They feel like benching on a deadlift day. The app's job is to know the program math, not to enforce a sequence.

### 5.3 Train (today's lift) — 3 hero variants
Available via Tweaks for design review. All three render the same data; only layout differs.

- **Editorial** (default) — date + week eyebrow, huge lift name in display sans, top-set card with plate visualization, working set list, BBB card, assistance.
- **Cards** — same content but each working set is a full-width card; the next set is highlighted in `--hot`; mini plate viz inside it.
- **Data** — dense tabular layout. Stats strip (cycle / scheme / est. PR) atop a real table (SET · %TM · WEIGHT · REPS · STATE) and a plate-setup panel.

All three include the BBB row and assistance section underneath.

### 5.4 Live lift (dark overlay)
Triggered when user taps a set. Full-screen black surface, no chrome chrome.

Contents:
- Top: close X, set counter ("SET 3 OF 3"), AMRAP badge if applicable
- Eyebrow: lift name + %TM
- **Big weight** — 110px tabular mono, dominates the screen
- Plate viz (whichever variant is selected globally)
- **If AMRAP:** rep stepper with `±` controls. Live e1RM caption updates as user adjusts reps. PR indicator if e1RM > previous best.
- "Set complete" hot CTA

After tap:
- Transitions to **rest phase** — big countdown timer (mm:ss), progress bar, "Up next · set N" preview card with the next weight and reps.
- If PR was detected, confetti burst + "Stronger." headline.
- Bottom: "Next set" CTA.

### 5.5 Cycle overview
- Big "Cycle N" heading
- Progress ring card — "Week W · Day D · scheme · N sessions done"
- **Dynamic grid** — columns = enabled lifts, rows = 4 weeks. Each cell:
  - Top-left: percentage (85/90/95/60%)
  - Center: top-set weight for that cell
  - Background: hot (current), bg-2 (done), amber-soft (deload), bg-1 (upcoming)
- Training-max ladder — list of enabled lifts with current TM and "next cycle +N" hint
- Caption: "+5 upper body · +10 lower body, every cycle"

### 5.6 History
- "History." display headline in `--hot`
- Filter pills: All / [enabled lifts] / PRs only
- **PR strip card** — N-column grid (only enabled lifts) of estimated 1RM PRs
- **Session log** — date column, lift, PR badge if applicable, rationale note, top-set stats with weight, reps, e1RM

### 5.7 Exercise library
- "Assistance library." heading
- Category filter pills with colored dots (push=hot, pull=ice, legs=lime, core=amber)
- Row per movement: colored side-bar, name, "★ FAVE" pill chip if favorited, "CATEGORY · TARGET N REPS" meta, add (+) button

### 5.8 Settings
Sectioned list. Each section caps-labeled.

- **Units** — segmented control (lbs / kg)
- **Plate set** — standard / metric / custom — shows available plates as mono chips
- **Percentage split** — week-by-week table of the 5/3/1 prescription, tappable for custom percentages
- **Progression** — upper/lower increments, BBB %
- **Training max** — editable TM per enabled lift
- **Active lifts** *(new)* — toggle each of the 4 lifts on/off (cannot disable the last enabled one)
- **Rest timer** — working sets / BBB / auto-start toggle

### 5.9 Apple Watch companion
Mocked alongside the phone in the design canvas. Three states:
- **Active set** — set indicator, big weight, plate chips, "Done" pill
- **Rest** — circular countdown ring with mm:ss center and "weight × reps" caption
- **PR** — confetti + "Stronger." + new e1RM

---

## 6 · Plate visualization (a centerpiece)

Three switchable variants — picked per user in settings, exposed via Tweaks during design.

1. **Barbell** — side-view of a bar with stacked plates. Plate diameter scales linearly from 42% (lightest) to 100% (heaviest). Standard color coding (black 45, bronze 35, blue 25, ember 10, sage 5). Sleeves rendered as silver gradient. Collars between plates and bar.
2. **Chips** — colored pill chips per plate per side, in load order. Most compact.
3. **Numerical** — grouped count × weight ("2 × 45 + 1 × 25 + 1 × 10"), with "per side · 80 lbs" caption.

Plate-math algorithm (`calcPlates` in `components.jsx`):
- Input: target weight, bar weight (45 lbs / 20 kg), available plates (descending).
- Output: array of plate weights for one side, largest first, plus remainder.
- Greedy fill from heaviest, no float-precision bug (epsilon-checked).

Bar weight + plate inventory both configurable in settings.

---

## 7 · Tweakable design controls

The Tweaks panel exposes the design-level switches a reviewer needs:

| Control | Values | Persisted |
|---|---|---|
| Hero layout | Editorial / Cards / Data | Yes |
| Plate viz | Barbell / Chips / Numbers | Yes |
| Demo stage | Cycle 1 all 4 lifts · Cycle 3 (3 lifts, no press) · Cycle 4 bench only · Cycle 6 advanced | Yes |
| Screen | Home / Today / Cycle / History / Library / Settings / Onboarding | Yes |
| Accent | 5 swatches (hot orange, lime, ice, amber, ink) | Yes |
| Apple Watch | On / Off | Yes |

All Tweaks state is JSON-persisted in the `EDITMODE` block at the top of `app.jsx`.

---

## 8 · Data model (demo / future shape)

```ts
type Lift = 'squat' | 'bench' | 'deadlift' | 'press';

type Session = {
  cycle: number;
  week: 1 | 2 | 3 | 4;
  day: number;
  lift: Lift;                     // current/picked lift
  enabledLifts: Lift[];           // 1–4 lifts user is actively training
  completedSets: number;
  completedSessions: number;      // out of enabledLifts.length × 4
  dateLabel: string;
  greeting: string;
  trainingMax: Record<Lift, number>;
  lastSession: Record<Lift, { daysAgo: number; topReps: number } | null>;
  assistance: Array<{ name: string; category: 'push'|'pull'|'legs'|'core'; sets: number; reps: number }>;
  history: Record<Lift, { bestE1RM: number }>;
};
```

The session is currently demo-built in `buildDemoSession(stage)` with four canned snapshots (freshStart / midCycle / benchOnly / advanced). A real backend would persist this + a per-set log for AMRAP results and historical playback.

---

## 9 · Code structure

```
index.html              Entry, font imports, iOS frame mount, scripts in load order
tokens.css              All CSS vars (color / type / shape / motion)
components.jsx          Plate viz (3 variants), Icon set, Card, PressButton, SegRail,
                        BigWeight, Eyebrow, Caps, PRConfetti
screens-onboarding.jsx  OnboardingScreen + LiftEntryStep + LiftSelect + Review + NumberStepper
screens-main.jsx        TodayScreen (3 variants) + LiveScreen + RestPhase
screens-progress.jsx    CycleScreen + HistoryScreen + ProgressRing
screens-meta.jsx        HomeScreen + LiftPickerCard + LibraryScreen + SettingsScreen
watch.jsx               Apple Watch frame + 3 face states (active / rest / PR)
app.jsx                 App shell — router, tab bar, state, Tweaks panel, PRModal
ios-frame.jsx           Starter — iOS 26 device chrome
tweaks-panel.jsx        Starter — Tweaks shell + controls
```

Each `<script type="text/babel">` gets its own scope; components shared across files are exposed via `Object.assign(window, {...})` at the bottom of each module.

---

## 10 · Roadmap (not built, but designed-for)

- **Real persistence** — currently demo data; needs a CloudKit / Supabase backend keyed on user.
- **Watch app proper** — the companion is a mock; would ship as a WatchKit app pairing live with the phone session.
- **Form-quality notes** — per-set notes for "felt heavy / form broke down" that feed into auto-deload suggestions.
- **Failed-rep recovery** — if a user misses prescribed reps on the AMRAP set, suggest a TM reset (90% of current).
- **Custom assistance templates** — saved push/pull/legs/core sets so the user doesn't pick exercises every session.
- **Plate inventory** — let user specify "I only have 2× 45s and 2× 25s" so the calculator stays honest.
- **Body weight / measurements** — optional, off by default. Lifters who track also weigh.
- **CSV export** — anyone who runs 5/3/1 for years will want to leave with their data.

---

## 11 · Anti-goals (things we will not build)

- Workouts that aren't 5/3/1. Not a "general fitness" app.
- A barcode scanner for plates. (Real users don't need it.)
- Heart rate, sleep tracking, recovery scores. (Different product.)
- "Smart" deload suggestions based on RPE. (Wendler's program doesn't use RPE — adding it would dilute the brand.)
- Push notifications nagging you to lift. (You are an adult.)

---

_Last updated: May 19, 2026. Codename **PROOF** — the aesthetic direction._
