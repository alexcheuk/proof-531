P4-05 retry plan:
- Commit existing apps/mobile/.maestro/home-renders.yaml (user-authored; matches testIDs from P4-02/P4-03)
- Add macos-14 Maestro CI job: boot sim, EAS local build (preview profile), install .app, maestro test, upload screenshots
- Add maestro:home script
- Gap: PNG baselines + simulator run cannot be verified from this environment (no xcrun/Xcode). Structurally complete; runtime parts satisfied on first successful CI run.
