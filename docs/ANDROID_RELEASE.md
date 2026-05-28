# 531 Strength — Android Release Runbook

How to cut, ship, and submit a Play Store build. This file is the
mechanics; `docs/PLAY_STORE.md` is the listing copy / Console form
values; `docs/RELEASE.md` is the cross-platform release guide.

## What ships

| Artifact                  | Build profile     | Format    | Where it goes                    |
| ------------------------- | ----------------- | --------- | -------------------------------- |
| Internal smoke-test build | `preview`         | `.apk`    | EAS internal-distribution URL    |
| Play Store build          | `production`      | `.aab`    | Play Console Internal track      |
| JS-only hotfix            | (no build)        | EAS Update| `preview` or `main` OTA channel  |

Preview is `.apk` so testers can sideload from a link. Production is
`.aab` because Play only accepts App Bundles. Both are configured per
profile in `apps/mobile/eas.json`.

## Versioning

`appVersionSource: "remote"` in `eas.json` means EAS owns the
`versionCode`. Every production build auto-increments (`autoIncrement:
true`); preview builds do too, so internal testers always see a fresh
build number.

The user-facing `expo.version` (e.g. `1.0.0`) is still a manual bump in
`apps/mobile/app.json`. Rule of thumb in `docs/RELEASE.md` § Versioning.

You do not need to set `versionCode` anywhere — Play rejects duplicate
codes, and the auto-increment in `eas.json` keeps that from happening.

## One-time setup

Do these once per machine / per maintainer. The repo carries the config;
the credentials and account are personal.

### 1. EAS account + project

```bash
# log in once; EAS stores the token at ~/.expo/state.json
pnpm --filter @fivethreeone/mobile exec eas login

# verify the project resolves and the projectId matches app.json's
# expo.extra.eas.projectId (17bd8745-...)
pnpm --filter @fivethreeone/mobile exec eas project:info
```

### 2. Android keystore (upload key)

EAS manages this for you on first build. Accept "Generate new keystore"
when prompted by `release:android:production`. The keystore lives on
EAS servers and gets attached to every future Android build. To inspect
or back up:

```bash
pnpm release:android:credentials
```

> **Do NOT lose or rotate this key after the first Play upload.** Play
> uses it to verify subsequent uploads as the same app. If lost, you
> have to file a Play upload-key reset (24-48 hr) before you can ship
> updates. EAS holds a copy as long as the project exists, which is the
> usual recovery path.

### 3. Google Play service account (for `eas submit`)

The service-account JSON authorises EAS to push `.aab`s into your Play
Console. Create it once:

1. Play Console → Settings → API access → Choose / link a Google Cloud
   project.
2. Service accounts → Create new service account → grant **Release
   manager** role on the *531 Strength* app.
3. Click the new service account → Keys → Add key → JSON → download.
4. Save the file at:

   ```
   apps/mobile/.eas-credentials/play-service-account.json
   ```

   That path is the `serviceAccountKeyPath` value in `eas.json` and is
   gitignored. Never commit it.

If you skip this step, `pnpm release:android:submit` will fail with
"missing serviceAccountKeyPath" — fix it once, never think about it
again.

## Cutting a build

All commands run from the repo root.

```bash
# 0. pre-flight (everything green before you start a 15-minute EAS build)
pnpm verify                       # ci + bundle-check + web build

# 1. (optional) bump the human-facing version in apps/mobile/app.json
#    expo.version → patch / minor per docs/RELEASE.md
git add apps/mobile/app.json
git commit -m "chore(release): vX.Y.Z"
git push origin main

# 2a. Internal sideload build for testers (.apk, ~10 min)
pnpm release:android:preview

# 2b. Play-bound build (.aab, ~10 min)
pnpm release:android:production
```

The first preview build prompts you to log in and to confirm keystore
generation. After that the commands run unattended; the EAS dashboard
URL is printed once the upload finishes. Hit Ctrl-C any time — the
build continues on EAS's servers.

## Submitting to Play

The submit step uploads the most recent successful production build to
the **Internal testing** track with `releaseStatus: "completed"` (live
to invited testers immediately) and `changesNotSentForReview: true`
(skips Play's internal-track review since the track is private).

```bash
pnpm release:android:submit
```

Then in Play Console: Internal testing → Releases → confirm the build
appears → promote to Closed / Open / Production when ready. Promotion
does **not** require a rebuild.

> First upload only: Play needs the listing (`docs/PLAY_STORE.md`),
> content rating (§4), and privacy policy URL set BEFORE the submit
> will succeed. Walk the §8 first-upload checklist in `docs/PLAY_STORE.md`
> first.

## Checking build status

```bash
pnpm release:android:status       # last 5 Android builds
```

Useful when an EAS build is still cooking and you want to know whether
to start the submit step yet.

## JS-only hotfix (no rebuild)

For pure-JS regressions to an already-shipped build:

```bash
git commit -m "fix(<area>): <one-line summary>"
git push origin main
# CI handles OTA automatically via .github/workflows/ota.yml.
# Manual fallback (CI down): pnpm release-ota
```

`runtimeVersion: { policy: "fingerprint" }` means OTA updates only land
on installs whose native fingerprint matches the published build. Add
or remove a native dep → fingerprint changes → testers need a new APK.
See `docs/RELEASE.md` § "Hotfix flow" for the full rules.

## Reference

| File                                       | What lives there                                     |
| ------------------------------------------ | ---------------------------------------------------- |
| `apps/mobile/app.json`                     | `expo.version`, `expo.android.package`, adaptive icon |
| `apps/mobile/eas.json`                     | build profiles, submit credentials, auto-increment   |
| `apps/mobile/.eas-credentials/` (gitignored) | Play service-account JSON                          |
| `package.json` (root) → `scripts.release:android:*` | the pnpm wrappers used in this doc        |
| `docs/PLAY_STORE.md`                       | every Play Console field value + first-upload checklist |
| `docs/RELEASE.md`                          | cross-platform release process + smoke test          |
| `docs/PRIVACY.md`, `docs/MARKETING.md`     | source copy for the Play Store listing               |

## When this doc must change

- New native dependency added → re-audit Play permissions in
  `docs/PLAY_STORE.md` §5 before submitting.
- Switch from internal track to closed/open default → update the
  `submit.production.android.track` value in `eas.json`.
- Upload key reset → re-document the recovery path in § "One-time setup
  → Android keystore".
- Migration to a future Expo SDK → re-verify the `appVersionSource:
  remote` + `autoIncrement` behaviour and the `eas.json` schema.
