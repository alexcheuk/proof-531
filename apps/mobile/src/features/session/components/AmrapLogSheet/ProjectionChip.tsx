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
  /**
   * True when the predicted 1RM ties (but does not beat) the existing PR.
   * Mutually exclusive with `isPotentialPR` — when both could in principle
   * be true the strict-PR badge wins, so the chip never double-stamps.
   */
  isTiePR?: boolean;
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
  isTiePR = false,
  testID,
}: ProjectionChipProps) {
  // reps = 0 ⇒ no lift ⇒ no estimate. `estimateOneRm` returns 0 here
  // (loop-002 fix), so the predictedE1RM would render `0 lb` — visually
  // noisy and confusing on a fresh sheet open. Show an em-dash placeholder
  // instead so the chip still reserves layout space but doesn't claim a
  // bogus number.
  const hasProjection = reps > 0;
  const e1rmLabel = hasProjection
    ? `${predictedE1RM} ${displayUnit(unit)}`
    : `— ${displayUnit(unit)}`;
  return (
    <Row gap="sm" align="center" {...(testID !== undefined ? { testID } : {})}>
      {/* Discord 1508769102 — projection text needed to be more visible.
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
