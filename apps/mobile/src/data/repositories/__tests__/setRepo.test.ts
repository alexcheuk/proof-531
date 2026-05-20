import { createTestDb } from '../../db/test-harness';
import { createSetRepo } from '../setRepo';

function makeDb() {
  const { db, sqlite } = createTestDb();
  sqlite
    .prepare(
      "INSERT INTO lifts (id, label, category, training_max, enabled) VALUES ('squat', 'Squat', 'lower', 315, 1)",
    )
    .run();
  sqlite.prepare('INSERT INTO cycles (number, started_at) VALUES (1, 1735689600)').run();
  sqlite
    .prepare(
      "INSERT INTO sessions (cycle_id, lift_id, week, started_at) VALUES (1, 'squat', 1, 1735689600)",
    )
    .run();
  sqlite
    .prepare(
      "INSERT INTO sessions (cycle_id, lift_id, week, started_at) VALUES (1, 'squat', 2, 1736294400)",
    )
    .run();
  return db;
}

describe('setRepo', () => {
  it('list returns [] when empty', () => {
    const db = makeDb();
    const repo = createSetRepo(db);
    expect(repo.list()).toEqual([]);
  });

  it('create + get returns row', () => {
    const db = makeDb();
    const repo = createSetRepo(db);
    const set = repo.create({
      sessionId: 1,
      index: 0,
      type: 'warmup',
      prescribedWeight: 135,
      prescribedReps: 5,
    });
    expect(set.id).toBe(1);
    expect(set.sessionId).toBe(1);
    expect(set.index).toBe(0);
    expect(set.type).toBe('warmup');
    expect(set.prescribedWeight).toBe(135);
    expect(set.prescribedReps).toBe(5);
    expect(set.actualReps).toBeNull();
    expect(repo.get(set.id)).toEqual(set);
  });

  it('get returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createSetRepo(db);
    expect(repo.get(999)).toBeUndefined();
  });

  it('listBySession filters by session', () => {
    const db = makeDb();
    const repo = createSetRepo(db);
    repo.create({
      sessionId: 1,
      index: 0,
      type: 'warmup',
      prescribedWeight: 135,
      prescribedReps: 5,
    });
    repo.create({
      sessionId: 1,
      index: 1,
      type: 'working',
      prescribedWeight: 225,
      prescribedReps: 5,
    });
    repo.create({
      sessionId: 2,
      index: 0,
      type: 'warmup',
      prescribedWeight: 135,
      prescribedReps: 5,
    });
    expect(repo.listBySession(1)).toHaveLength(2);
    expect(repo.listBySession(2)).toHaveLength(1);
    expect(repo.listBySession(999)).toEqual([]);
  });

  it('update sets actualReps and completedAt', () => {
    const db = makeDb();
    const repo = createSetRepo(db);
    const created = repo.create({
      sessionId: 1,
      index: 0,
      type: 'working',
      prescribedWeight: 225,
      prescribedReps: 5,
    });
    const completedAt = new Date('2026-01-01T08:30:00Z');
    const updated = repo.update(created.id, { actualReps: 7, completedAt });
    expect(updated?.actualReps).toBe(7);
    expect(updated?.completedAt?.getTime()).toBe(completedAt.getTime());
  });

  it('update returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createSetRepo(db);
    expect(repo.update(999, { actualReps: 1 })).toBeUndefined();
  });
});
