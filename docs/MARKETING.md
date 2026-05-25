# 531 Strength — Marketing Source

Single source of truth for store listings, social copy, and launch outreach.

## Positioning

> **531 Strength** is a strict, no-frills 5/3/1 + BBB tracker — built like a notebook, runs like an app.

For lifters who already follow Jim Wendler's 5/3/1 and want a clean, focused journal — not a coaching app, not a social network, not a gym CRM.

## Audience

- Self-coached intermediate / advanced lifters
- Followers of 5/3/1, FSL, BBB, Joker sets, AMRAP-trained athletes
- People who use a notebook today and want a tracker that respects that habit

## What's different

| Most lifting apps | **531 Strength** |
|---|---|
| Bright gradients, animations, gamified pop-ups | E-ink paper aesthetic, monochrome, focused |
| Plan-builder UI, dozens of programs | One program done right — 5/3/1 with BBB |
| Suggests reps, nudges form, sells coaching | Trusts you. Logs your set. Computes the next. |
| Sync, social, cloud lock-in | Local-first SQLite. Your data lives on-device. |

## App Store copy

### Subtitle (30 chars max)

> A serious 5/3/1 tracker.

Alternates:
- The 5/3/1 lifter's notebook.
- AMRAPs. PRs. 4-week cycles.

### Short description (80 chars max — Play Store)

> A strict, no-frills 5/3/1 tracker. Paper-style UI. Local-first. Track AMRAPs and PRs.

### Long description (≤4000 chars)

> 531 Strength is a focused tracker for lifters running Jim Wendler's 5/3/1 program. No coaching, no social, no ads — just a clean digital notebook for your training maxes, your working sets, your AMRAPs, and the PRs you chase across each 4-week cycle.
>
> **Built for the program.** 5/3/1 percentages, BBB volume work, and AMRAP set logging are first-class. Plate math is computed for your bar, your plates, your unit (kg or lb), and shown per side. Training max progression follows the 5 lb / 2.5 kg upper-body, 10 lb / 5 kg lower-body rules — no manual math after every cycle.
>
> **Live session view.** A countdown rest timer between sets, with a haptic warning when time's almost up. Screen stays awake. AMRAP set logged in a single sheet. PR detection runs the moment you save.
>
> **History that feels earned.** Lifetime sessions filed, personal records, longest training streak, and an activity sparkline going back through your last cycle. No "achievements" plastic — just the numbers that matter.
>
> **E-ink paper aesthetic.** Monochrome, calm, readable in a bright gym. Built so the screen feels like the next page of your training log instead of a flashing dashboard.
>
> **Local-first.** Your sessions, your PRs, your training maxes live on-device in a SQLite database. No cloud account required. No social network. No ad targeting. No analytics in the gym.
>
> Built with React Native and Expo. Open for inspection.

### Keywords (iOS — 100 chars)

> 531,5/3/1,wendler,bbb,strength,powerlifting,bench,squat,deadlift,press,amrap,training,journal,gym

## Screenshot caption set

1. **Today** — "Your prescribed sets. Plate math per side."
2. **Live · Set** — "Working set. Plate decomposition. Stays awake."
3. **Live · Rest** — "Countdown rest timer. Haptic at T-3s."
4. **Live · AMRAP** — "Log your top set. PR detected on save."
5. **Session complete** — "Set receipt. e1RM. Next cycle queued."
6. **History** — "Every session you've filed. Streaks. PRs."
7. **Settings** — "Training maxes. Plate set. Unit. Cycle position."

## Privacy stance

- 100% local-first; SQLite database lives in app sandbox.
- Zero analytics, zero ad SDKs, zero crash reporters in the v1 build.
- Future iCloud / Drive backup will be opt-in, end-to-end encrypted, never social.

Privacy policy lives at `docs/PRIVACY.md` (TODO before submission).

## Launch checklist

- [ ] App icon — 1024×1024 paper-aesthetic icon, no shadow.
- [ ] Splash screen — paper bg + monochrome glyph (current splash is the icon at 76pt on `#E7E3D6`).
- [ ] App Store screenshots — 6.7" (iPhone 15 Pro Max) + 6.1" (iPhone 15 Pro), light + dark.
- [ ] Play Store feature graphic — 1024×500.
- [ ] Privacy policy URL — `docs/PRIVACY.md` published.
- [ ] TestFlight internal — at least 5 testers, one full 4-week cycle of feedback.
- [ ] Demo video — 30s, screen-recorded, no voiceover — paper aesthetic.

## Outreach plan (first ring)

- r/weightroom — "I built the 5/3/1 tracker I wanted." Screenshot post, no link first day.
- r/Fitness "Daily Question Thread" — replies only, no spam.
- @jimwendler on X — courtesy heads-up, not a beg.
- HN Show — only after iOS public + Android beta, with the "local-first lifting log" angle.

## Asset sources

- Fonts: IBM Plex Sans / Mono / Sans-Condensed (Apache 2.0). Bundled via expo-font.
- Icon glyph: in-house wordmark "531" — set in Plex Mono Bold.
- Splash: same wordmark, paper background `#E7E3D6` / ink `#1A1812`.
