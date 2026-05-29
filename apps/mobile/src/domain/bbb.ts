import type { Unit } from './types';
import { round } from './units';

export const BBB_SETS = 5;
export const BBB_REPS = 10;
export const BBB_PCT_OF_TM = 0.5;

export function bbbWeightFromTm(tm: number, storageUnit: Unit): number {
  return round(tm * BBB_PCT_OF_TM, storageUnit);
}
