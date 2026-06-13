import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

export type CycleCompleteBandProps = {
  /** 1-based cycle number  -  the one the user just finished. */
  cycle: number;
};

export function CycleCompleteBand({ cycle }: CycleCompleteBandProps) {
  const { colors, spacing, layout } = useTheme();
  const wrap: ViewStyle = {
    paddingVertical: spacing.md,
    paddingHorizontal: layout.gutter,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineStrong,
  };
  return (
    <View style={wrap} testID="session-complete-cycle-band">
      <Row justify="space-between" align="center">
        <CapsLabel weight="semibold" color="ink1" style={{ letterSpacing: 1.8 }}>
          {`★ Cycle ${String(cycle).padStart(2, '0')} · COMPLETE`}
        </CapsLabel>
        <CapsLabel size="xs" color="ink3" style={{ letterSpacing: 1.4 }}>
          {`Cycle ${String(cycle + 1).padStart(2, '0')} starts next`}
        </CapsLabel>
      </Row>
    </View>
  );
}
