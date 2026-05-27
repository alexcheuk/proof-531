# 531 Strength — Release Guide

How to cut a build, ship it to testers, and publish it. Kept terse — this
file is the runbook, not the spec.

## Branches & cadence

- `main` is the only long-lived branch. All work lands there, squash-merged.
- The EAS preview workflow (`apps/mobile/.eas/workflows/preview-on-main.yml`)
  fires automatically on each push to `main`. Native changes trigger a
  native build; pure-JS changes trigger an Expo Update (OTA) on the
  preview channel. See `CHANGELOG.md` for what landed.
- Production builds are cut manually from `main` at the maintainer's
  cadence. There is no release branch.

## Pre-flight (do this BEFORE cutting a build)

```bash
pnpm install                     # workspace install
pnpm run ci                      # typecheck + lint + jest
pnpm bundle-check                # Metro export — catches transitive dep gaps
pnpm find-unused                 # primitives + accessors hygiene (advisory)
```

If `bundle-check` fails with a "Unable to resolve …" error, it's almost
always a transitive npm dep declared as a devDependency by a third-party
package. Add the missing dep to `apps/mobile/package.json` and re-run.

## Versioning

- `apps/mobile/app.json` → `expo.version` (semver string shown to users).
- `apps/mobile/app.json` → `expo.ios.buildNumber` and `expo.android.versionCode`
  (monotonic integers; bump both for every store-bound build).

Bump rule of thumb:

| Change                             | version | buildNumber / versionCode |
|------------------------------------|---------|---------------------------|
| Native config / new native dep     | minor   | +1                        |
| New feature, all-JS                | minor   | +1                        |
| Bug fix only, all-JS               | patch   | +1                        |
| Test / docs / config-only changes  | —       | —  (skip the build)       |

## Cutting a build

```bash
# 1. Bump version in apps/mobile/app.json (versionCode is managed remotely
#    by EAS — see appVersionSource: "remote" in eas.json).
git add apps/mobile/app.json
git commit -m "chore(release): vX.Y.Z"
git push origin main

# 2. EAS — preview for internal testing, production for the stores.
#    Android has pnpm shortcuts; the equivalent iOS commands are below.
pnpm release:android:preview                                                  # .apk, internal distribution
pnpm release:android:production                                               # .aab for Play Store
pnpm --filter @fivethreeone/mobile exec eas build --profile preview --platform ios
pnpm --filter @fivethreeone/mobile exec eas build --profile production --platform ios
```

For the full Android flow (one-time setup, submit, hotfix), see
`docs/ANDROID_RELEASE.md`.

The first ~2 minutes upload assets; the build itself takes 10-20 minutes
on EAS Build's free tier. Watch the dashboard or hit Ctrl-C — the build
continues server-side.

## TestFlight distribution (iOS)

1. EAS finishes → "Submit to App Store Connect" → enter your Apple ID.
2. App Store Connect → My Apps → 531 Strength → TestFlight.
3. Wait for the build to finish processing (10–60 min).
4. Add to the internal testing group, or share an external testing link.

External testing requires a beta review (24-48 hr) the first time you
upload a new version line.

## Play Console internal track (Android)

1. EAS finishes → `pnpm release:android:submit` (uploads the latest
   production build to the Internal track via the service-account
   credentials in `apps/mobile/.eas-credentials/play-service-account.json`).
2. Play Console → Testing → Internal testing → Releases → confirm the
   build appears.
3. Add testers via email list or the internal-track opt-in URL.

Full setup (Play account, keystore, service account) lives in
`docs/ANDROID_RELEASE.md`.

Internal-track promotions to closed / open / production happen inside
the Play Console; we do not rebuild for those.

## Smoke test (post-build, before promoting)

Install the build on a real device and walk:

1. **Onboarding** → set TMs in lbs, confirm the four lifts.
2. **Today** (Squat, week 1) → preview shows the right warmup + working
   sets + BBB.
3. **Live** → log set 1, hit rest, undo set 1, redo it, advance through
   set 2 and 3. AMRAP entry produces a PR certificate.
4. **SessionComplete** → receipt shows volume + elapsed; "Close the day"
   routes to the Progress tab and plays a one-time fill-in animation
   on the just-completed cell (loop-035, Discord 1508779267).
5. **History** → today's session appears with the PR star; the lifetime
   volume stat updates; activity sparkline shows today as filled.
6. **Settings** → flip storage unit lbs → kg, confirm conversion sheet
   math is sane. Flip back. Edit a TM via the sheet.

If any of those flows feels off, that's a release blocker.

## Hotfix flow (JS-only emergency)

For pure-JS regressions you can ship an OTA update without going through
the stores. The standing `/auto-improve` loop does this on every iteration
via the wrapper script:

```bash
git commit -m "fix(<area>): <one-line summary>"
git push origin main
pnpm release-ota                  # eas update --branch main --platform android --environment production --non-interactive
```

The wrapper exists because newer eas-cli releases refuse non-TTY runs
without `--environment production` + `--non-interactive`, and pass the
commit subject (`%s`) — not the full body — as the message so unbalanced
quotes/backticks in the body don't break eas-cli's argument parsing.

`runtimeVersion: { policy: "fingerprint" }` means changes to autolinked
native deps advance the runtime version. Existing installs only pick up
an OTA whose runtime version matches the APK they're on — pure-JS
changes are fine; adding or removing a native module isn't an OTA-safe
shortcut. See `loop-memory/01-known-codebase.md` for the full note.

For native crashes, you need a new EAS Build — no shortcut.

## Reverting

EAS Update keeps the last N publishes per channel. To roll back, find the
last good update id in the EAS dashboard and run:

```bash
pnpm --filter @fivethreeone/mobile exec eas update:republish --update-id <id>
```

For native rollbacks, archive the bad build in App Store Connect / Play
Console and promote the previous build to the active track.

## Store metadata

See `docs/MARKETING.md` for the canonical app description + subtitle +
keywords. Privacy policy is at `docs/PRIVACY.md` — link both into the
store listing on every release.
