# 531 Strength: Google Play Store Listing

Concrete values to paste into the Play Console "Create app" wizard and the
subsequent listing / policy / release forms. Marketing copy is sourced
from `docs/MARKETING.md`; privacy text from `docs/PRIVACY.md`; release
mechanics from `docs/RELEASE.md`. This file is the single sheet a human
(or agent) follows while clicking through the Console.

Anything marked **TODO** needs a one-time human action (account creation,
asset capture, URL hosting) before the listing can go live.

---

## 0. Prerequisites (one-time, outside this repo)

- [ ] **Google Play Console developer account**: $25 one-time, personal
  or organization. Identity verification now requires D-U-N-S (org) or
  government ID (individual). Allow 2–3 business days.
- [ ] **Payment profile**: required even though the app is free, for
  identity verification.
- [ ] **Privacy policy hosted at a public HTTPS URL.** `docs/PRIVACY.md`
  is the source; needs to be published under
  `https://<marketing-site>/privacy` (or equivalent) before the listing
  can be submitted. **TODO**: publish.

---

## 1. Create app (Play Console → All apps → Create app)

| Field                                    | Value                             |
| ---------------------------------------- | --------------------------------- |
| App name                                 | `531 Strength`                    |
| Default language                         | `English (United States) – en-US` |
| App or game                              | `App`                             |
| Free or paid                             | `Free`                            |
| Declarations: Developer Program Policies | Acknowledged                      |
| Declarations: US export laws             | Acknowledged                      |

Package name (set by EAS at first upload, must match
`apps/mobile/app.json` → `expo.android.package`):

```
com.alexcheuk.fivethreeone
```

> Package name is permanent after first upload. Already correct in
> `app.json`. Do not change.

---

## 2. Store settings

### App category

| Field        | Value                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- |
| App category | `Health & Fitness`                                                                              |
| Tags         | `Workout`, `Strength training`, `Fitness tracker` (pick up to 5 from Console's controlled list) |

### Store listing contact details

| Field   | Value                                                 |
| ------- | ----------------------------------------------------- |
| Email   | `cheuk.alex@gmail.com`                                |
| Phone   | *(optional, leave blank)*                             |
| Website | `https://<marketing-site>` **TODO** confirm final URL |

### External marketing

| Field                                                | Value |
| ---------------------------------------------------- | ----- |
| Allow Google to promote your app outside Google Play | `Yes` |

---

## 3. Main store listing

### App name (30 char max)

```
531 Strength
```

### Short description (80 char max)

```
Track every set. Chase every PR. A focused strength tracker.
```

> 60 chars. Drops "5/3/1" from the hook so search browsers who haven't
> decided yet can read it, while keeping the discipline of the
> MARKETING.md voice. The full description below still filters to the
> 5/3/1 audience.

### Full description (4000 char max)

```
531 Strength is a focused tracker for lifters running Jim Wendler's 5/3/1 program. No coaching, no social, no ads. Just a clean digital notebook for your training maxes, your working sets, your AMRAPs, and the PRs you chase across each 4-week cycle.

Built for the program. 5/3/1 percentages, BBB volume work, and AMRAP set logging are all here. Plate math is done for you: by bar, by plate set, in pounds or kilograms, shown per side. Training max progression follows the 5 lb / 2.5 kg upper-body, 10 lb / 5 kg lower-body rules. No manual math after every cycle.

In the gym. A countdown rest timer between sets, with a buzz when time's almost up. Your screen stays awake. Log your AMRAP top set and the app flags a PR the moment you save it.

History that feels earned. Every session you've filed, your personal records, your longest training streak, and a quiet record of your last cycle's training days. No "achievements" plastic. Just the numbers that matter.

Made for a bright gym. Monochrome, calm, readable. The screen feels like the next page of your training log instead of a flashing dashboard.

Yours alone. Your sessions, your PRs, your training maxes stay on your phone. No account. No sign-in. No social network. No ad targeting. No tracking, in the gym or out of it.
```

### Graphic assets

| Asset                      | Spec                                               | Source / Action                                                                           |
| -------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| App icon                   | 512 × 512 PNG, 32-bit, no alpha                    | `apps/mobile/assets/images/icon.png` (already 512²; verify alpha stripped before upload)  |
| Feature graphic            | 1024 × 500 PNG or JPEG                             | **TODO**: produce paper-bg + 531 wordmark, paired with one phone screen                   |
| Phone screenshots          | 2–8, min side ≥ 320, max side ≤ 3840, 16:9 or 9:16 | **TODO**: capture from device per `docs/screenshot-audit-procedure.md`; caption set below |
| 7-inch tablet screenshots  | Optional                                           | Skip for v1; app sets `supportsTablet: false` on iOS, no Android tablet polish yet        |
| 10-inch tablet screenshots | Optional                                           | Skip for v1                                                                               |
| Promo video                | Optional, YouTube URL                              | Skip for v1 (MARKETING.md flags a 30s demo as TODO)                                       |

#### Screenshot caption set (mirror of MARKETING.md §"Screenshot caption set")

1. **Today**: "Your prescribed sets. Plate math per side."
2. **Live · Set**: "Working set. Plates per side. Screen stays on."
3. **Live · Rest**: "Countdown rest timer. Buzzes before the next set."
4. **Live · AMRAP**: "Log your top set. PR flagged the moment you save."
5. **Session complete**: "Session summary. e1RM. Next cycle queued."
6. **History**: "Every session you've filed. Streaks. PRs."
7. **Settings**: "Training maxes. Plate set. Unit. Cycle position."

---

## 4. Policy declarations (App content)

Every section below is mandatory before you can promote to production.

### Privacy policy

| Field              | Value                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| Privacy policy URL | `https://<marketing-site>/privacy` **TODO** publish `docs/PRIVACY.md` |

### App access

| Question                                             | Answer                                                    |
| ---------------------------------------------------- | --------------------------------------------------------- |
| Is all functionality available without restrictions? | `Yes, all functionality available without special access` |

No login, no paywall, no region lock.

### Ads

| Question                   | Answer |
| -------------------------- | ------ |
| Does your app contain ads? | `No`   |

### Content rating

Complete the IARC questionnaire with these answers (yields **Everyone**):

| Question                        | Answer                                                                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category                        | `Reference, news, or educational` (closest match; Health & Fitness has no separate rating bucket; "Utility, Productivity, Communication, or Other" is also acceptable) |
| Violence                        | `No`                                                                                                                                                                   |
| Sexuality                       | `No`                                                                                                                                                                   |
| Language                        | `No`                                                                                                                                                                   |
| Controlled substances           | `No`                                                                                                                                                                   |
| User-generated content / social | `No`                                                                                                                                                                   |
| Shares user location            | `No`                                                                                                                                                                   |
| Allows digital purchases        | `No`                                                                                                                                                                   |
| Unrestricted internet access    | `No`                                                                                                                                                                   |

Expected outcome: **IARC: 3+ / ESRB: Everyone / PEGI: 3**.

### Target audience and content

| Question                  | Answer                          |
| ------------------------- | ------------------------------- |
| Target age groups         | `18 and over`                   |
| Appeals to children       | `No`                            |
| Mixed-audience disclosure | N/A (single age range selected) |

### News app

| Question            | Answer |
| ------------------- | ------ |
| Is this a news app? | `No`   |

### COVID-19 contact tracing and status

| Question                                 | Answer |
| ---------------------------------------- | ------ |
| Is this a contact tracing or status app? | `No`   |

### Data safety form

This is the long one. Reference: `docs/PRIVACY.md`. Every answer here
must remain truthful as the app evolves. Re-check before every release.

| Question                                                              | Answer                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------ |
| Does your app collect or share any of the required user data types?   | `No`                                                   |
| Is all of the user data collected by your app encrypted in transit?   | `Not applicable; no data leaves the device`            |
| Do you provide a way for users to request that their data be deleted? | `No data is collected; no deletion mechanism required` |

Data types collected: **none**. Data types shared: **none**. The form
will let you submit with everything checked "No collection".

> If a future release adds analytics, crash reporting, cloud backup, or
> any network call that touches user data, this section must be revised
> *before* the release goes out. Play will block submissions whose
> declared behavior diverges from observed network traffic.

### Government apps

| Question                      | Answer |
| ----------------------------- | ------ |
| Is your app a government app? | `No`   |

### Financial features

| Question                                  | Answer |
| ----------------------------------------- | ------ |
| Does your app provide financial features? | `No`   |

### Health features

| Question                                                                           | Answer |
| ---------------------------------------------------------------------------------- | ------ |
| Does your app provide health features (Health Connect, health data, medical info)? | `No`   |

> 531 logs lift performance, not medical data. We do not request Health
> Connect, Google Fit, or any platform health permission. If a future
> release integrates Health Connect, this declaration changes and a new
> Health permissions declaration form is required.

### Advertising ID

| Question                          | Answer |
| --------------------------------- | ------ |
| Does your app use advertising ID? | `No`   |

### Actions on Google

| Question                             | Answer |
| ------------------------------------ | ------ |
| Does your app use Actions on Google? | `No`   |

---

## 5. Permissions (manifest declarations)

EAS Build derives the Android manifest from `app.config.ts` / `app.json`
plus the installed Expo modules. Expected runtime permissions for v1:

| Permission  | Source            | Justification (Play Console copy if requested)                                             |
| ----------- | ----------------- | ------------------------------------------------------------------------------------------ |
| `VIBRATE`   | `expo-haptics`    | "Haptic feedback for set completion and rest timer cues."                                  |
| `WAKE_LOCK` | `expo-keep-awake` | "Keeps the screen on during an active training session."                                   |
| `INTERNET`  | autolinked by RN  | "Required by Expo Updates (OTA) and the React Native bridge. No user data is transmitted." |

No location, microphone, camera, contacts, photo library, sensors,
notifications, or background services are requested. Verify against the
shipped `.aab` manifest before submitting. If anything extra appears,
audit the new dependency before continuing.

---

## 6. Pricing & distribution

| Field                | Value                                                     |
| -------------------- | --------------------------------------------------------- |
| Free or paid         | `Free` (locked; cannot switch to paid later)              |
| Countries / regions  | `All countries / regions available`                       |
| Contains ads         | `No`                                                      |
| In-app purchases     | `No`                                                      |
| US export compliance | Acknowledged (no encryption beyond standard platform TLS) |

---

## 7. Release tracks (plan)

Per `docs/RELEASE.md` and Play's 2023 policy change, every new app must
spend ~14 days in closed testing with 12+ opt-in testers before being
eligible for production.

| Track            | Purpose                                          | Audience                                   | Required minimum                     |
| ---------------- | ------------------------------------------------ | ------------------------------------------ | ------------------------------------ |
| Internal testing | Smoke-test fresh builds, no review               | Up to 100 emails on the maintainer's list  | 1 build                              |
| Closed testing   | The 14-day / 12-tester gate to unlock production | Discord + r/weightroom early-access opt-in | 12 testers, 14 days                  |
| Open testing     | Public beta (optional pre-launch step)           | Anyone with the opt-in URL                 | None                                 |
| Production       | Public release                                   | Everyone                                   | Closed testing requirement satisfied |

EAS uploads land in the **Internal testing** track by default
(`pnpm --filter @fivethreeone/mobile exec eas submit --platform android`).
Promotion between tracks happens inside the Play Console. No rebuild
required.

---

## 8. Release names and notes

### Release name (internal, shown only in Play Console)

Format: `<versionName> (<versionCode>) <optional label>`. Defaults to
`versionName (versionCode)` if the label is omitted. The label is the
fastest way to scan the release timeline a year from now.

| Version | Release name              |
| ------- | ------------------------- |
| 1.0.0   | `1.0.0 (1) first release` |

### Release notes (user-facing "What's new", 500 char max, per language)

#### 1.0.0 (en-US)

```
First release. A focused tracker for the 5/3/1 program: training maxes, AMRAPs, plate math, PRs, and a quiet history view. No account, no ads, no tracking.
```

> 159 chars. The first release is special because the listing itself
> already explains what the app is. From 1.0.1 onward, this field
> should describe what *changed* in the release, not what the app is.

### Conventions for future releases

- Bump rule: see `docs/RELEASE.md` §Versioning.
- One paragraph max. Lead with the user-visible change, no
  marketing-speak. Examples:
  ```
  Fixes: rest timer no longer resets when the screen rotates mid-set.
  ```
  ```
  Adds: long-press a working set to log a Joker set.
  ```
- If a release is OTA-only via Expo Updates, "What's new" does not
  surface in the Play Store (the `.aab` did not change). Log the OTA
  in `CHANGELOG.md` instead.

---

## 9. First-upload checklist

In order. Each box is a Play Console click or an EAS command.

- [ ] Developer account created + identity verified
- [ ] Privacy policy published at a public HTTPS URL
- [ ] App created in Play Console with the values in §1
- [ ] Store listing fields populated per §3 (text + screenshots + feature graphic)
- [ ] App content declarations completed per §4 (every section shows green)
- [ ] Pricing & distribution set per §6
- [ ] `apps/mobile/app.json` → `expo.version` and `expo.android.versionCode` bumped per `docs/RELEASE.md` §Versioning
- [ ] `pnpm run ci && pnpm bundle-check` green
- [ ] `eas build --profile production --platform android` succeeds and produces an `.aab`
- [ ] `eas submit --platform android` uploads the `.aab` to the Internal track
- [ ] Set the release name and "What's new" notes per §8 inside the
  Play Console Internal release form before rolling out
- [ ] Smoke test on a real device per `docs/RELEASE.md` §"Smoke test"
- [ ] Promote to Closed testing, invite 12+ testers, start the 14-day clock
- [ ] After 14 days + tester feedback addressed: promote to Production

---

## 10. Things that will change this document

If any of the following happens, update the corresponding section
before the next release:

- New native dependency added → re-audit §5 Permissions
- Any network call that transmits user data (analytics, crash reporter,
  backup) → §4 Data safety + `docs/PRIVACY.md` revision required
- Health Connect / Google Fit integration → §4 Health features +
  separate Health permissions declaration form
- In-app purchase or subscription → §6 Pricing & distribution becomes
  irreversible-ish; consult Play billing policy first
- Target audience extended below 18 → §4 Target audience reopens
  designed-for-families and ads disclosures
