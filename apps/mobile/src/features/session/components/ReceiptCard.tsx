import { SectionBand } from '@/design/primitives/SectionBand';
import { useTheme } from '@/design/theme';
import { BBB_REPS } from '@/domain/bbb';
import { formatWeight } from '@/domain/units';
import { Text as RNText, type TextStyle, View } from 'react-native';
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

/**
 * "The record" — receipt rows summarising the just-filed session.
 *
 * Pure presentational; the parent screen does the math. The BBB row is
 * conditional — when the user took the "Skip · close the day" path on
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
}: ReceiptCardProps) {
  const { colors, layout, type } = useTheme();
  const sectionHeader: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: 8,
  };

  return (
    <View style={{ paddingTop: 24, paddingHorizontal: layout.gutter }}>
      <RNText style={sectionHeader}>The record</RNText>

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
