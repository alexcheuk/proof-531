import { decompose } from '@/domain/plates';
import { type WorkingSet, prescription, tmTestSet } from '@/domain/schemes';
import type { PlateSet, Unit, Week } from '@/domain/types';
import { convert, round } from '@/domain/units';
import { useMemo } from 'react';

export type UseLiftPageStateOptions = {
  week: Week;
  storageUnit: Unit;
  displayUnit: Unit;
  plateSet: PlateSet;
  tm: number | null;
};

export type UseLiftPageStateResult =
  | { empty: true }
  | {
      empty: false;
      topSet: WorkingSet;
      topWeight: number;
      tmDisplay: number;
      perSide: ReturnType<typeof decompose>['perSide'];
    };

export function useLiftPageState({
  week,
  storageUnit,
  displayUnit,
  plateSet,
  tm,
}: UseLiftPageStateOptions): UseLiftPageStateResult {
  return useMemo<UseLiftPageStateResult>(() => {
    const topSet = week === 4 ? tmTestSet() : prescription(week)[2];
    if (tm == null || topSet == null) return { empty: true };

    // Snap in storage units, then convert for render  -  keeps the snap to
    // the storage step (5 lb / 2.5 kg of the underlying TM row) while the
    // user sees the number in whichever unit Settings currently picks.
    const topWeightStorage = round(tm * topSet.pct, storageUnit);
    const topWeight = convert(topWeightStorage, storageUnit, displayUnit);
    const tmDisplay = convert(tm, storageUnit, displayUnit);
    const decomposed = decompose(topWeight, plateSet);

    return {
      empty: false,
      topSet,
      topWeight,
      tmDisplay,
      perSide: decomposed.perSide,
    };
  }, [week, storageUnit, displayUnit, plateSet, tm]);
}
