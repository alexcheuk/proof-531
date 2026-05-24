import { CapsLabel } from '@/design/primitives/CapsLabel';
import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Row } from '@/design/primitives/Row';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';

export type ProjectionChipProps = {
  /** Rounded predicted 1RM in the display unit. */
  predictedE1RM: number;
  /** Display-unit token, used to render the `lb`/`kg` suffix. */
  unit: Unit;
  /**
   * Delta against the user's prior best (rounded ints). `null` when the
   * user has no prior PR — the chip then shows just the predicted 1RM.
   */
  deltaFromBest: number | null;
  /** Current rep count — controls whether the delta is shown at all. */
  reps: number;
  /** True when the predicted 1RM beats the existing PR — shows the PR badge. */
  isPotentialPR: boolean;
  testID?: string;
};

/**
 * Inline e1RM caption + delta chip + PR badge for the AMRAP sheet.
 *
 * Three slots:
 *   - "EST. 1RM 245 lb" (always)
 *   - "↑ +12" or "↓ 3" — only when the user has a prior PR and reps > 0
 *   - PR badge — only when the projection beats the prior PR
 *
 * Pure presentational; the parent owns prediction math.
 */
export function ProjectionChip({
  predictedE1RM,
  unit,
  deltaFromBest,
  reps,
  isPotentialPR,
  testID,
}: ProjectionChipProps) {
  return (
    <Row gap="sm" align="center" {...(testID !== undefined ? { testID } : {})}>
      <CapsLabel
        weight="semibold"
        color={isPotentialPR ? 'ink0' : 'ink1'}
        style={{ letterSpacing: 1.4 }}
      >
        {`EST. 1RM ${predictedE1RM} ${displayUnit(unit)}`}
      </CapsLabel>
      {deltaFromBest !== null && reps > 0 ? (
        <CapsLabel
          weight="semibold"
          color={deltaFromBest >= 0 ? 'ink0' : 'ink3'}
          style={{ letterSpacing: 1.4 }}
          testID="amrap-delta-chip"
        >
          {`${deltaFromBest >= 0 ? '↑ +' : '↓ '}${Math.abs(deltaFromBest)}`}
        </CapsLabel>
      ) : null}
      {isPotentialPR ? <MonoBadge testID="amrap-pr-badge">PR</MonoBadge> : null}
    </Row>
  );
}
