# Security policy

## Scope

531 Strength is a local-first app. All user data — training logs, PRs, cycle history, training maxes — is stored in an on-device SQLite database. There is no backend server, no cloud sync, no user accounts, and no data collection.

Security vulnerabilities in the traditional sense (authentication bypass, data exfiltration, remote code execution) have limited surface area here. That said, we take reports seriously.

In scope:

- The mobile app (iOS + Android) — React Native / Expo
- The marketing website (`531strength.com`) — Astro static site
- The build toolchain and CI workflows in this repo

Out of scope:

- Theoretical vulnerabilities with no practical exploit path
- Issues requiring physical access to an unlocked device
- Third-party services (Expo Application Services, Vercel, GitHub Actions)

## Reporting a vulnerability

Open a [GitHub Issue](https://github.com/alexcheuk/proof-531/issues/new) and mark it with the label `security`. For anything that shouldn't be public immediately (e.g., a supply-chain issue affecting the release build), email the maintainer via the contact on the [support page](https://531strength.com/support).

Please include:

- A clear description of the vulnerability
- Steps to reproduce
- The potential impact
- Any suggested remediation if you have one

We aim to acknowledge reports within 48 hours and will keep you updated as we investigate. If you discover the issue qualifies for responsible disclosure, we'll credit you in the CHANGELOG entry when the fix ships.

## Supported versions

Only the latest release is actively maintained. Security fixes are not backported to older builds.
