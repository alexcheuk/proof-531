import { prescription } from '@/domain/schemes';
import type { Unit, Week } from '@/domain/types';
import { round as snapWeight } from '@/domain/units';

/**
 * Pure derivation: how much weight (per side, in storage unit) the user
 * needs to add or strip vs the previous set. Returns the caption string
 * the LiveScreen shows under the PlateBar — or `null` on set 1 / when the
 * delta rounds to zero.
 *
 * Kept in feature-scope (not domain/) because it composes a domain helper
 * with display-time copy.
 */
export function derivePlateChangeHint(params: {
  week: Week;
  setIndex: 0 | 1 | 2;
  trainingMaxSnapshot: number;
  storageUnit: Unit;
  prescribedWeight: number;
}): string | null {
  const { week, setIndex, trainingMaxSnapshot, storageUnit, prescribedWeight } = params;
  if (setIndex === 0) return null;
  const weekTuple = prescription(week);
  const prevSet = weekTuple[(setIndex - 1) as 0 | 1 | 2];
  if (!prevSet) return null;
  const prevWeightStorage = snapWeight(trainingMaxSnapshot * prevSet.pct, storageUnit);
  const perSideDelta = Math.round(((prescribedWeight - prevWeightStorage) / 2) * 10) / 10;
  if (perSideDelta === 0) return null;
  const unitGlyph = storageUnit === 'kg' ? 'kg' : 'lb';
  const sign = perSideDelta > 0 ? '+' : '';
  return `${sign}${perSideDelta} ${unitGlyph} per side vs set ${setIndex}`;
}
