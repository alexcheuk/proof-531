import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { ColorToken } from '@/design/tokens';
import type { Week } from '@/domain/types';
import { View, type ViewStyle } from 'react-native';

type Cell = { w: Week; scheme: string; compact?: boolean };

const CELLS: readonly Cell[] = [
  { w: 1, scheme: '5·5·5+' },
  { w: 2, scheme: '3·3·3+' },
  { w: 3, scheme: '5·3·1+' },
  { w: 4, scheme: 'TM TEST', compact: true },
];

type CycleStripProps = {
  currentWeek: Week;
};

export function CycleStrip({ currentWeek }: CycleStripProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ marginTop: spacing.lg }} testID="cycle-strip">
      <CapsLabel style={{ marginBottom: spacing.sm }}>THIS CYCLE</CapsLabel>
      <Row style={{ borderWidth: 1, borderColor: colors.lineStrong }} align="stretch">
        {CELLS.map((c, i) => {
          const isNext = c.w === currentWeek;
          const isDone = c.w < currentWeek;
          const cellStyle: ViewStyle = {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 6,
            gap: 4,
            backgroundColor: isDone ? colors.ink0 : 'transparent',
            borderLeftWidth: i > 0 ? 1 : 0,
            borderLeftColor: colors.line,
            position: 'relative',
          };

          const schemeColorToken: ColorToken = isDone ? 'bg0' : isNext ? 'ink0' : 'ink3';

          return (
            <View key={c.w} style={cellStyle} testID={`cycle-strip-cell-${c.w}`}>
              <CapsLabel size="xs" weight="semibold" color={isDone ? 'paperMuted' : 'ink3'}>
                {`D${c.w}`}
              </CapsLabel>
              {c.compact ? (
                <Text
                  variant="mono"
                  weight="semibold"
                  size={10}
                  color={schemeColorToken}
                  style={{ letterSpacing: 1.8, textTransform: 'uppercase' }}
                >
                  {c.scheme}
                </Text>
              ) : (
                <Text
                  variant="mono"
                  weight="bold"
                  size={12}
                  color={schemeColorToken}
                  style={{ letterSpacing: 0.24, opacity: isDone || isNext ? 1 : 0.7 }}
                >
                  {c.scheme}
                </Text>
              )}
              {isDone ? (
                <Text
                  variant="mono"
                  weight="regular"
                  size={9}
                  color="bg0"
                  style={{ position: 'absolute', top: 2, right: 4 }}
                >
                  ✓
                </Text>
              ) : null}
              {isNext ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    right: 2,
                    bottom: 2,
                    borderWidth: 3,
                    borderColor: colors.amber,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </Row>
    </View>
  );
}
