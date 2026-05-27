# 531 Strength: Apple App Store Listing

Concrete values to paste into App Store Connect when creating the app
and submitting each version. Marketing copy is sourced from
`docs/MARKETING.md`; privacy text from `docs/PRIVACY.md`; release
mechanics from `docs/RELEASE.md`. This file is the single sheet a human
(or agent) follows while clicking through Connect.

Anything marked **TODO** needs a one-time human action (account, asset
capture, URL hosting) before the listing can go live.

Companion document: `docs/PLAY_STORE.md` (Google Play Store).

---

## 0. Prerequisites (one-time, outside this repo)

- [ ] **Apple Developer Program membership**: $99 per year (individual
  or organization). Identity verification can take 24 hours to several
  business days. Org enrollments require a D-U-N-S number and a legal
  signing authority.
- [ ] **App Store Connect access**: created automatically when the
  Developer Program enrollment completes; sign in at
  `appstoreconnect.apple.com`.
- [ ] **Privacy policy hosted at a public HTTPS URL.** `docs/PRIVACY.md`
  is the source; needs to be published under
  `https://<marketing-site>/privacy` (or equivalent) before the listing
  can be submitted. **TODO**: publish.
- [ ] **Support URL hosted at a public HTTPS URL.** Can be a single
  page with an email and a short FAQ; can point at the marketing site's
  root if you do not have a dedicated support page. **TODO**: publish.

---

## 1. Create app (App Store Connect → My Apps → "+" → New App)

| Field            | Value                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Platforms        | `iOS` (uncheck macOS, visionOS, tvOS)                                |
| Name             | `531 Strength`                                                       |
| Primary language | `English (U.S.)`                                                     |
| Bundle ID        | `com.alexcheuk.fivethreeone` (must already be registered in §1a)     |
| SKU              | `fivethreeone-ios-001` (internal identifier, never shown to users)   |
| User access      | `Full Access` (only relevant on teams with role-based access)        |

### 1a. Register the bundle ID first (Developer portal → Identifiers)

If this is the first time `com.alexcheuk.fivethreeone` appears in your
Developer account, register it before the New App step above:

| Field                  | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| Identifier type        | `App IDs` → `App`                                                    |
| Bundle ID              | `com.alexcheuk.fivethreeone` (must match `app.json:17`)              |
| Description            | `531 Strength`                                                       |
| Capabilities           | None required for v1                                                 |

Bundle ID is permanent once any app uses it. Already correct in
`app.json:17`. Do not change.

---

## 2. App Information (left nav → App Information)

### Localizable Information (English U.S.)

| Field    | Value                                                                |
| -------- | -------------------------------------------------------------------- |
| Name     | `531 Strength`                                                       |
| Subtitle | `A focused strength tracker`                                         |
| Privacy Policy URL | `https://<marketing-site>/privacy` **TODO** publish        |

Subtitle alternates (each ≤ 30 chars), pick one and stay with it across
versions unless the positioning shifts:

| Alternate                       | Chars | Voice                                  |
| ------------------------------- | ----- | -------------------------------------- |
| `A focused strength tracker`    | 26    | Broad, matches the Play Store hook     |
| `The 5/3/1 lifter's notebook`   | 27    | Enthusiast, MARKETING.md voice         |
| `A serious 5/3/1 tracker`       | 23    | Tight, original MARKETING.md choice    |

### General Information

| Field              | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| Category, primary  | `Health & Fitness`                                             |
| Category, secondary| `Sports` (optional, helps discovery)                           |
| Content Rights     | `Does not contain, show, or access third-party content` (Yes)  |
| Age Rating         | Complete questionnaire per §6. Expected result: `4+`           |

---

## 3. Version information (left nav → iOS App → 1.0.0)

### Promotional Text (170 char max, updatable without review)

```
A clean strength notebook. Plate math, AMRAPs, PRs, and 5/3/1 cycle progression. Local-first, no account, no ads.
```

> 115 chars. Promotional text sits above the description and can be
> edited at any time without resubmitting a build. Use it for launch
> announcements or seasonal copy without burning a release cycle.

### Description (4000 char max)

```
531 Strength is a focused tracker for lifters running Jim Wendler's 5/3/1 program. No coaching, no social, no ads. Just a clean digital notebook for your training maxes, your working sets, your AMRAPs, and the PRs you chase across each 4-week cycle.

Built for the program. 5/3/1 percentages, BBB volume work, and AMRAP set logging are all here. Plate math is done for you: by bar, by plate set, in pounds or kilograms, shown per side. Training max progression follows the 5 lb / 2.5 kg upper-body, 10 lb / 5 kg lower-body rules. No manual math after every cycle.

In the gym. A countdown rest timer between sets, with a buzz when time's almost up. Your screen stays awake. Log your AMRAP top set and the app flags a PR the moment you save it.

History that feels earned. Every session you've filed, your personal records, your longest training streak, and a quiet record of your last cycle's training days. No "achievements" plastic. Just the numbers that matter.

Made for a bright gym. Monochrome, calm, readable. The screen feels like the next page of your training log instead of a flashing dashboard.

Yours alone. Your sessions, your PRs, your training maxes stay on your phone. No account. No sign-in. No social network. No ad targeting. No tracking, in the gym or out of it.
```

### Keywords (100 char max, comma-separated, no spaces)

```
531,5/3/1,wendler,bbb,strength,powerlifting,bench,squat,deadlift,press,amrap,training,journal,gym
```

> 96 chars. Keywords are hidden from users but drive App Store search
> ranking. Do not repeat words that already appear in the app name,
> subtitle, or category (Apple indexes those automatically). Updatable
> only with a new version submission.

### Support URL

```
https://<marketing-site>/support
```

**TODO**: publish a support page (email + brief FAQ is enough).

### Marketing URL (optional)

```
https://<marketing-site>
```

### Copyright

```
2026 Alex Cheuk
```

### Version

```
1.0.0
```

Must match `apps/mobile/app.json` → `expo.version`. Bump per
`docs/RELEASE.md` §Versioning rules.

---

## 4. App Previews and Screenshots

### Required device sizes (2026)

Apple consolidated screenshot requirements in 2024. As of 2026:

| Device class            | Resolution     | Required for 1.0.0 |
| ----------------------- | -------------- | ------------------ |
| 6.9" iPhone (16 Pro Max)| 1320 × 2868    | Yes                |
| 6.5" iPhone (11 Pro Max)| 1242 × 2688    | Optional but recommended |
| 5.5" iPhone (8 Plus)    | 1242 × 2208    | Retired April 2024, not accepted |
| iPad 13"                | 2064 × 2752    | Only if app supports iPad |

Per `apps/mobile/app.json:18`, `supportsTablet: false`. **Skip iPad
screenshots.** See `docs/PLAY_STORE.md` §"why no tablet screenshots"
reasoning, which applies identically here.

### Capture procedure

Use the iOS Simulator (Xcode → Window → Devices and Simulators) or a
physical iPhone 16 Pro Max running the production build. Capture per
`docs/screenshot-audit-procedure.md`. Light + dark variants both
acceptable; the e-ink system reads cleanly in either. Decide one set
and stay consistent across all 7 screenshots.

### Screenshot caption set (mirror of MARKETING.md §"Screenshot caption set")

1. **Today**: "Your prescribed sets. Plate math per side."
2. **Live · Set**: "Working set. Plates per side. Screen stays on."
3. **Live · Rest**: "Countdown rest timer. Buzzes before the next set."
4. **Live · AMRAP**: "Log your top set. PR flagged the moment you save."
5. **Session complete**: "Session summary. e1RM. Next cycle queued."
6. **History**: "Every session you've filed. Streaks. PRs."
7. **Settings**: "Training maxes. Plate set. Unit. Cycle position."

Captions live in the screenshot image itself (Apple does not render
text separately from the upload). Use the same caption typography as
the marketing site for consistency.

### App Preview video (optional)

Skip for v1. MARKETING.md flags a 30-second demo as a TODO; when
produced, upload as a 15 to 30 second `.mov` or `.mp4`, max 500 MB,
recorded at the same resolution as the screenshot device class.

---

## 5. App Privacy (left nav → App Privacy)

### Privacy Practices

| Question                                              | Answer                  |
| ----------------------------------------------------- | ----------------------- |
| Do you or your third-party partners collect data from this app? | `No, we do not collect data from this app` |

This selects the **Data Not Collected** privacy label, which Apple
shows on the listing as "The developer does not collect any data from
this app."

### Privacy Policy

| Field              | Value                                              |
| ------------------ | -------------------------------------------------- |
| Privacy Policy URL | `https://<marketing-site>/privacy` **TODO** publish |

> If a future release adds analytics, crash reporting, cloud backup,
> Health Connect equivalent (HealthKit), or any network call that
> touches user data, this section must be revised *before* the release
> goes out. Apple's automated scanners and the human reviewer both
> check that declared behavior matches observed network traffic.

---

## 6. Age Rating questionnaire (App Information → Age Rating → Edit)

Answer all categories `None` / `No`:

| Question                                                 | Answer |
| -------------------------------------------------------- | ------ |
| Cartoon or Fantasy Violence                              | None   |
| Realistic Violence                                       | None   |
| Prolonged Graphic or Sadistic Realistic Violence         | None   |
| Profanity or Crude Humor                                 | None   |
| Mature/Suggestive Themes                                 | None   |
| Horror/Fear Themes                                       | None   |
| Sexual Content or Nudity                                 | None   |
| Graphic Sexual Content and Nudity                        | None   |
| Alcohol, Tobacco, or Drug Use or References              | None   |
| Simulated Gambling                                       | None   |
| Medical/Treatment Information                            | None   |
| Unrestricted Web Access                                  | No     |
| Gambling                                                 | No     |
| Contests                                                 | No     |
| Made for Kids                                            | No     |

Expected result: **Rated 4+**.

---

## 7. App Review Information (left nav → version → App Review Information)

### Contact Information

| Field      | Value                       |
| ---------- | --------------------------- |
| First name | `Alex`                      |
| Last name  | `Cheuk`                     |
| Phone      | `+1 <phone>` **TODO** add   |
| Email      | `cheuk.alex@gmail.com`      |

### Sign-in required

| Field           | Value                                                       |
| --------------- | ----------------------------------------------------------- |
| Sign-in required| `No`                                                        |
| Demo account    | N/A                                                         |

### Notes (visible only to App Review)

```
531 Strength is a single-user offline lifting tracker. No account, no sign-in, no network calls that transmit user data. To exercise the app: open it, complete the onboarding (set training maxes for squat, bench, deadlift, press), open the Today tab, and tap into a session. No special setup required.
```

### Attachment (optional)

Skip for v1 unless review pushes back on something.

---

## 8. Pricing and Availability (left nav → Pricing and Availability)

| Field                              | Value                                              |
| ---------------------------------- | -------------------------------------------------- |
| Price                              | `Free` (Tier 0)                                    |
| Availability                       | `All countries or regions`                         |
| Pre-Order                          | Off                                                |
| Volume Purchase Program for Business| Off                                                |
| Volume Purchase Program for Education| Off                                              |

Note: Free apps can switch to paid later, but paid apps cannot switch
to free without removing the app and resubmitting. Starting Free keeps
that door open.

---

## 9. Build configuration and Info.plist (one-time, in the repo)

### Encryption export compliance

Add to `apps/mobile/app.json` → `expo.ios.infoPlist` to suppress the
"Does your app use encryption" prompt on every TestFlight upload:

```json
"ios": {
  "bundleIdentifier": "com.alexcheuk.fivethreeone",
  "supportsTablet": false,
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false
  }
}
```

531 uses only HTTPS (exempt) and platform-standard crypto (exempt), so
this attestation is honest.

### Permissions strings (`NSUsageDescription` keys)

531 does not request any permission that requires a usage-description
string. If a future release adds one (Health, Camera, Photos, Location,
etc.), the matching `NS*UsageDescription` key must be added to
`expo.ios.infoPlist` or the App Review will reject the binary on
first launch.

---

## 10. TestFlight plan

| Track            | Purpose                                          | Audience                                | Review required           |
| ---------------- | ------------------------------------------------ | --------------------------------------- | ------------------------- |
| Internal Testing | Smoke-test fresh builds, fast iteration          | Up to 100 internal testers (App Store Connect users on the team) | None                      |
| External Testing | Public beta with up to 10,000 testers per group  | Anyone with the invite link             | Beta App Review (24 to 48 hours first time, faster for updates) |
| Production       | Public release                                   | Everyone                                | Full App Review (24 to 48 hours typical) |

EAS uploads land in App Store Connect via:

```bash
pnpm --filter @fivethreeone/mobile exec eas submit --platform ios
```

After processing (10 to 60 minutes), the build appears under
TestFlight → Builds. Promote to Internal Testing by adding the tester
group. For External Testing, submit the build for Beta App Review.

---

## 11. First-upload checklist

In order. Each box is an App Store Connect click or a local command.

- [ ] Apple Developer Program enrollment complete and verified
- [ ] Bundle ID `com.alexcheuk.fivethreeone` registered under
  Identifiers (§1a)
- [ ] Privacy policy and support URL published at public HTTPS URLs
- [ ] `apps/mobile/app.json` carries
  `ios.infoPlist.ITSAppUsesNonExemptEncryption = false` (§9)
- [ ] App created in App Store Connect with the values in §1
- [ ] App Information populated per §2
- [ ] Version 1.0.0 created with description, keywords, promo text,
  support URL per §3
- [ ] 6.9" iPhone screenshots (and optionally 6.5") uploaded per §4
- [ ] App Privacy filled out per §5 (Data Not Collected)
- [ ] Age Rating questionnaire completed per §6 (expected 4+)
- [ ] App Review Information complete per §7
- [ ] Pricing and Availability set per §8
- [ ] `apps/mobile/app.json` → `expo.version` and `expo.ios.buildNumber`
  bumped per `docs/RELEASE.md` §Versioning
- [ ] `pnpm run ci && pnpm bundle-check` green
- [ ] `eas build --profile production --platform ios` succeeds and
  produces an `.ipa`
- [ ] `eas submit --platform ios` uploads to App Store Connect
- [ ] TestFlight processing finishes; build appears under
  TestFlight → Builds
- [ ] Smoke test on a real device via TestFlight per `docs/RELEASE.md`
  §"Smoke test"
- [ ] Submit for App Review (link the processed build to the 1.0.0
  version, click "Add for Review", then "Submit for Review")
- [ ] After approval: choose "Manual release" or "Automatic release"
  in the version's Release section

---

## 12. Things that will change this document

If any of the following happens, update the corresponding section
before the next release:

- New native dependency added that triggers a permission prompt → §9
  Info.plist usage-description keys
- HealthKit integration → §5 App Privacy + a separate HealthKit-data
  declaration under Privacy Practices; Apple has stricter rules for
  health data than Google
- Any network call that transmits user data (analytics, crash
  reporter, cloud backup) → §5 App Privacy must declare each data
  type; `docs/PRIVACY.md` revision required
- Sign in with Apple becomes required if any third-party social login
  is added (Apple guideline 4.8). Currently N/A.
- In-app purchase or subscription → §8 Pricing and Availability,
  StoreKit configuration, subscription group setup; consult Apple
  guideline 3.1 first
- Encryption beyond HTTPS / platform-standard crypto added → §9
  `ITSAppUsesNonExemptEncryption` flips to `true` and an annual
  self-classification report (CCATS or self-classification) is
  required
- Target audience extended below 13 → Age Rating reopens
  Made-for-Kids category and triggers strict data-collection limits
