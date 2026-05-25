import type { Unit } from './types';
import { round } from './units';

/**
 * Boring But Big — Wendler's supplementary template paired with 5/3/1.
 * 5 sets × 10 reps at 50% of the main lift's training max, same bar,
 * same plates, every set. Centralized here so consumers can't drift on
 * the percent / sets / reps over time.
 */
export const BBB_SETS = 5;
export const BBB_REPS = 10;
export const BBB_PCT_OF_TM = 0.5;

/**
 * Snap the BBB weight into the storage unit's nearest increment so the
 * plate decomposition is physically valid. Centralizes the storage-vs-
 * display awareness — every consumer reads the same number.
 */
export function bbbWeightFromTm(tm: number, storageUnit: Unit): number {
  return round(tm * BBB_PCT_OF_TM, storageUnit);
}
