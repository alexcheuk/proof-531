import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { EMBEDDED_SCHEMA_SQL } from './embedded-schema';
import * as schema from './schema';

export const sqlite = openDatabaseSync('proof-531.db');

// Pragmatic schema bootstrap: drizzle-kit migration bundling isn't wired
// yet (see `migrations.ts`), so apply the inlined schema directly. Uses
// CREATE TABLE IF NOT EXISTS so it's safe to call on every cold start.
sqlite.execSync(EMBEDDED_SCHEMA_SQL);

// First-run seed: insert the 4 default lifts if the lifts table is empty.
// Uses INSERT OR IGNORE so re-runs are no-ops. Lets the Home screen show
// something meaningful before the user completes Onboarding.
sqlite.execSync(`
  INSERT OR IGNORE INTO lifts (id, label, category, training_max, enabled) VALUES
    ('squat',    'Squat',    'lower', 275, 1),
    ('bench',    'Bench',    'upper', 195, 1),
    ('deadlift', 'Deadlift', 'lower', 345, 1),
    ('press',    'Press',    'upper', 125, 1);
`);

export const db = drizzle(sqlite, { schema });

export type DB = typeof db;
