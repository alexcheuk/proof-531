import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../db/schema';
import { createAssistanceRepo } from '../assistanceRepo';

function makeDb() {
  const sqlite = new Database(':memory:');
  sqlite.exec(`
    CREATE TABLE assistance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      default_sets INTEGER NOT NULL,
      default_reps INTEGER NOT NULL,
      favorite INTEGER NOT NULL
    );
  `);
  return drizzle(sqlite, { schema });
}

describe('assistanceRepo', () => {
  it('list returns [] when empty', () => {
    const db = makeDb();
    const repo = createAssistanceRepo(db);
    expect(repo.list()).toEqual([]);
  });

  it('create + get + list', () => {
    const db = makeDb();
    const repo = createAssistanceRepo(db);
    const row = repo.create({
      name: 'Chinup',
      category: 'pull',
      defaultSets: 5,
      defaultReps: 10,
      favorite: true,
    });
    expect(row.id).toBe(1);
    expect(row.name).toBe('Chinup');
    expect(row.favorite).toBe(true);
    expect(repo.get(row.id)).toEqual(row);
    expect(repo.list()).toEqual([row]);
  });

  it('get returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createAssistanceRepo(db);
    expect(repo.get(999)).toBeUndefined();
  });

  it('update modifies fields', () => {
    const db = makeDb();
    const repo = createAssistanceRepo(db);
    const created = repo.create({
      name: 'Chinup',
      category: 'pull',
      defaultSets: 5,
      defaultReps: 10,
      favorite: false,
    });
    const updated = repo.update(created.id, { favorite: true, defaultSets: 4 });
    expect(updated?.favorite).toBe(true);
    expect(updated?.defaultSets).toBe(4);
    expect(repo.get(created.id)?.favorite).toBe(true);
  });

  it('update returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createAssistanceRepo(db);
    expect(repo.update(999, { favorite: true })).toBeUndefined();
  });

  it('list returns multiple rows', () => {
    const db = makeDb();
    const repo = createAssistanceRepo(db);
    repo.create({
      name: 'Chinup',
      category: 'pull',
      defaultSets: 5,
      defaultReps: 10,
      favorite: true,
    });
    repo.create({
      name: 'Dip',
      category: 'push',
      defaultSets: 5,
      defaultReps: 15,
      favorite: false,
    });
    expect(repo.list()).toHaveLength(2);
  });
});
