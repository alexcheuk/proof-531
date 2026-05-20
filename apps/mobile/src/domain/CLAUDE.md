# Working in src/domain/

## Rules

- **No React.** No imports from `react`, `react-native`, or any UI library.
- **No async.** No `async`/`await`, no Promises, no setTimeout. Functions are synchronous.
- **No IO.** No DB, no fetch, no file system, no AsyncStorage.
- **No environment access.** No `process.env`, no `Date.now()` directly — accept time as a parameter.
- **Property tests required** for anything mathematical. Use `fast-check` from `@fast-check/jest`.
- **Coverage gate: 95%.** CI fails below this.

## Why

This is the part of the app a future-you (or a future-Claude) can stare at and immediately understand. No environmental coupling means tests are fast and deterministic. No async means call sites are easy to reason about. The 5/3/1 math, plate calc, e1RM formula, and progression rules are the product's truth — they get the most expensive testing because everything else depends on them.

## File organization

```
domain/
  program/     # 5/3/1 percentages, week scheme, AMRAP rules, deload
  plates/      # calcPlates: greedy plate fill given bar + inventory
  e1rm/        # Epley formula + PR detection
  progression/ # TM bump rules, cycle advance
```

Each subfolder exports an `index.ts` with the public API. Implementation files (`epley.ts`, `pr.ts`, ...) are colocated. Tests live in `__tests__/` next to source.

## Naming

- Public functions: `prescribedSets`, `calcPlates`, `epley`, `isPR`, `nextTrainingMax`.
- No abbreviated parameter names except units (`reps`, `lbs`, `tm`).
- Booleans named with `is`/`has`/`should` prefix.
