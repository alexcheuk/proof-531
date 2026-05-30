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
  const perSideDelta = Math.round(((prescribedWeight - prevWeightStorage) / 2) * 10) / 10;
  if (perSideDelta === 0) return null;
  const unitGlyph = storageUnit === 'kg' ? 'kg' : 'lb';
  const sign = perSideDelta > 0 ? '+' : '';
  return `${sign}${perSideDelta} ${unitGlyph} per side vs set ${setIndex}`;
}
