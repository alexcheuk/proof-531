import { CapsLabel } from '@/design/primitives/CapsLabel';
import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Row } from '@/design/primitives/Row';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';

export type ProjectionChipProps = {
  predictedE1RM: number;
  unit: Unit;
  // null when user has no prior PR  -  chip shows just the predicted 1RM.
  deltaFromBest: number | null;
  reps: number;
  isPotentialPR: boolean;
  // Mutually exclusive with isPotentialPR  -  strict-PR badge wins when both could apply.
  isTiePR?: boolean;
  testID?: string;
};

export function ProjectionChip({
  predictedE1RM,
  unit,
  deltaFromBest,
  reps,
  isPotentialPR,
  isTiePR = false,
  testID,
}: ProjectionChipProps) {
  // reps = 0 ⇒ no lift ⇒ no estimate. `estimateOneRm` returns 0 here
  // (loop-002 fix), so the predictedE1RM would render `0 lb`  -  visually
  // noisy and confusing on a fresh sheet open. Show an em-dash placeholder
  // instead so the chip still reserves layout space but doesn't claim a
  // bogus number.
  const hasProjection = reps > 0;
  const e1rmLabel = hasProjection
    ? `${predictedE1RM} ${displayUnit(unit)}`
    : ` -  ${displayUnit(unit)}`;
  return (
    <Row gap="sm" align="center" {...(testID !== undefined ? { testID } : {})}>
      {/* Discord 1508769102  -  projection text needed to be more visible.
          Bumped from sm/semibold/ink1 to md/bold/ink0 so the headline number
          actually wins the row. The placeholder dash (reps = 0) stays muted. */}
      <CapsLabel
        size="md"
        weight="bold"
        color={hasProjection ? 'ink0' : 'ink3'}
        style={{ letterSpacing: 1.4 }}
      >
        {`EST. 1RM ${e1rmLabel}`}
      </CapsLabel>
      {deltaFromBest !== null && reps > 0 ? (
        <CapsLabel
          size="md"
          weight="bold"
          color={deltaFromBest >= 0 ? 'ink0' : 'ink3'}
          style={{ letterSpacing: 1.4 }}
          testID="amrap-delta-chip"
        >
          {`${deltaFromBest >= 0 ? '↑ +' : '↓ '}${Math.abs(deltaFromBest)}`}
        </CapsLabel>
      ) : null}
      {isPotentialPR ? (
        <MonoBadge testID="amrap-pr-badge">PR</MonoBadge>
      ) : isTiePR ? (
        <MonoBadge testID="amrap-tie-badge">TIE</MonoBadge>
      ) : null}
    </Row>
  );
}
