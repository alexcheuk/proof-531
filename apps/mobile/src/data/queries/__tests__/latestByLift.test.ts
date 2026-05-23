/**
 * Pure-function tests for `latestByLift` — exercises the dedup rule (updatedAt
 * desc, id desc tiebreaker) without touching SQLite.
 */
import type { TrainingMax } from '@/data/accessors/trainingMax';
import { latestByLift } from '@/data/queries/latestByLift';

function row(id: number, lift: TrainingMax['lift'], value: number, updatedAt: number): TrainingMax {
  return { id, lift, value, unit: 'lbs', updatedAt, note: null };
}

describe('latestByLift', () => {
  it('returns an empty map for an empty input', () => {
    expect(latestByLift([]).size).toBe(0);
  });

  it('keeps the row with the largest updatedAt per lift', () => {
    const rows: TrainingMax[] = [
      row(1, 'squat', 300, 100),
      row(2, 'squat', 305, 200),
      row(3, 'squat', 310, 150),
    ];
    const map = latestByLift(rows);
    expect(map.size).toBe(1);
    expect(map.get('squat')?.value).toBe(305);
  });

  it('tie-breaks equal updatedAt by larger id', () => {
    const rows: TrainingMax[] = [row(1, 'bench', 200, 100), row(2, 'bench', 205, 100)];
    const map = latestByLift(rows);
    expect(map.get('bench')?.id).toBe(2);
    expect(map.get('bench')?.value).toBe(205);
  });

  it('yields one entry per lift', () => {
    const rows: TrainingMax[] = [
      row(1, 'squat', 300, 100),
      row(2, 'bench', 200, 100),
      row(3, 'deadlift', 400, 100),
      row(4, 'press', 150, 100),
      row(5, 'squat', 310, 200),
    ];
    const map = latestByLift(rows);
    expect(map.size).toBe(4);
    expect(map.get('squat')?.value).toBe(310);
    expect(map.get('bench')?.value).toBe(200);
    expect(map.get('deadlift')?.value).toBe(400);
    expect(map.get('press')?.value).toBe(150);
  });
});
