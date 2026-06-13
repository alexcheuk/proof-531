# Domain layer rules

`src/domain/` is the pure business-logic core of the app. Every file in this directory is a plain TypeScript module  -  no framework, no async, no I/O.

## Rules (enforced by reviewer)

1. **No React imports.** No hooks, no components, no JSX.
2. **No async.** No `Promise`, no `async/await`, no `setTimeout`.
3. **No Drizzle or SQLite.** No imports from `drizzle-orm`, `expo-sqlite`, or `../data/`.
4. **No barrel files.** Import directly from the file that exports the symbol.
5. **Property-tested where math is non-trivial.** Use `fast-check` in `__tests__/`.

## What lives here

- 5/3/1 scheme computation (`schemes.ts`, `bbb.ts`)
- Training-max progression rules (`progression.ts`, `increments.ts`)
- Plate math (`plates.ts`)
- 1RM estimation (`epley.ts`)
- Unit and weight formatting (`units.ts`)
- Time helpers (`time.ts`, `relativeTime.ts`)
- Domain type aliases (`types.ts`)

## Adding a function

Write the test first (TDD). The test lives in `__tests__/` next to the source file. Use `fast-check` for property tests whenever the function involves numeric invariants.

## Violations

If you see a React/async/Drizzle import here, it's a boundary violation  -  remove it and move the logic to the right layer (`data/` for persistence, `features/` for UI state).
