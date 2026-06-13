import { CapsLabel } from '@/design/primitives/CapsLabel';
import { SectionBand } from '@/design/primitives/SectionBand';
import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { View } from 'react-native';
import { ReceiptRow } from './ReceiptRow';

export type TmTestReceiptBandProps = {
  /** TM at test time, in display units. Same as the bar weight (100% TM). */
  tmDisplay: number;
  /** Actual reps logged. 0 is valid (a missed attempt). */
  reps: number;
  unitGlyph: 'lb' | 'kg';
  /** Whether the elapsed timer is ready to display (mirrors ReceiptCard's contract). */
  elapsedReady: boolean;
  elapsedValue: string;
};

// No volume/BBB/e1RM rows: TM test week hard-skips BBB and a TM test doesn't produce an e1RM PR.
// Separate component (not a ReceiptCard variant) so neither knows the other's row set.
export function TmTestReceiptBand({
  tmDisplay,
  reps,
  unitGlyph,
  elapsedReady,
  elapsedValue,
}: TmTestReceiptBandProps) {
  const { layout } = useTheme();

  return (
    <View
      style={{ paddingTop: 24, paddingHorizontal: layout.gutter }}
      testID="session-complete-tm-test-receipt"
    >
      <CapsLabel weight="semibold" style={{ marginBottom: 8 }}>
        The record
      </CapsLabel>

      <SectionBand testID="session-complete-tm-test-band" tone="strong" padding="none">
        <ReceiptRow
          testID="receipt-tm-test"
          first
          label="TM test"
          value={`${formatWeight(tmDisplay)} × ${reps}`}
          sub={unitGlyph}
        />
        {elapsedReady ? (
          <ReceiptRow
            testID="receipt-tm-test-elapsed"
            label="Elapsed"
            value={elapsedValue}
            sub="minutes"
          />
        ) : null}
      </SectionBand>
    </View>
  );
}
