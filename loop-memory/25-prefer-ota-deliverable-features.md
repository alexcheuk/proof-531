---
name: prefer-ota-deliverable-features
description: Default to JS/TS built-ins over new native modules when building a mobile feature, so it ships over the air. Adding a native module changes the EAS fingerprint and strands the feature behind a rebuild until users update.
---

# Prefer OTA-deliverable features (found 2026-06-13, tick-10, Expedition 88)

When a mobile feature can be built with React Native built-ins or already-installed modules,
prefer that over pulling in a new native module. The reason is delivery, not just bundle size:
adding a native module changes the EAS fingerprint (`runtimeVersion: { policy: "fingerprint" }`),
which means existing installs will not receive the feature over the air. The code lands on `main`
but is gated on a fresh native build until users update through the store. A JS-only feature ships
the same tick over OTA and reaches everyone immediately.

## The pattern (DATA-BACKUP, Expedition 88)

The Data Backup & Restore feature deliberately used **no new npm packages**:

- Export: RN built-in `Share.share()` (native share sheet: save to Files, email, etc.).
- Import: a plain `TextInput` paste flow, wrapped in the first themed `PasteField` primitive.

That choice kept the whole feature OTA-deliverable.

## The rule for future ticks

1. Reach for built-ins / installed modules first. Only add a native module when the feature
   genuinely cannot be done without one (e.g. a real OS capability like notifications).
2. If a native module is unavoidable, say so in the commit and note that it changes the
   fingerprint and needs a rebuild before the feature reaches existing users. That is the
   contract documented in `01-known-codebase.md` (OTA fingerprint section).
3. This is a default, not a hard line. The user-facing capability wins; do not contort a
   feature into a worse experience purely to dodge a rebuild.

Related mechanics: `01-known-codebase.md` (OTA fingerprint, native-module rebuild cost).
