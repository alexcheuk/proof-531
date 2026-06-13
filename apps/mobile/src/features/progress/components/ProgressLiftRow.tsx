import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import type { LiftProgression } from '@/data/queries/useLiftProgression';
import { ProgressGridCell, type ProgressGridCellProps } from '@/design/primitives/ProgressGridCell';
import { ProgressGridRow } from '@/design/primitives/ProgressGridRow';
import { TmCell } from '@/design/primitives/TmCell';
import { tmAdjustmentSuggestion } from '@/domain/progression';
import type { Lift } from '@/domain/types';
import { GoalRuleRow } from './GoalRuleRow';
import { JustCompletedAnimator } from './JustCompletedAnimator';

type ProgressLiftRowProps = {
  /** Lift owning this row — needed to band-classify TM-test cells. */
  lift: Lift;
  /** Display unit — passed to `tmAdjustmentSuggestion` for TM-test cells. */
  unit: 'lbs' | 'kg';
  row: LiftProgression['rows'][number];
  unitGlyph: 'lb' | 'kg';
  onPastCellPress: (sessionId: number) => void;
  /**
   * Opens the read-only DayPreviewSheet for a now / future / past-empty cell
   * (cells with no completed session and therefore no receipt to route to).
   * Past + completed cells keep their existing `onPastCellPress` → full
   * receipt navigation.
   */
  onPreviewCellPress: (cycle: number, day: 1 | 2 | 3 | 4) => void;
  goalCycle: number | null;
  draftKind: LiftGoalKind;
  draftValue: number;
  draftTargetTm: number;
  // matched cell gets wrapped in JustCompletedAnimator; undefined wraps nothing
  justCompletedSessionId?: number | undefined;
};

export function ProgressLiftRow({
  lift,
  unit,
  row,
  unitGlyph,
  onPastCellPress,
  onPreviewCellPress,
  goalCycle,
  draftKind,
  draftValue,
  draftTargetTm,
  justCompletedSessionId,
}: ProgressLiftRowProps) {
  const placeRuleAbove = goalCycle === row.cycle;
  return (
    <>
      {placeRuleAbove ? (
        <GoalRuleRow
          kind={draftKind}
          value={draftValue}
          targetTm={draftTargetTm}
          unitGlyph={unitGlyph}
          testID={`progress-goal-rule-${row.cycle}`}
        />
      ) : null}
      <ProgressGridRow
        cycle={row.cycle}
        state={row.isCurrent ? 'current' : row.isPast ? 'past' : 'future'}
        testID={`progress-row-${row.cycle}`}
      >
        {row.cells.map((cell) => {
          if (cell.kind === 'now') {
            return (
              <ProgressGridCell
                key={`cell-${row.cycle}-${cell.day}`}
                variant="now"
                weight={cell.prescribedWeight}
                onPress={() => onPreviewCellPress(row.cycle, cell.day)}
                accessibilityLabel={`Cycle ${row.cycle}, day ${cell.day}: next, prescribed ${cell.prescribedWeight} ${unitGlyph}. Tap to preview`}
                testID={`progress-cell-${row.cycle}-${cell.day}`}
              />
            );
          }
          if (cell.kind === 'future') {
            return (
              <ProgressGridCell
                key={`cell-${row.cycle}-${cell.day}`}
                variant="future"
                weight={cell.projectedWeight}
                marker={cell.deload ? '─' : null}
                onPress={() => onPreviewCellPress(row.cycle, cell.day)}
                accessibilityLabel={`Cycle ${row.cycle}, day ${cell.day}: projected ${cell.projectedWeight} ${unitGlyph}. Tap to preview`}
                testID={`progress-cell-${row.cycle}-${cell.day}`}
              />
            );
          }
          const variant = cell.kind === 'last-done' ? 'outlined' : 'past';
          // Marker derivation. Three cases on the deload column:
          //   1. TM-test session → band glyph (↑ / = / ↓) from rep count.
          //   2. Legacy 'working' deload (pre-migration) → existing ✓.
          //   3. Non-deload day → no marker (rep count or weight only).
          const tmTestBand =
            cell.topSetKind === 'tm-test' ? tmAdjustmentSuggestion(cell.topReps, lift, unit) : null;
          const marker: '✓' | '↑' | '↓' | '=' | '─' | null = tmTestBand
            ? tmTestBand.kind === 'increment'
              ? '↑'
              : tmTestBand.kind === 'hold'
                ? '='
                : '↓'
            : cell.deload
              ? '✓'
              : null;
          const a11yPrefix = cell.kind === 'last-done' ? 'Most recent. ' : '';
          const a11ySuffix = cell.amrap
            ? ` for ${cell.topReps} reps`
            : tmTestBand
              ? `, TM test ${cell.topReps} reps, suggests ${tmTestBand.kind}`
              : cell.deload
                ? ' deload logged'
                : '';
          const cellKey = `progress-cell-${row.cycle}-${cell.day}`;
          // Single source for the cell props so the two render paths (plain,
          // or wrapped in JustCompletedAnimator for the just-closed session)
          // can never drift apart.
          const cellProps: ProgressGridCellProps = {
            variant,
            weight: cell.topWeight,
            reps: cell.amrap || tmTestBand ? cell.topReps : null,
            marker,
            onPress: () => onPastCellPress(cell.sessionId),
            accessibilityLabel: `${a11yPrefix}Cycle ${row.cycle}, day ${cell.day}: top set ${cell.topWeight} ${unitGlyph}${a11ySuffix}`,
            testID: cellKey,
          };
          return justCompletedSessionId === cell.sessionId ? (
            <JustCompletedAnimator key={`${cellKey}-anim-${cell.sessionId}`}>
              <ProgressGridCell {...cellProps} />
            </JustCompletedAnimator>
          ) : (
            <ProgressGridCell key={cellKey} {...cellProps} />
          );
        })}
        <TmCell
          tm={row.tm}
          variant={row.isCurrent ? 'current' : row.isPast ? 'past' : 'future'}
          accessibilityLabel={`Cycle ${row.cycle} training max ${row.tm} ${unitGlyph}`}
          testID={`progress-tm-${row.cycle}`}
        />
      </ProgressGridRow>
    </>
  );
}
