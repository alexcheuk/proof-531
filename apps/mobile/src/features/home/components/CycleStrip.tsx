import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { ColorToken } from '@/design/tokens';
import type { Week } from '@/domain/types';
import * as Haptics from 'expo-haptics';
import { Pressable, View, type ViewStyle } from 'react-native';

type Cell = { w: Week; scheme: string; compact?: boolean };

const CELLS: readonly Cell[] = [
  { w: 1, scheme: '5·5·5+' },
  { w: 2, scheme: '3·3·3+' },
  { w: 3, scheme: '5·3·1+' },
  { w: 4, scheme: 'TM TEST', compact: true },
];

type CycleStripProps = {
  currentDay: Week;
  /**
   * When supplied, each cell becomes a Pressable button that opens the
   * DayPreviewSheet for that day of the current cycle. Omitting it keeps the
   * strip as inert decoration (no behavior change for callers that don't wire
   * the preview).
   */
  onCellPress?: (day: Week) => void;
};

export function CycleStrip({ currentDay, onCellPress }: CycleStripProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ marginTop: spacing.lg }} testID="cycle-strip">
      <CapsLabel style={{ marginBottom: spacing.sm }}>THIS CYCLE</CapsLabel>
      <Row style={{ borderWidth: 1, borderColor: colors.lineStrong }} align="stretch">
        {CELLS.map((c, i) => {
          const isNext = c.w === currentDay;
          const isDone = c.w < currentDay;
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

          const doneSuffix = isDone ? ', completed' : isNext ? ', current day' : '';
          const a11yLabel = `Preview week ${c.w} day, ${c.scheme}${doneSuffix}`;
          const handlePress = onCellPress
            ? () => {
                void Haptics.selectionAsync();
                onCellPress(c.w);
              }
            : undefined;

          const cellBody = (
            <>
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
            </>
          );

          if (handlePress) {
            return (
              <Pressable
                key={c.w}
                onPress={handlePress}
                style={cellStyle}
                testID={`cycle-strip-cell-${c.w}`}
                accessibilityRole="button"
                accessibilityLabel={a11yLabel}
                hitSlop={{ top: 8, bottom: 8, left: 0, right: 0 }}
              >
                {cellBody}
              </Pressable>
            );
          }

          return (
            <View key={c.w} style={cellStyle} testID={`cycle-strip-cell-${c.w}`}>
              {cellBody}
            </View>
          );
        })}
      </Row>
    </View>
  );
}
