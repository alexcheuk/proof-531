import type { SetLog } from '@/data/accessors/setLog';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { View } from 'react-native';

export type LoggedRepsBlockProps = {
  /** All set logs for the previewed session (any kind). */
  logs: ReadonlyArray<SetLog>;
  /** Render unit for the prescribed-weight glyph. */
  unit: Unit;
  /** Mirrors the log query's loading flag — shows a placeholder caption. */
  isLoading: boolean;
  /** Mirrors the log query's error flag — shows a "showing plan" caption. */
  isError: boolean;
};

/**
 * Read-only mini-receipt rendered beneath the working-sets band on a
 * completed-past preview. One mono line per logged working/amrap set:
 * `{actualReps} reps @ {prescribedWeight} {unit}` (the AMRAP set reads
 * `{actualReps}+ reps`). Prescription stays the primary read; these are the
 * receipt overlay.
 *
 * No writes, no interaction. Purely presents the `setLogs` rows the parent
 * already fetched via `useSetLogsForSession`.
 */
export function LoggedRepsBlock({ logs, unit, isLoading, isError }: LoggedRepsBlockProps) {
  const { layout, spacing } = useTheme();
  const unitGlyph = displayUnit(unit);

  const containerStyle = {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
  };

  if (isLoading) {
    return (
      <View style={containerStyle} testID="day-preview-logged-loading">
        <CapsLabel size="xs" color="ink3">
          LOADING LOGGED REPS …
        </CapsLabel>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={containerStyle} testID="day-preview-logged-error">
        <CapsLabel size="xs" color="ink2">
          COULDN'T LOAD LOGGED REPS · SHOWING PLAN
        </CapsLabel>
      </View>
    );
  }

  // Only the AMRAP / working top sets form the mini-receipt; warmups and BBB
  // rows are intentionally excluded (the prescription ladder already covers
  // the working scheme — these numbers are the receipt for it).
  const receiptRows = logs.filter((l) => l.kind === 'working' || l.kind === 'amrap');

  if (receiptRows.length === 0) {
    return (
      <View style={containerStyle} testID="day-preview-logged-empty">
        <CapsLabel size="xs" color="ink3">
          NO LOGGED SETS FOR THIS DAY
        </CapsLabel>
      </View>
    );
  }

  return (
    <View style={containerStyle} testID="day-preview-logged">
      <CapsLabel style={{ marginBottom: spacing.sm }}>LOGGED</CapsLabel>
      <View style={{ gap: spacing.xs }}>
        {receiptRows.map((row) => {
          const repsLabel =
            row.kind === 'amrap' ? `${row.actualReps}+ reps` : `${row.actualReps} reps`;
          return (
            <Text
              key={`logged-${row.id}`}
              variant="mono"
              weight="medium"
              size={13}
              color="ink1"
              numeric
              testID={`day-preview-logged-row-${row.index}`}
            >
              {`${repsLabel} @ ${row.prescribedWeight} ${unitGlyph}`}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
