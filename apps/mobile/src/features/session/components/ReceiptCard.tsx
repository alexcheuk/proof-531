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
};

// BBB row absent when bbbSetsCompleted === 0: the user skipped BBB, so showing zero volume would be a lie.
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
}: ReceiptCardProps) {
  const { layout } = useTheme();

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
      </SectionBand>
    </View>
  );
}
