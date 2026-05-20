# P8-library — Library screen (assistance catalog)

> Spec written by the orchestrator on user direction (skip-brainstorm).
> Behavioral source: `design-reference/screens-meta.jsx:297-425` (LIBRARY constant + LibraryScreen).

## Goal

A static catalog of assistance exercises grouped by movement pattern. Read-only for v1 — tap doesn't open detail (yet). Lives under the Library tab.

## Behavioral reference

- `LIBRARY` (line 297) — array of `{ name, category, defaultSets, defaultReps, equipment }` entries spanning push/pull/legs/core.
- `LibraryScreen` (line 315) — renders a scrollable list grouped by category, with a category header and rows below.
- Color accent per category from `ASSISTANCE_COLOR` in `screens-main.jsx:599` (`push`/`pull`/`legs`/`core` → hot/lime/ice/amber).

## Files

**Create:**
- `apps/mobile/src/features/library/LibraryScreen.tsx` — main screen component. Accepts no props (data is static for v1).
- `apps/mobile/src/features/library/library-data.ts` — exports `LIBRARY: LibraryItem[]` and `LibraryItem` type. Port verbatim from the reference.
- `apps/mobile/src/features/library/__tests__/LibraryScreen.test.tsx`
- `apps/mobile/src/features/library/__stories__/LibraryScreen.stories.tsx`

**Modify:**
- `apps/mobile/src/app/(tabs)/library.tsx` — render `<LibraryScreen />`.

## Component shape

```ts
type LibraryItem = {
  name: string;
  category: 'push' | 'pull' | 'legs' | 'core';
  defaultSets: number;
  defaultReps: number | string;       // some reps are "AMRAP" / "30s"
  equipment?: string;
};

const CATEGORY_COLOR: Record<LibraryItem['category'], 'hot' | 'lime' | 'ice' | 'amber'> = {
  push: 'hot', pull: 'lime', legs: 'ice', core: 'amber',
};
```

`LibraryScreen`:
- `ScrollView` with `colors.bg0` background, `shape.rLg` padding.
- `<Text variant="title">Library</Text>` header.
- For each category in render order [push, pull, legs, core]:
  - `<Caps>` with category name + a small dot in `CATEGORY_COLOR[cat]`.
  - One `<Card>` per item with `<Text>` name + `<Caps>` "<sets> × <reps>" subtitle.

## Tests

- Renders header "Library".
- For each category, renders at least one item from `LIBRARY` (assert by name).
- Category headers display in this order: Push, Pull, Legs, Core.

## Done_when (the existing queue entry already has these — restating)

- Spec exists (this file).
- Screen renders the catalog from `library-data.ts`.
- Wired into `(tabs)/library.tsx`.
- Test passes; `pnpm test` green.
