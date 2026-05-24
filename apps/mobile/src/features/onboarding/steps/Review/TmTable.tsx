import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { View, type ViewStyle } from 'react-native';
import { TmTableHeaderCell } from './TmTableHeaderCell';
import { TmTableRow } from './TmTableRow';

export type TmTableProps = {
  enabledLifts: Lift[];
  computed: Partial<Record<Lift, number>>;
  unit: Unit;
};

/**
 * The "Training maxes" four-column table on the onboarding Review step.
 * Header row + one row per enabled lift + a trailing "all values in …"
 * caption. Pure presentational composition shell — see TmTableRow /
 * TmTableHeaderCell for the cell rendering.
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
          <TmTableHeaderCell width={24}>№</TmTableHeaderCell>
          <TmTableHeaderCell flex>Lift</TmTableHeaderCell>
          <TmTableHeaderCell width={80} right>
            1RM
          </TmTableHeaderCell>
          <TmTableHeaderCell width={80} right>
            TM (90%)
          </TmTableHeaderCell>
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
