import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { View, type ViewStyle } from 'react-native';

export type ResultRowProps = {
  primary: string;
  secondary: string;
  value: number;
  unit: Unit;
  valueSize: number;
  first?: boolean;
};

/** Estimated 1RM / Training max readout row in the OneRmEntry result band. */
export function ResultRow({ primary, secondary, value, unit, valueSize, first }: ResultRowProps) {
  const { colors } = useTheme();

  const rowStyle: ViewStyle = {
    paddingVertical: 14,
    borderTopWidth: first ? 0 : 1,
    borderTopColor: colors.lineFaint,
  };

  return (
    <Row justify="space-between" align="flex-end" gap="md" style={rowStyle}>
      <View style={{ flex: 1 }}>
        <Text variant="sans" weight="semibold" size={15} color="ink0">
          {primary}
        </Text>
        <CapsLabel style={{ marginTop: 4 }}>{secondary}</CapsLabel>
      </View>
      <Row align="baseline" gap="xs">
        <Text
          variant="sans"
          weight="bold"
          size={valueSize}
          color="ink0"
          style={{ letterSpacing: -valueSize * 0.035 }}
        >
          {String(value)}
        </Text>
        <CapsLabel weight="semibold">{displayUnit(unit)}</CapsLabel>
      </Row>
    </Row>
  );
}
