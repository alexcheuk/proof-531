# P8-settings — Settings screen

> Spec written by the orchestrator on user direction (skip-brainstorm).
> Behavioral source: `design-reference/screens-meta.jsx:426-651` (SettingsScreen + SettingsSection + SettingRow).

## Goal

User preferences for unit system, plate set, per-lift enable, and analytics opt-in. Sections are tappable rows with a label, optional value, optional hint, and either a `>` chevron (navigates to a sub-screen — out of scope this task) or an inline toggle.

## Behavioral reference

- `SettingsScreen` (line 426) — top-level. Props: `{ unit, onUnitChange, percentages, onPercentChange, plateSet, onPlateSetChange, session, onToggleLift }`.
- `SettingsSection` (line 606) — header + children.
- `SettingRow` (line 615) — single row: label, value, hint, optional toggle.

## Files

**Create:**
- `apps/mobile/src/features/settings/SettingsScreen.tsx`
- `apps/mobile/src/features/settings/SettingsSection.tsx`
- `apps/mobile/src/features/settings/SettingRow.tsx`
- `apps/mobile/src/features/settings/__tests__/SettingsScreen.test.tsx`
- `apps/mobile/src/features/settings/__stories__/SettingsScreen.stories.tsx`

**Modify:**
- `apps/mobile/src/app/(tabs)/settings.tsx` — replace the stub from P6-02 with `<SettingsScreen />`. **Important:** preserve the analytics toggle behavior from P6-02 (the toggle wires into `useAnalyticsStore`). Rebuild it as a SettingRow inside a new "Privacy" section.

## Component shape

```ts
type SettingsScreenProps = {
  unit: 'lbs' | 'kg';
  onUnitChange: (u: 'lbs' | 'kg') => void;
  plateSet: 'standard-lbs' | 'standard-kg' | 'custom';
  onPlateSetChange: (p: SettingsScreenProps['plateSet']) => void;
  lifts: { id: string; label: string; enabled: boolean }[];
  onToggleLift: (id: string) => void;
  analyticsEnabled: boolean;
  onAnalyticsChange: (v: boolean) => void;
};
```

Sections:
1. **Units** — single SettingRow with a SegRail (lbs/kg) inline.
2. **Plate set** — SettingRow showing current set with `>` chevron (sub-screen TBD).
3. **Lifts** — one SettingRow per lift with an inline toggle.
4. **Privacy** — Analytics SettingRow with toggle bound to `useAnalyticsStore`.

The route `(tabs)/settings.tsx` reads `unit` etc. from local component state for now (real persistence is a later task) — except `analyticsEnabled` which already lives in `useAnalyticsStore`.

## Tests

- Renders 4 section headers.
- Unit SettingRow shows current unit; toggling calls `onUnitChange`.
- Lift toggle calls `onToggleLift(id)`.
- Analytics toggle calls `onAnalyticsChange(true)` when flipped on.

## Done_when

- Spec exists.
- SettingsScreen + SettingsSection + SettingRow exist.
- Route renders the screen with `useAnalyticsStore` bound to the privacy row.
- Tests pass.
