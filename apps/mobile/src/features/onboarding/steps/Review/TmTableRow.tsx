import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { trainingMaxFrom } from '@/domain/units';
import { View, type ViewStyle } from 'react-native';
import { LIFT_META } from '../../lifts';

export type TmTableRowProps = {
  lift: Lift;
  index: number;
  oneRM: number;
  unit: Unit;
  isLast: boolean;
};

// TM math via trainingMaxFrom so the displayed value matches what appendOnboarding will persist.
export function TmTableRow({ lift, index, oneRM, unit, isLast }: TmTableRowProps) {
  const { colors } = useTheme();
  const tm = trainingMaxFrom(oneRM, unit);
  const rowStyle: ViewStyle = {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: colors.line,
  };
  return (
    <Row align="flex-end" style={rowStyle} testID={`onboarding-tm-row-${lift}`}>
      <View style={{ width: 24 }}>
        <CapsLabel weight="bold" color="ink3">
          {String(index + 1).padStart(2, '0')}
        </CapsLabel>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="sans" weight="semibold" size={15} color="ink0">
          {LIFT_META[lift].label}
        </Text>
      </View>
      <View style={{ width: 80, alignItems: 'flex-end' }}>
        <Text
          variant="sans"
          weight="medium"
          size={16}
          color="ink2"
          numeric
          style={{ letterSpacing: -0.32 }}
        >
          {String(oneRM)}
        </Text>
      </View>
      <View style={{ width: 80, alignItems: 'flex-end' }}>
        <Text
          variant="sans"
          weight="bold"
          size={18}
          color="ink0"
          numeric
          style={{ letterSpacing: -0.45 }}
        >
          {String(tm)}
        </Text>
      </View>
    </Row>
  );
}
