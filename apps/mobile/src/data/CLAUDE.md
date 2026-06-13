# Data layer rules

`src/data/` owns all persistence for the app. This is the only layer allowed to touch Drizzle, expo-sqlite, or TanStack Query.

## Rules (enforced by reviewer)

1. **Components never import from Drizzle directly.** All reads/writes go through accessors (`src/data/accessors/`) or TanStack Query hooks (`src/data/queries/`). No `import { db } from 'drizzle-orm'` in `features/` or `app/`.
2. **Accessors are plain async functions.** They take a `db` handle (from `useDb()`) and return typed values. No React hooks inside `accessors/`.
3. **Query hooks live in `queries/`.** Each hook wraps a `useQuery` or `useMutation` over an accessor. The hook owns the query key and cache invalidation.
4. **Schema lives in `drizzle/schema.ts`.** Migrations are SQL files in `drizzle/migrations/` mirrored as TS template literals so Metro can bundle them.
5. **No business logic in accessors.** Accessors compose SQL; they do not compute training maxes, plate sets, or rep schemes. That belongs in `domain/`.

## What lives here

- `DbProvider.tsx`  -  React context that boots the Drizzle client, runs migrations, and exposes `useDb()`.
- `accessors/`  -  raw read/write functions (e.g. `createSession`, `setTrainingMax`, `getSetLogs`).
- `drizzle/`  -  SQLite client, schema, migrations, and the `runMigrations` boot function.
- `queries/`  -  TanStack Query hooks (e.g. `useSession`, `usePrs`, `useSettings`). Each file exports one hook + its query key constant.

## Query key conventions

Every query hook exports a `*_KEY` or `*_QUERY_KEY` constant so callers can invalidate correctly:

```ts
// queries/useLatestTm.ts
export const TM_KEY = ['latest-tm'] as const;
export function useLatestTm(lift: Lift) { ... }
```

After a mutation that changes TMs, call `queryClient.invalidateQueries({ queryKey: TM_KEY })`.

## Testing

Accessor tests live in `accessors/__tests__/` and run against an in-memory `better-sqlite3` driver (not the Expo runtime). The `freshDb()` test helper creates a clean schema for each test. No mocking of Drizzle  -  tests hit the real query API.

Query hooks are tested by mocking the accessor layer at the module boundary.

## Violations

If you see `import drizzle` or a raw SQL string outside `src/data/`, it's a boundary violation.
