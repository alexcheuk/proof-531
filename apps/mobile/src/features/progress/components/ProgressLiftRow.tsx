import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import type { LiftProgression } from '@/data/queries/useLiftProgression';
import { ProgressGridCell } from '@/design/primitives/ProgressGridCell';
import { ProgressGridRow } from '@/design/primitives/ProgressGridRow';
import { TmCell } from '@/design/primitives/TmCell';
import { GoalRuleRow } from './GoalRuleRow';

type ProgressLiftRowProps = {
  row: LiftProgression['rows'][number];
  unitGlyph: 'lb' | 'kg';
  onPastCellPress: (sessionId: number) => void;
  goalCycle: number | null;
  draftKind: LiftGoalKind;
  draftValue: number;
  draftTargetTm: number;
};

/**
 * One row of the Progress cycle matrix — four day cells + the cycle's TM,
 * with a dashed `GoalRuleRow` above when this cycle is the one whose
 * projected TM first reaches the user's goal.
 *
 * Distinct name from the design-system `Row` primitive: this is a
 * *grid* row composed of grid cells, not a generic flex row.
 */
export function ProgressLiftRow({
  row,
  unitGlyph,
  onPastCellPress,
  goalCycle,
  draftKind,
  draftValue,
  draftTargetTm,
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
                accessibilityLabel={`Cycle ${row.cycle}, day ${cell.day}: now, prescribed ${cell.prescribedWeight} ${unitGlyph}`}
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
                accessibilityLabel={`Cycle ${row.cycle}, day ${cell.day}: projected ${cell.projectedWeight} ${unitGlyph}`}
                testID={`progress-cell-${row.cycle}-${cell.day}`}
              />
            );
          }
          const variant = cell.kind === 'last-done' ? 'outlined' : 'past';
          const marker = cell.deload ? '✓' : null;
          const a11yPrefix = cell.kind === 'last-done' ? 'Most recent. ' : '';
          return (
            <ProgressGridCell
              key={`cell-${row.cycle}-${cell.day}`}
              variant={variant}
              weight={cell.topWeight}
              reps={cell.amrap ? cell.topReps : null}
              marker={marker}
              onPress={() => onPastCellPress(cell.sessionId)}
              accessibilityLabel={`${a11yPrefix}Cycle ${row.cycle}, day ${cell.day}: top set ${cell.topWeight} ${unitGlyph}${cell.amrap ? ` for ${cell.topReps} reps` : cell.deload ? ' deload logged' : ''}`}
              testID={`progress-cell-${row.cycle}-${cell.day}`}
            />
          );
        })}
        <TmCell
          tm={row.tm}
          variant={row.isCurrent ? 'current' : row.isPast ? 'past' : 'future'}
          unitGlyph={unitGlyph}
          accessibilityLabel={`Cycle ${row.cycle} training max ${row.tm} ${unitGlyph}`}
          testID={`progress-tm-${row.cycle}`}
        />
      </ProgressGridRow>
    </>
  );
}
