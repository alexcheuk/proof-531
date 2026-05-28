/**
 * Three-cell stat readout shown below the TopSetBlock on Home.
 *
 *   TM       — current training max, in display unit
 *   BEST e1RM — best estimated 1RM from a logged AMRAP (em-dash when none)
 *   CYCLE     — rolling cycle number from settings
 *
 * Ported from `the PWA reference`,
 * adjusted to the cell labels documented in `docs/superpowers/plans/PE-03-home`
 * (the PWA shows "Last / Best / Cycle"; the RN port shows
 * "TM / BEST e1RM / CYCLE" until the Last-session-stats backing query lands).
 */
import { StatGrid } from '@/design/primitives/StatGrid';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';

type LiftStatsProps = {
  tmValue: number;
  tmUnit: Unit;
  bestE1RM: number | null;
  cycle: number;
};

export function LiftStats({ tmValue, tmUnit, bestE1RM, cycle }: LiftStatsProps) {
  return (
    <StatGrid
      testID="lift-stats"
      cells={[
        {
          label: 'TM',
          value: `${tmValue} ${displayUnit(tmUnit)}`,
        },
        {
          label: 'BEST e1RM',
          value: bestE1RM != null ? String(Math.round(bestE1RM)) : '—',
        },
        {
          label: 'CYCLE',
          value: String(cycle),
          sub: 'rolling',
        },
      ]}
    />
  );
}
