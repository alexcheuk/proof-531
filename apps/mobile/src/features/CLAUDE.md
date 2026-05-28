# Features layer rules

`src/features/` is where screen composition happens. Each subfolder mirrors a screen or a shared cross-screen concern.

## Rules (enforced by reviewer)

1. **Features compose; they do not define fundamentals.** No hex/px literals — use `useTheme()`. No raw SQL — use `data/` hooks. No 5/3/1 math inline — use `domain/` functions.
2. **Import direction is one-way:** `features/ → (design/ | data/ | domain/)`. Never `design/ → features/` or `data/ → features/`.
3. **No barrel files.** Import directly from the file that exports the symbol. No `features/index.ts` or `features/session/index.ts`.
4. **One component per file.** Large screens are composed from smaller components in a `components/` subfolder. Hooks live in `hooks/`. Tests live in `__tests__/`.
5. **Routes (`src/app/`) are thin shells.** They import a single feature component and forward route params. No logic in route files beyond extracting params.

## Structure convention

```
features/
  session/
    LiveScreen.tsx          # the route-level component
    components/
      LiveHeader.tsx        # sub-components used only by this feature
      RestPhase.tsx
    hooks/
      useRestTimer.ts       # hooks extracted from components
      useLiveScreenState.ts
    __tests__/
      LiveScreen.test.tsx
  shared/
    LiftTabs.tsx            # components used by 2+ features
    LiftTab.tsx
```

## Shared components

Cross-feature components live in `features/shared/`. If a component is used by two or more features, move it there rather than importing across feature folders (that creates an implicit coupling between features).

## Component tests

Test behavior and accessibility, not pixels. A good component test:

- Renders the component with a `ThemeProvider` wrapper.
- Fires user interactions (`fireEvent.press`, etc.).
- Asserts on visible text, `accessibilityRole`, or state changes.
- Does NOT assert on style props (color, size, layout).
- Mocks `@gorhom/bottom-sheet` when the component tree reaches `Sheet` or `SheetLayout` (Reanimated worklets don't run in Jest — see `loop-memory/01-known-codebase.md` for the standard mock).

## Violations

If you find hex literals, raw SQL strings, 5/3/1 math, or barrel files in this layer, it's a violation.
