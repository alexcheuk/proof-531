import { SectionBand } from '@/design/primitives/SectionBand';
import { useTheme } from '@/design/theme';
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
};

/**
 * "The record" — receipt rows summarising the just-filed session.
 *
 * Pure presentational; the parent screen does the math.
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
          value={`${topWeight} × ${topReps}${topIsAmrap ? '+' : ''}`}
          sub={unitGlyph}
        />
        {topIsAmrap ? (
          <ReceiptRow
            testID="receipt-e1rm"
            label="Est. 1rm"
            value={`${e1RMDisplay}`}
            sub={unitGlyph}
          />
        ) : null}
        <ReceiptRow
          testID="receipt-volume"
          label="Volume"
          value={`${workingVolume.toLocaleString()}`}
          sub={`${unitGlyph} · working sets`}
        />
        {elapsedReady ? (
          <ReceiptRow testID="receipt-elapsed" label="Elapsed" value={elapsedValue} sub="minutes" />
        ) : null}
      </SectionBand>
    </View>
  );
}
