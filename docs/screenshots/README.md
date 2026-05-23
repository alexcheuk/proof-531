# Screenshot pairs

Pixel-comparison evidence for the PWA→RN port. See
`docs/screenshot-audit-procedure.md` for capture procedure.

## Screens to audit (one folder each)

| Folder | Screen | Seed |
|---|---|---|
| `onboarding/` | OnboardingScreen (4 steps) | Fresh install — no TMs in db |
| `home/` | HomeScreen + lift tabs | TMs present for all four lifts |
| `today/` | TodayScreen | A non-AMRAP working day (Week 1, Squat) |
| `live/` | LiveScreen | Mid-session, between sets |
| `complete/` | SessionCompleteScreen | After AMRAP that hit a new PR |
| `history/` | HistoryScreen | At least 3 completed sessions |
| `settings/` | SettingsScreen | TmEditSheet visible (mid-edit) |

Each folder contains `pwa.png` and `rn.png` once captured. Empty until the
first audit.

## Changelog

See `CHANGELOG.md` for sign-off history.
