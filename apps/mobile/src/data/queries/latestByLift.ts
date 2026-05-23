/**
 * Pure utility: collapse an append-only list of TrainingMax rows to the latest
 * row per lift.
 *
 * Mirrors the PWA helper at `~/Development/531-pwa/src/db/latestByLift.ts`.
 * Ordering: primary by `updatedAt` desc; tiebreaker by autoincrement `id` desc
 * (newer rows get larger ids — robust against `Date.now()` collisions in tests
 * and on the same millisecond in production).
 *
 * Shared between the accessor (`getCurrentTrainingMaxes`) and any caller that
 * derives a Map view from the full history so the dedup rule is defined exactly
 * once.
 */
import type { Lift } from '../../domain/types';
import type { TrainingMax } from '../accessors/trainingMax';

export function latestByLift(rows: readonly TrainingMax[]): Map<Lift, TrainingMax> {
  const latest = new Map<Lift, TrainingMax>();
  for (const row of rows) {
    const lift = row.lift as Lift;
    const prev = latest.get(lift);
    const isNewer =
      !prev ||
      row.updatedAt > prev.updatedAt ||
      (row.updatedAt === prev.updatedAt && (row.id ?? 0) > (prev.id ?? 0));
    if (isNewer) latest.set(lift, row);
  }
  return latest;
}
