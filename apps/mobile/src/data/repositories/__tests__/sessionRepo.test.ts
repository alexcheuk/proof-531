import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../db/schema';
import { createSessionRepo } from '../sessionRepo';

function makeDb() {
  const sqlite = new Database(':memory:');
  sqlite.exec(`
    CREATE TABLE lifts (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      category TEXT NOT NULL,
      training_max INTEGER NOT NULL,
      enabled INTEGER NOT NULL
    );
    CREATE TABLE cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER
    );
    CREATE TABLE sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cycle_id INTEGER NOT NULL REFERENCES cycles(id),
      lift_id TEXT NOT NULL REFERENCES lifts(id),
      week INTEGER NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER
    );
  `);
  // Seed referenced rows
  sqlite
    .prepare(
      "INSERT INTO lifts (id, label, category, training_max, enabled) VALUES ('squat', 'Squat', 'lower', 315, 1)",
    )
    .run();
  sqlite
    .prepare(
      "INSERT INTO lifts (id, label, category, training_max, enabled) VALUES ('bench', 'Bench', 'upper', 225, 1)",
    )
    .run();
  sqlite.prepare('INSERT INTO cycles (number, started_at) VALUES (1, 1735689600)').run();
  sqlite.prepare('INSERT INTO cycles (number, started_at) VALUES (2, 1738368000)').run();
  return drizzle(sqlite, { schema });
}

describe('sessionRepo', () => {
  it('list returns [] when empty', () => {
    const db = makeDb();
    const repo = createSessionRepo(db);
    expect(repo.list()).toEqual([]);
  });

  it('create + get returns row', () => {
    const db = makeDb();
    const repo = createSessionRepo(db);
    const startedAt = new Date('2026-01-01T08:00:00Z');
    const session = repo.create({ cycleId: 1, liftId: 'squat', week: 1, startedAt });
    expect(session.id).toBe(1);
    expect(session.cycleId).toBe(1);
    expect(session.liftId).toBe('squat');
    expect(session.week).toBe(1);
    expect(repo.get(session.id)).toEqual(session);
  });

  it('get returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createSessionRepo(db);
    expect(repo.get(999)).toBeUndefined();
  });

  it('listByCycle filters to the cycle', () => {
    const db = makeDb();
    const repo = createSessionRepo(db);
    repo.create({ cycleId: 1, liftId: 'squat', week: 1, startedAt: new Date('2026-01-01') });
    repo.create({ cycleId: 1, liftId: 'bench', week: 1, startedAt: new Date('2026-01-02') });
    repo.create({ cycleId: 2, liftId: 'squat', week: 1, startedAt: new Date('2026-02-01') });
    const c1 = repo.listByCycle(1);
    expect(c1).toHaveLength(2);
    expect(c1.every((s) => s.cycleId === 1)).toBe(true);
    expect(repo.listByCycle(2)).toHaveLength(1);
    expect(repo.listByCycle(999)).toEqual([]);
  });

  it('update sets completedAt', () => {
    const db = makeDb();
    const repo = createSessionRepo(db);
    const created = repo.create({
      cycleId: 1,
      liftId: 'squat',
      week: 1,
      startedAt: new Date('2026-01-01'),
    });
    const completedAt = new Date('2026-01-01T09:00:00Z');
    const updated = repo.update(created.id, { completedAt });
    expect(updated?.completedAt?.getTime()).toBe(completedAt.getTime());
  });

  it('update returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createSessionRepo(db);
    expect(repo.update(999, { week: 2 })).toBeUndefined();
  });
});
