import { SectionBand } from '@/design/primitives/SectionBand';
import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { Text as RNText, type TextStyle, View } from 'react-native';
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

/**
 * Week-4 Session Complete receipt — a trimmed `ReceiptCard` variant for TM
 * test sessions:
 *
 *   The record
 *   ─────────────
 *   TM test            225 lb × 5
 *   Elapsed            14:22 minutes
 *
 * No working-volume row (the test set is the work), no BBB row (BBB is
 * hard-skipped on week 4), no e1RM row (a TM test does not produce an
 * e1RM PR — bounded by definition).
 *
 * Implemented as its own component rather than a `kind` variant of
 * `ReceiptCard` so neither receipt has to know about the other's row set
 * — keeps each card's responsibility coherent. (The spec considered a
 * `kind: 'standard' | 'tm-test'` prop on `ReceiptCard`; preferring two
 * components per the design-system rule of "no boolean-prop proliferation
 * on a primitive when the variants share little besides their chrome".)
 */
export function TmTestReceiptBand({
  tmDisplay,
  reps,
  unitGlyph,
  elapsedReady,
  elapsedValue,
}: TmTestReceiptBandProps) {
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
    <View
      style={{ paddingTop: 24, paddingHorizontal: layout.gutter }}
      testID="session-complete-tm-test-receipt"
    >
      <RNText style={sectionHeader}>The record</RNText>

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
