// Drizzle migrations stub for Expo SDK 55.
//
// In a fully wired Drizzle/Expo setup, `drizzle-kit generate` produces a
// `migrations.js` alongside the SQL files which bundles the SQL into the JS
// bundle (via @drizzle-orm/babel-plugin or a Metro transformer). Until that
// bundling is wired in a follow-up task, this no-op stub satisfies the shape
// expected by `drizzle-orm/expo-sqlite/migrator`'s `useMigrations` hook so the
// hook can be called in `_layout.tsx`.
//
// Shape derived from drizzle-orm runtime: `{ journal, migrations }`.
export default {
  journal: {
    entries: [] as { idx: number; when: number; tag: string; breakpoints: boolean }[],
  },
  migrations: {} as Record<string, string>,
};
