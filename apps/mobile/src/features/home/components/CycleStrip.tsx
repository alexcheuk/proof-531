import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { Week } from '@/domain/types';
/**
 * 4-week ledger grid showing the current cycle's set schemes.
 *
 * Visual contract mirrors the Progress grid:
 *   - Completed weeks (< currentWeek): ink-filled black bg, paper text, ✓ glyph.
 *   - Current/next week (= currentWeek): paper bg + 3-px inset amber accent border.
 *   - Future weeks (> currentWeek): transparent bg, muted text.
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/CycleStrip.tsx`.
 */
import { Text as RNText, View, type ViewStyle } from 'react-native';

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
  const { colors, spacing, type } = useTheme();

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

          const schemeColor = isDone ? colors.bg0 : isNext ? colors.ink0 : colors.ink3;

          return (
            <View key={c.w} style={cellStyle} testID={`cycle-strip-cell-${c.w}`}>
              <CapsLabel size="xs" weight="semibold" color={isDone ? 'paperMuted' : 'ink3'}>
                {`D${c.w}`}
              </CapsLabel>
              <RNText
                style={
                  c.compact
                    ? {
                        fontFamily: `${type.mono}-SemiBold`,
                        fontSize: 10,
                        letterSpacing: 1.8,
                        textTransform: 'uppercase',
                        color: schemeColor,
                      }
                    : {
                        fontFamily: `${type.mono}-Bold`,
                        fontSize: 12,
                        letterSpacing: 0.24,
                        color: schemeColor,
                        opacity: isDone || isNext ? 1 : 0.7,
                      }
                }
              >
                {c.scheme}
              </RNText>
              {isDone ? (
                <RNText
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 4,
                    fontFamily: `${type.mono}-Regular`,
                    fontSize: 9,
                    color: colors.bg0,
                  }}
                >
                  ✓
                </RNText>
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
