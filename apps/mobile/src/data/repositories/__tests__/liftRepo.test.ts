import { createTestDb } from '../../db/test-harness';
import { createLiftRepo } from '../liftRepo';

function makeDb() {
  return createTestDb().db;
}

describe('liftRepo', () => {
  it('list returns [] when empty', () => {
    const db = makeDb();
    const repo = createLiftRepo(db);
    expect(repo.list()).toEqual([]);
  });

  it('create + get + list', () => {
    const db = makeDb();
    const repo = createLiftRepo(db);
    const lift = repo.create({
      id: 'squat',
      label: 'Squat',
      category: 'lower',
      trainingMax: 315,
      enabled: true,
    });
    expect(lift.id).toBe('squat');
    expect(lift.label).toBe('Squat');
    expect(lift.trainingMax).toBe(315);
    expect(lift.enabled).toBe(true);
    expect(repo.get('squat')).toEqual(lift);
    expect(repo.list()).toEqual([lift]);
  });

  it('get returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createLiftRepo(db);
    expect(repo.get('nope')).toBeUndefined();
  });

  it('update modifies fields and returns updated row', () => {
    const db = makeDb();
    const repo = createLiftRepo(db);
    repo.create({
      id: 'squat',
      label: 'Squat',
      category: 'lower',
      trainingMax: 315,
      enabled: true,
    });
    const updated = repo.update('squat', { trainingMax: 325, enabled: false });
    expect(updated?.trainingMax).toBe(325);
    expect(updated?.enabled).toBe(false);
    expect(repo.get('squat')?.trainingMax).toBe(325);
  });

  it('update returns undefined for missing id', () => {
    const db = makeDb();
    const repo = createLiftRepo(db);
    expect(repo.update('nope', { trainingMax: 1 })).toBeUndefined();
  });

  it('list returns multiple rows', () => {
    const db = makeDb();
    const repo = createLiftRepo(db);
    repo.create({
      id: 'squat',
      label: 'Squat',
      category: 'lower',
      trainingMax: 315,
      enabled: true,
    });
    repo.create({
      id: 'bench',
      label: 'Bench',
      category: 'upper',
      trainingMax: 225,
      enabled: true,
    });
    expect(repo.list()).toHaveLength(2);
  });
});
