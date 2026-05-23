# Screenshot-pair audit procedure

> Spec ref: `docs/superpowers/specs/2026-05-22-rn-port-from-pwa-design.md` §7.
> Tracking task: `PF-04-screenshot-pairs` (queue.yaml).

The autonomous orchestrator commits screen ports direct to `main` with `done_when`
checklists in the commit body — there are no per-feature PRs to attach screenshots
to. This document defines the **post-merge visual audit** that the spec asks for.
It is a human-in-the-loop process; the orchestrator cannot run it end-to-end.

## When to do an audit

After any of the following land on `main`:

- Onboarding flow (`PE-02-onboarding`).
- Home (`PE-03-home`).
- Today / Live / Session-complete (`PE-04`, `PE-05`, `PE-06`).
- History (`PE-07-history`).
- Settings (`PE-08-settings`).
- Any later change that touches a primitive's visual API.

## What to capture

For each screen above, capture a **pair** of screenshots:

1. **PWA reference** — open `~/Development/531-pwa` in the desktop browser, navigate
   to the matching screen, set the viewport to **390 × 844** (iPhone 14), take a
   full-screen PNG. Save under `docs/screenshots/<screen>/pwa.png`.

2. **RN port** — boot the mobile app in Expo Go on a device or the iOS Simulator
   (`pnpm --filter @proof-531/mobile start`, then scan the QR or press `i`).
   Navigate to the matching screen. Take a screenshot. Save under
   `docs/screenshots/<screen>/rn.png`.

The expected screens and their seed states are listed in
`docs/screenshots/README.md`.

## Acceptance criteria

A screen passes the audit when:

- The pair is committed under `docs/screenshots/<screen>/` (both PNGs).
- A maintainer has reviewed the pair and signed off in the screen-pair changelog
  (`docs/screenshots/CHANGELOG.md`) with their initials + a one-line note. Major
  divergences from PWA must be either fixed or explicitly justified in the
  changelog entry.

## Common divergences to expect (and accept)

- **Native status bar.** RN renders the OS status bar; the PWA does not.
- **Native bottom safe-area inset.** RN screens reserve home-indicator space.
- **System fonts at 100% scale.** If `IBM Plex` fails to load, RN falls back to
  the system family — flag and re-test.
- **Paper grain.** The PWA's multi-layer radial-gradient grain is omitted in RN
  (deferred to a later Skia task).

If you see divergences outside this list, open a follow-up task before
signing off.
