// Inlined initial schema, derived verbatim from
// `migrations/0000_noisy_maximus.sql`. Run via `sqlite.execSync()` at app
// boot. Uses `CREATE TABLE IF NOT EXISTS` so re-runs are idempotent.
//
// This is a pragmatic shim while the proper drizzle-kit migration bundling
// is unfinished (see `migrations.ts` for the no-op stub). When that lands,
// delete this file and route bootstrap through `useMigrations()` instead.
export const EMBEDDED_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS assistance (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  default_sets integer NOT NULL,
  default_reps integer NOT NULL,
  favorite integer NOT NULL
);

CREATE TABLE IF NOT EXISTS cycles (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  number integer NOT NULL,
  started_at integer NOT NULL,
  completed_at integer
);

CREATE TABLE IF NOT EXISTS lifts (
  id text PRIMARY KEY NOT NULL,
  label text NOT NULL,
  category text NOT NULL,
  training_max integer NOT NULL,
  enabled integer NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  cycle_id integer NOT NULL,
  lift_id text NOT NULL,
  week integer NOT NULL,
  started_at integer NOT NULL,
  completed_at integer,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (lift_id) REFERENCES lifts(id) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS sets (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  session_id integer NOT NULL,
  "index" integer NOT NULL,
  type text NOT NULL,
  prescribed_weight integer NOT NULL,
  prescribed_reps integer NOT NULL,
  actual_reps integer,
  completed_at integer,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE no action
);
`;
