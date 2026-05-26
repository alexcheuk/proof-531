/** SQL mirror of 0001_init.sql — kept as a TS template literal so Metro can bundle it. */
export const MIGRATION_0001 = `
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  storage_unit TEXT NOT NULL,
  display_unit TEXT NOT NULL,
  plate_set TEXT NOT NULL,
  enabled_lifts TEXT NOT NULL,
  current_cycle INTEGER NOT NULL,
  week INTEGER NOT NULL,
  day INTEGER NOT NULL,
  rest_target_seconds INTEGER NOT NULL DEFAULT 90,
  bbb_rest_target_seconds INTEGER NOT NULL DEFAULT 90
);

CREATE TABLE IF NOT EXISTS training_maxes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lift TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  note TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lift TEXT NOT NULL,
  cycle INTEGER NOT NULL,
  week INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  status TEXT NOT NULL,
  training_max_snapshot REAL NOT NULL,
  storage_unit_snapshot TEXT,
  display_unit_snapshot TEXT
);

CREATE TABLE IF NOT EXISTS set_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id),
  "index" INTEGER NOT NULL,
  kind TEXT NOT NULL,
  prescribed_weight REAL NOT NULL,
  prescribed_reps INTEGER NOT NULL,
  actual_reps INTEGER NOT NULL,
  completed_at INTEGER NOT NULL,
  is_pr INTEGER,
  estimated_1rm REAL
);

CREATE TABLE IF NOT EXISTS prs (
  lift TEXT PRIMARY KEY,
  best_e1rm REAL NOT NULL,
  set_log_id INTEGER NOT NULL REFERENCES set_logs(id),
  achieved_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lift_goals (
  lift TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  target_value REAL NOT NULL,
  unit TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
`;
