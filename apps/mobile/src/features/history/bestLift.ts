import type { Lift, Unit } from '@/domain/types';
import { convert, displayUnit } from '@/domain/units';

export type PrRow = {
  lift: string;
  bestE1RM: number;
  achievedAt: number;
};

export type BestLift = {
  lift: Lift;
  /** Rounded e1RM in the display unit. */
  e1RMDisplay: number;
  /** Unit glyph (`lb`/`kg`). */
  unitGlyph: 'lb' | 'kg';
};

export function pickBestLift(
  prs: ReadonlyArray<PrRow>,
  storageUnit: Unit,
  displayUnitParam: Unit,
): BestLift | null {
  if (prs.length === 0) return null;
  let best: PrRow | null = null;
  for (const p of prs) {
    if (best === null) {
      best = p;
      continue;
    }
    if (p.bestE1RM > best.bestE1RM) {
      best = p;
    } else if (p.bestE1RM === best.bestE1RM && p.achievedAt < best.achievedAt) {
      // earlier-achieved wins ties so the badge doesn't oscillate when two lifts share the same e1RM
      best = p;
    }
  }
  if (!best) return null;
  return {
    lift: best.lift as Lift,
    e1RMDisplay: convert(best.bestE1RM, storageUnit, displayUnitParam),
    unitGlyph: displayUnit(displayUnitParam),
  };
}
