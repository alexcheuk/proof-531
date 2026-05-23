import Database from 'better-sqlite3';
import { runMigrations } from '../runMigrations';

describe('runMigrations', () => {
  it('creates all 5 tables in :memory: sqlite', () => {
    const db = new Database(':memory:');
    runMigrations(db);
    const tableNames = (
      db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as Array<{
        name: string;
      }>
    ).map((r) => r.name);
    expect(tableNames).toEqual(
      expect.arrayContaining(['settings', 'training_maxes', 'sessions', 'set_logs', 'prs']),
    );
    db.close();
  });

  it('is idempotent (re-run is a no-op)', () => {
    const db = new Database(':memory:');
    runMigrations(db);
    expect(() => runMigrations(db)).not.toThrow();
    db.close();
  });
});
