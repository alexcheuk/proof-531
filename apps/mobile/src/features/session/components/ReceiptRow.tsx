import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Heading } from '@/design/primitives/Heading';
import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { View } from 'react-native';
/**
 * Single line item on the session-complete "receipt".
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * ReceiptRow.tsx`. Caps eyebrow on the left, numeric cluster on the right.
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
import type { ViewStyle } from 'react-native';

export type ReceiptRowProps = {
  label: string;
  value: string;
  sub: string;
  stamp?: string | null;
  first?: boolean;
  testID?: string;
};

export function ReceiptRow({ label, value, sub, stamp, first = false, testID }: ReceiptRowProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    paddingVertical: 14,
    borderTopWidth: first ? 0 : 1,
    borderTopColor: colors.line,
  };

  // Compose a single a11y label so a screen reader reads the row as
  // "Top set: 255 × 8+, lb · working sets, star PR" instead of scrubbing
  // through the three Text nodes individually. Same pattern as SetRow
  // (loop-013). View is the a11y handle; the Row keeps its layout role
  // and the existing testID for behavioural assertions.
  const a11yLabel = [label, value, sub, ...(stamp ? [stamp] : [])].join(', ');

  return (
    <View accessible accessibilityLabel={a11yLabel}>
      <Row
        align="baseline"
        justify="space-between"
        gap="md"
        style={containerStyle}
        {...(testID !== undefined ? { testID } : {})}
      >
        <CapsLabel weight="semibold">{label}</CapsLabel>
        <Row align="baseline" gap="sm">
          {stamp ? <MonoBadge>{stamp}</MonoBadge> : null}
          <Heading size="m" lineHeight={24} numeric>
            {value}
          </Heading>
          <CapsLabel weight="semibold" color="ink3" style={{ letterSpacing: 1.4 }}>
            {sub}
          </CapsLabel>
        </Row>
      </Row>
    </View>
  );
}
