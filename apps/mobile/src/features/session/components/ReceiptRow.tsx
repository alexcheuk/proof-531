import { MonoBadge } from '@/design/primitives/MonoBadge';
import { useTheme } from '@/design/theme';
/**
 * Single line item on the session-complete "receipt".
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * ReceiptRow.tsx`. The PWA renders a flex row with a caps eyebrow label on
 * the left and a numeric cluster on the right; the same shape lifts cleanly
 * to RN.
 *
 *   - `label`  — caps eyebrow on the left (e.g. `Top set`).
 *   - `value`  — the big display string (already formatted, e.g. `255 × 8+`).
 *   - `sub`    — caps mono suffix to the right of the value (e.g. `lb · 85% tm`).
 *   - `stamp`  — optional bordered chip (e.g. `★ PR`); rendered before the value.
 *   - `first`  — drops the row-internal top hairline (the parent rail already
 *                draws its own borderTop on the wrapping `SectionBand`).
 *
 * Pure presentational. Caller decides which rows to render and in what order.
 */
import { Text as RNText, View, type ViewStyle } from 'react-native';

export type ReceiptRowProps = {
  label: string;
  value: string;
  sub: string;
  stamp?: string | null;
  first?: boolean;
  testID?: string;
};

export function ReceiptRow({ label, value, sub, stamp, first = false, testID }: ReceiptRowProps) {
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 14,
    gap: 14,
    borderTopWidth: first ? 0 : 1,
    borderTopColor: colors.line,
  };

  const valueClusterStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  };

  return (
    <View testID={testID} style={containerStyle}>
      <RNText
        style={{
          fontFamily: `${type.mono}-SemiBold`,
          fontSize: 10,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          color: colors.ink2,
        }}
      >
        {label}
      </RNText>
      <View style={valueClusterStyle}>
        {stamp ? <MonoBadge>{stamp}</MonoBadge> : null}
        <RNText
          style={{
            fontFamily: `${type.sans}-Bold`,
            fontSize: 24,
            color: colors.ink0,
            letterSpacing: -0.72,
            lineHeight: 24,
          }}
        >
          {value}
        </RNText>
        <RNText
          style={{
            fontFamily: `${type.mono}-SemiBold`,
            fontSize: 10,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: colors.ink3,
          }}
        >
          {sub}
        </RNText>
      </View>
    </View>
  );
}
