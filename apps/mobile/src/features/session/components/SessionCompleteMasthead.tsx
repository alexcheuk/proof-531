import { CapsLabel } from '@/design/primitives/CapsLabel';
import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { ViewStyle } from 'react-native';

// Purpose-built masthead for the session receipt; tighter spacing than the app-wide Masthead.
export function SessionCompleteMasthead() {
  const { layout } = useTheme();

  const wrap: ViewStyle = {
    paddingTop: 54,
    paddingHorizontal: layout.gutter,
    paddingBottom: 14,
  };

  return (
    <Row justify="space-between" style={wrap} testID="session-complete-masthead">
      <Row>
        <Text
          variant="mono"
          weight="bold"
          size={13}
          color="ink0"
          style={{ lineHeight: 13, letterSpacing: 1.82, textTransform: 'uppercase' }}
        >
          531
        </Text>
        <Text variant="mono" weight="bold" size={13} color="ink3">
          .
        </Text>
        <CapsLabel color="ink3" style={{ marginLeft: 10 }}>
          ledger
        </CapsLabel>
      </Row>
      <MonoBadge size="md">Filed</MonoBadge>
    </Row>
  );
}
