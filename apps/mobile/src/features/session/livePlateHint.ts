import { prescription } from '@/domain/schemes';
import type { Unit, Week } from '@/domain/types';
import { round as snapWeight } from '@/domain/units';

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
  // Both weights are plate-snapped, so their half-difference is an exact multiple of
  // 2.5 lb / 1.25 kg per side. Round to 2 decimals (not 1) so a 2.5 kg total jump reads
  // "1.25 kg per side", not a lying "1.3". Trailing zeros strip naturally (15, 7.5).
  const perSideDelta = Math.round(((prescribedWeight - prevWeightStorage) / 2) * 100) / 100;
  if (perSideDelta === 0) return null;
  const unitGlyph = storageUnit === 'kg' ? 'kg' : 'lb';
  const sign = perSideDelta > 0 ? '+' : '';
  return `${sign}${perSideDelta} ${unitGlyph} per side vs set ${setIndex}`;
}
