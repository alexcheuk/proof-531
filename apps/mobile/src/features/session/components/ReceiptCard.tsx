import { CapsLabel } from '@/design/primitives/CapsLabel';
import { SectionBand } from '@/design/primitives/SectionBand';
import { useTheme } from '@/design/theme';
import { BBB_REPS } from '@/domain/bbb';
import { formatWeight } from '@/domain/units';
import { View } from 'react-native';
import { ReceiptRow } from './ReceiptRow';

export type ReceiptCardProps = {
  topWeight: number;
  topReps: number;
  topIsAmrap: boolean;
  e1RMDisplay: number;
  workingVolume: number;
  elapsedReady: boolean;
  elapsedValue: string;
  unitGlyph: 'lb' | 'kg';
  /** BBB sets the user marked complete (0 when the prompt screen was skipped). */
  bbbSetsCompleted: number;
  /** BBB weight in display units (matches the weight written to set_logs). */
  bbbWeightDisplay: number;
  /** Prescribed minimum reps for the top (AMRAP) set  -  drives the "Matched target." note. */
  prescribedReps: number;
  /** Whether the MissCorrectionCard is shown on this screen  -  the note yields to it. */
  missCardShown: boolean;
};

/**
 * "The record"  -  receipt rows summarising the just-filed session.
 *
 * Pure presentational; the parent screen does the math. The BBB row is
 * conditional  -  when the user took the "Skip · close the day" path on
 * `BbbPromptScreen` no rows are written and the receipt deliberately
 * omits the BBB stat. Counting zero BBB volume as "done" would corrupt
 * the user's training record.
 */
export function ReceiptCard({
  topWeight,
  topReps,
  topIsAmrap,
  e1RMDisplay,
  workingVolume,
  elapsedReady,
  elapsedValue,
  unitGlyph,
  bbbSetsCompleted,
  bbbWeightDisplay,
  prescribedReps,
  missCardShown,
}: ReceiptCardProps) {
  const { layout, spacing } = useTheme();

  // Quiet acknowledgement when the AMRAP top set met its floor exactly, with
  // no surplus (the `Est. 1rm` row owns the surplus story) and no active miss
  // correction (that path owns the under-target story).
  const matchedTarget = topIsAmrap && topReps === prescribedReps && !missCardShown;

  return (
    <View style={{ paddingTop: 24, paddingHorizontal: layout.gutter }}>
      <CapsLabel weight="semibold" style={{ marginBottom: 8 }}>
        The record
      </CapsLabel>

      <SectionBand testID="session-complete-receipt" tone="strong" padding="none">
        <ReceiptRow
          testID="receipt-top"
          first
          label="Top set"
          value={`${formatWeight(topWeight)} × ${topReps}${topIsAmrap ? '+' : ''}`}
          sub={unitGlyph}
        />
        {topIsAmrap ? (
          <ReceiptRow
            testID="receipt-e1rm"
            label="Est. 1rm"
            value={formatWeight(e1RMDisplay)}
            sub={unitGlyph}
          />
        ) : null}
        <ReceiptRow
          testID="receipt-volume"
          label="Volume"
          value={formatWeight(workingVolume)}
          sub={`${unitGlyph} · working sets`}
        />
        {bbbSetsCompleted > 0 ? (
          <ReceiptRow
            testID="receipt-bbb"
            label="BBB"
            value={formatWeight(bbbWeightDisplay)}
            sub={`${unitGlyph} · ${bbbSetsCompleted}×${BBB_REPS}`}
          />
        ) : null}
        {elapsedReady ? (
          <ReceiptRow testID="receipt-elapsed" label="Elapsed" value={elapsedValue} sub="minutes" />
        ) : null}
        {matchedTarget ? (
          <View
            accessible
            accessibilityRole="text"
            accessibilityLabel="Matched target."
            style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }}
            testID="receipt-matched-target"
          >
            <CapsLabel size="xs" color="ink3">
              Matched target.
            </CapsLabel>
          </View>
        ) : null}
      </SectionBand>
    </View>
  );
}
