import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit, trainingMaxFrom } from '@/domain/units';
import { View, type ViewStyle } from 'react-native';
import { LIFT_META } from '../../lifts';

export type TmTableProps = {
  enabledLifts: Lift[];
  computed: Partial<Record<Lift, number>>;
  unit: Unit;
};

/**
 * The "Training maxes" four-column table on the onboarding Review step.
 * Header row + one row per enabled lift + a trailing "all values in …"
 * caption. Pure presentational.
 */
export function TmTable({ enabledLifts, computed, unit }: TmTableProps) {
  const { colors } = useTheme();

  const tableStyle: ViewStyle = {
    borderWidth: 1,
    borderColor: colors.ink0,
  };

  const headerStyle: ViewStyle = {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.ink0,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink0,
  };

  return (
    <View>
      <View style={tableStyle} testID="onboarding-tm-table">
        <Row style={headerStyle}>
          <HeaderCell width={24}>№</HeaderCell>
          <HeaderCell flex>Lift</HeaderCell>
          <HeaderCell width={80} right>
            1RM
          </HeaderCell>
          <HeaderCell width={80} right>
            TM (90%)
          </HeaderCell>
        </Row>
        {enabledLifts.map((lift, i) => (
          <TmTableRow
            key={lift}
            lift={lift}
            index={i}
            oneRM={computed[lift] ?? 0}
            unit={unit}
            isLast={i === enabledLifts.length - 1}
          />
        ))}
      </View>
      <CapsLabel size="xs" color="ink3" style={{ marginTop: 8, textAlign: 'right' }}>
        {`all values in ${displayUnit(unit)}`}
      </CapsLabel>
    </View>
  );
}

type TmTableRowProps = {
  lift: Lift;
  index: number;
  oneRM: number;
  unit: Unit;
  isLast: boolean;
};

function TmTableRow({ lift, index, oneRM, unit, isLast }: TmTableRowProps) {
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

type HeaderCellProps = {
  children: string;
  width?: number;
  flex?: boolean;
  right?: boolean;
};

function HeaderCell({ children, width, flex, right }: HeaderCellProps) {
  const cellStyle: ViewStyle = {
    ...(width ? { width } : {}),
    ...(flex ? { flex: 1 } : {}),
    ...(right ? { alignItems: 'flex-end' } : {}),
  };
  return (
    <View style={cellStyle}>
      <CapsLabel size="xs" weight="bold" color="bg0">
        {children}
      </CapsLabel>
    </View>
  );
}
