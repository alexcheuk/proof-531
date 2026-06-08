# Validation debt

> Tracks UI/code-affecting changes since the last validated build, the builds pending validation, and
> their findings. This is the UI-validation ledger the loop accrues against per the proof-by-type rule:
> logic/config/security items prove out via `pnpm typecheck` + `pnpm lint` + `pnpm test` + `git grep` and
> owe no build, but UI-visible changes ship first, accrue debt here, and clear only when a real build
> smokes clean.
>
> Validation in 531 is a **local standalone production APK** plus Maestro flows on an emulator:
> `pnpm build:prod` produces `apps/mobile/531-prod.apk` (release-signed, for on-device QA), which is
> installed on the emulator and driven through the Maestro flows in `.maestro/flows/` (onboarding, home
> navigation, begin-session, settings). There is **no EAS cloud build and no CI smoke** in this loop:
> the build, install, and smoke happen out of band via `do-work/scripts/build-and-validate.sh`, which
> writes a PASS/FAIL the next tick ingests through `do-work/scripts/validation.mjs ingest <sha> <PASS|FAIL>`.
> Unit tests run via `pnpm test` (jest + @testing-library/react-native + fast-check domain property tests).
>
> Accrue debt with `node do-work/scripts/validation.mjs debt`; read the current count with
> `node do-work/scripts/validation.mjs status`. Never mark a UI item `done` in the backlog before its
> smoke passes.

## Status
- last-validated: (none) - no builds validated yet (do-work migration bootstrap; the local-APK + Maestro
  smoke has not been run out-of-band on this seat). UI work below is jest/behavior-proven at the logic layer
  and ships; the on-device smoke is the outstanding eventual proof, not a gate on the logic fixes.

## Pending on-device smoke (accrued, newest first)
- tick-3 (Expedition 81) Progress grid: corrected future/now cell weights (day 1 -> 85%, day 2 -> 90%, were
  75/85%), past-cycle historical TM column, and D4 TM-test cells now showing "↑ × 5" (marker + reps). All
  three are jest-proven (exact-value, property, integration, and primitive behavior tests; 1121 green), but
  the rendered grid + the new D4 secondary-line layout owe a Progress-screen Maestro smoke before
  PROG-GRID-FIX flips to `done`.

## How to run a validated smoke
1. Build the local release APK (background; out of band):
   `pnpm build:prod` (produces `apps/mobile/531-prod.apk`).
2. Install on the emulator explicitly (a physical device may also be attached):
   `adb -s <emulator-id> install -r apps/mobile/531-prod.apk`.
3. Smoke the Maestro flows: `maestro --device <emulator-id> test .maestro/flows/`.
4. On PASS: `node do-work/scripts/validation.mjs ingest <sha> PASS` (on FAIL, ingest FAIL and route the
   failure to Discord `#needs-input`).

The orchestrated form of steps 1 to 3 is `do-work/scripts/build-and-validate.sh`, which builds, installs,
runs the smoke, and records the result for the next tick to ingest.

## Smoke coverage (`.maestro/flows/`)
The first-run and core-navigation paths: onboarding, home navigation, begin-session, and settings smoke
tests. Grow this list as flows are added; note coverage gaps below so a future tick knows what is still
unsmoked.

## Coverage gaps (not yet smoked)
(none recorded yet - the first real tick records gaps as it discovers them.)

## Validated-build history
(empty - the first PASS adds a line here: `<sha> (tick-<n>, <one-line gist>)`.)
