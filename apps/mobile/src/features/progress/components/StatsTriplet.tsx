import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

export type StatsTripletProps = {
  tm: number;
  /** Best lifetime e1RM in display units. 0/null renders as `—` with no unit suffix. */
  bestE1RM: number | null;
  cycle: number;
  unitGlyph: 'lb' | 'kg';
  testID?: string;
};

export function StatsTriplet({ tm, bestE1RM, cycle, unitGlyph, testID }: StatsTripletProps) {
  const { colors, layout } = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    paddingHorizontal: layout.gutter,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  };

  const e1rmHas = !!bestE1RM && bestE1RM > 0;

  const cells: Array<{ label: string; value: string; suffix: string | null }> = [
    { label: 'Training max', value: String(tm), suffix: unitGlyph },
    {
      label: 'Best e1RM',
      value: e1rmHas ? String(bestE1RM) : '—',
      suffix: e1rmHas ? unitGlyph : null,
    },
    { label: 'Cycle', value: `C${cycle}`, suffix: null },
  ];

  return (
    <View style={containerStyle} testID={testID}>
      {cells.map((c, i) => (
        <View
          key={c.label}
          style={{
            flex: 1,
            paddingVertical: 16,
            paddingLeft: i > 0 ? 14 : 0,
            borderLeftWidth: i > 0 ? 1 : 0,
            borderLeftColor: colors.line,
          }}
        >
          <CapsLabel size="xs" weight="semibold" style={{ marginBottom: 4 }}>
            {c.label}
          </CapsLabel>
          <Text
            variant="sans"
            weight="bold"
            size={26}
            color="ink0"
            numeric
            style={{ letterSpacing: -0.78, lineHeight: 26 }}
          >
            {c.value}
            {c.suffix ? (
              <Text
                variant="mono"
                weight="semibold"
                size={11}
                color="ink3"
                style={{ letterSpacing: 1.98 }}
              >
                {' '}
                {c.suffix}
              </Text>
            ) : null}
          </Text>
        </View>
      ))}
    </View>
  );
}
