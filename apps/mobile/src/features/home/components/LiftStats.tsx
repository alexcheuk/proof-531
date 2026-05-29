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
  const unitLabel = displayUnit(tmUnit);
  return (
    <StatGrid
      testID="lift-stats"
      cells={[
        {
          label: 'TM',
          value: `${tmValue} ${unitLabel}`,
        },
        {
          label: 'BEST e1RM',
          value: bestE1RM != null ? `${bestE1RM} ${unitLabel}` : '—',
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
