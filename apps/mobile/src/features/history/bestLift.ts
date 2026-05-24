/**
 * Pure helper: pick the heaviest PR from the user's `prs` rows.
 *
 * Returns null when no PRs exist yet. When two lifts tie on `bestE1RM`
 * (e.g. early in a cycle when the values are still small integers),
 * the earlier-achieved one wins so the badge doesn't oscillate as new
 * PRs arrive at the same magnitude.
 */
import type { Lift, Unit } from '@/domain/types';
import { convertWeight, displayUnit } from '@/domain/units';

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
      // tie-break by earlier achievement
      best = p;
    }
  }
  if (!best) return null;
  return {
    lift: best.lift as Lift,
    e1RMDisplay: Math.round(convertWeight(best.bestE1RM, storageUnit, displayUnitParam)),
    unitGlyph: displayUnit(displayUnitParam),
  };
}
