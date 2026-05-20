import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../db/schema';
import { createCycleRepo } from '../cycleRepo';

function makeDb() {
  const sqlite = new Database(':memory:');
  sqlite.exec(`
    CREATE TABLE cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER
    );
  `);
  return drizzle(sqlite, { schema });
}

describe('cycleRepo', () => {
  it('list returns [] when empty', () => {
    const db = makeDb();
    const repo = createCycleRepo(db);
    expect(repo.list()).toEqual([]);
  });

  it('create assigns autoincrement id and returns row', () => {
    const db = makeDb();
    const repo = createCycleRepo(db);
    const startedAt = new Date('2026-01-01T00:00:00Z');
    const cycle = repo.create({ number: 1, startedAt });
    expect(cycle.id).toBe(1);
    expect(cycle.number).toBe(1);
    expect(cycle.startedAt.getTime()).toBe(startedAt.getTime());
    expect(cycle.completedAt).toBeNull();
  });

  it('get returns inserted row', () => {
    const db = makeDb();
    const repo = createCycleRepo(db);
    const created = repo.create({ number: 1, startedAt: new Date('2026-01-01') });
    expect(repo.get(created.id)).toEqual(created);
  });

  it('get returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createCycleRepo(db);
    expect(repo.get(999)).toBeUndefined();
  });

  it('update sets completedAt', () => {
    const db = makeDb();
    const repo = createCycleRepo(db);
    const created = repo.create({ number: 1, startedAt: new Date('2026-01-01') });
    const completedAt = new Date('2026-02-01');
    const updated = repo.update(created.id, { completedAt });
    expect(updated?.completedAt?.getTime()).toBe(completedAt.getTime());
  });

  it('update returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createCycleRepo(db);
    expect(repo.update(999, { number: 5 })).toBeUndefined();
  });

  it('list returns all rows', () => {
    const db = makeDb();
    const repo = createCycleRepo(db);
    repo.create({ number: 1, startedAt: new Date('2026-01-01') });
    repo.create({ number: 2, startedAt: new Date('2026-02-01') });
    expect(repo.list()).toHaveLength(2);
  });
});
