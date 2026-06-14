// Full-database export/restore. exportBackup serializes every persisted table
// (completed sessions + their set logs only) to a JSON envelope; importBackup
// validates that envelope end-to-end BEFORE touching the DB, then clears and
// re-inserts inside a raw BEGIN/COMMIT so a malformed paste or mid-write crash
// can never half-write the user's data. Restore preserves integer ids so FKs
// (set_logs.session_id, prs.set_log_id) stay valid.
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import Constants from 'expo-constants';
import {
  liftGoals,
  liftMissState,
  liftProgress,
  prs,
  sessions,
  setLogs,
  settings,
  trainingMaxes,
} from '../drizzle/schema';

// biome-ignore lint/suspicious/noExplicitAny: structural-poly across sqlite drivers
type AnyDb = BaseSQLiteDatabase<any, any, any>;

export const BACKUP_SCHEMA_VERSION = 1;

type SettingsRow = typeof settings.$inferSelect;
type TrainingMaxRow = typeof trainingMaxes.$inferSelect;
type LiftProgressRow = typeof liftProgress.$inferSelect;
type SessionRow = typeof sessions.$inferSelect;
type SetLogRow = typeof setLogs.$inferSelect;
type PrRow = typeof prs.$inferSelect;
type LiftGoalRow = typeof liftGoals.$inferSelect;
type LiftMissStateRow = typeof liftMissState.$inferSelect;

export type BackupTables = {
  settings: SettingsRow[];
  trainingMaxes: TrainingMaxRow[];
  liftProgress: LiftProgressRow[];
  sessions: SessionRow[];
  setLogs: SetLogRow[];
  prs: PrRow[];
  liftGoals: LiftGoalRow[];
  liftMissState: LiftMissStateRow[];
};

export type BackupEnvelope = {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  tables: BackupTables;
};

export type ImportResult = { sessionCount: number; tmCount: number };

export type ParseResult =
  | { ok: true; envelope: BackupEnvelope }
  | { ok: false; reason: 'invalid-json' | 'wrong-shape' | 'unsupported-version' };

const TABLE_KEYS: (keyof BackupTables)[] = [
  'settings',
  'trainingMaxes',
  'liftProgress',
  'sessions',
  'setLogs',
  'prs',
  'liftGoals',
  'liftMissState',
];

export class BackupError extends Error {
  readonly reason: 'invalid-json' | 'wrong-shape' | 'unsupported-version';
  constructor(reason: 'invalid-json' | 'wrong-shape' | 'unsupported-version') {
    super(`backup: ${reason}`);
    this.name = 'BackupError';
    this.reason = reason;
  }
}

export function parseBackup(json: string): ParseResult {
  let candidate: unknown;
  try {
    candidate = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }

  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    return { ok: false, reason: 'wrong-shape' };
  }

  const obj = candidate as Record<string, unknown>;

  if (typeof obj.schemaVersion !== 'number') {
    return { ok: false, reason: 'wrong-shape' };
  }
  // Reject anything this app version can't read before checking table shape  -
  // a newer schema may legitimately add/rename keys.
  if (obj.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported-version' };
  }

  const tables = obj.tables;
  if (typeof tables !== 'object' || tables === null || Array.isArray(tables)) {
    return { ok: false, reason: 'wrong-shape' };
  }
  const tablesObj = tables as Record<string, unknown>;
  for (const key of TABLE_KEYS) {
    if (!Array.isArray(tablesObj[key])) {
      return { ok: false, reason: 'wrong-shape' };
    }
  }

  return { ok: true, envelope: candidate as BackupEnvelope };
}

export async function exportBackup(db: AnyDb): Promise<string> {
  const allSessions = (await Promise.resolve(db.select().from(sessions))) as SessionRow[];
  const completedSessions = allSessions.filter((s) => s.status === 'completed');
  const completedIds = completedSessions.map((s) => s.id);

  const allSetLogs = (await Promise.resolve(db.select().from(setLogs))) as SetLogRow[];
  const includedIds = new Set(completedIds);
  const includedSetLogs = allSetLogs.filter((l) => includedIds.has(l.sessionId));

  const envelope: BackupEnvelope = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: Constants.expoConfig?.version ?? 'unknown',
    exportedAt: new Date().toISOString(),
    tables: {
      settings: (await Promise.resolve(db.select().from(settings))) as SettingsRow[],
      trainingMaxes: (await Promise.resolve(db.select().from(trainingMaxes))) as TrainingMaxRow[],
      liftProgress: (await Promise.resolve(db.select().from(liftProgress))) as LiftProgressRow[],
      sessions: completedSessions,
      setLogs: includedSetLogs,
      prs: (await Promise.resolve(db.select().from(prs))) as PrRow[],
      liftGoals: (await Promise.resolve(db.select().from(liftGoals))) as LiftGoalRow[],
      liftMissState: (await Promise.resolve(db.select().from(liftMissState))) as LiftMissStateRow[],
    },
  };

  return JSON.stringify(envelope);
}

// Reach the underlying driver for raw BEGIN/COMMIT/ROLLBACK  -  mirrors
// migrateStorageUnit.ts. Returns false when neither shape is available
// (some test handles), in which case writes run sequentially without a wrapper.
function execRaw(db: AnyDb, sql: string): boolean {
  // biome-ignore lint/suspicious/noExplicitAny: structural reach across drivers
  const session = (db as any).session;
  // biome-ignore lint/suspicious/noExplicitAny: structural reach across drivers
  const client: any = session?.client;
  if (client) {
    if (typeof client.execSync === 'function') {
      client.execSync(sql);
      return true;
    }
    if (typeof client.exec === 'function') {
      client.exec(sql);
      return true;
    }
  }
  return false;
}

export async function importBackup(db: AnyDb, json: string): Promise<ImportResult> {
  const parsed = parseBackup(json);
  if (!parsed.ok) {
    // Throw BEFORE opening any transaction  -  a bad paste never clears data.
    throw new BackupError(parsed.reason);
  }
  const { tables } = parsed.envelope;

  const inTransaction = execRaw(db, 'BEGIN;');
  try {
    // Clear child → parent so FK references never dangle mid-clear.
    await Promise.resolve(db.delete(prs));
    await Promise.resolve(db.delete(setLogs));
    await Promise.resolve(db.delete(sessions));
    await Promise.resolve(db.delete(trainingMaxes));
    await Promise.resolve(db.delete(liftProgress));
    await Promise.resolve(db.delete(liftGoals));
    await Promise.resolve(db.delete(liftMissState));
    await Promise.resolve(db.delete(settings));

    // Insert parent → child so FK references resolve as rows land.
    if (tables.settings.length > 0) {
      await Promise.resolve(db.insert(settings).values(tables.settings));
    }
    if (tables.trainingMaxes.length > 0) {
      await Promise.resolve(db.insert(trainingMaxes).values(tables.trainingMaxes));
    }
    if (tables.liftProgress.length > 0) {
      await Promise.resolve(db.insert(liftProgress).values(tables.liftProgress));
    }
    if (tables.sessions.length > 0) {
      await Promise.resolve(db.insert(sessions).values(tables.sessions));
    }
    if (tables.setLogs.length > 0) {
      await Promise.resolve(db.insert(setLogs).values(tables.setLogs));
    }
    if (tables.prs.length > 0) {
      await Promise.resolve(db.insert(prs).values(tables.prs));
    }
    if (tables.liftGoals.length > 0) {
      await Promise.resolve(db.insert(liftGoals).values(tables.liftGoals));
    }
    if (tables.liftMissState.length > 0) {
      await Promise.resolve(db.insert(liftMissState).values(tables.liftMissState));
    }

    if (inTransaction) execRaw(db, 'COMMIT;');
  } catch (err) {
    if (inTransaction) execRaw(db, 'ROLLBACK;');
    throw err;
  }

  return { sessionCount: tables.sessions.length, tmCount: tables.trainingMaxes.length };
}
