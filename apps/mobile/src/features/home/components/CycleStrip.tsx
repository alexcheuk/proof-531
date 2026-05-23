import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Week } from '@/domain/types';
/**
 * 4-week ledger grid showing the current cycle's set schemes. Active week
 * inverted (ink-on-paper); past weeks decorated with a corner ✓.
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/CycleStrip.tsx`
 * — that's a CSS grid of 4 cells; here we render a row of 4 flex cells
 * separated by hairline ink dividers, wrapped in a strong-line border.
 *
 * Pure read-only; no haptics, no router.
 */
import { Text as RNText, View, type ViewStyle } from 'react-native';

type Cell = { w: Week; scheme: string; deload?: boolean };

const CELLS: readonly Cell[] = [
  { w: 1, scheme: '5·5·5+' },
  { w: 2, scheme: '3·3·3+' },
  { w: 3, scheme: '5·3·1+' },
  { w: 4, scheme: 'Deload', deload: true },
];

type CycleStripProps = {
  currentWeek: Week;
};

export function CycleStrip({ currentWeek }: CycleStripProps) {
  const { colors, spacing, type } = useTheme();

  const wrapperStyle: ViewStyle = {
    marginTop: spacing.lg,
  };

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.lineStrong,
  };

  return (
    <View style={wrapperStyle} testID="cycle-strip">
      <Text
        variant="mono"
        weight="medium"
        size={10}
        color="ink2"
        style={{
          textTransform: 'uppercase',
          letterSpacing: 2.2,
          marginBottom: spacing.sm,
        }}
      >
        THIS CYCLE
      </Text>
      <View style={gridStyle}>
        {CELLS.map((c, i) => {
          const active = c.w === currentWeek;
          const done = c.w < currentWeek && !active;
          const cellStyle: ViewStyle = {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 6,
            gap: 4,
            backgroundColor: active ? colors.ink0 : 'transparent',
            borderLeftWidth: i > 0 ? 1 : 0,
            borderLeftColor: colors.line,
            position: 'relative',
          };

          // Eyebrow D{w} caps mono.
          const eyebrowColor = active ? 'rgba(231, 227, 214, 0.6)' : colors.ink3;
          // Scheme color: active → bg0; done → ink1; otherwise muted ink3.
          const schemeColor = active ? colors.bg0 : done ? colors.ink1 : colors.ink3;

          return (
            <View key={c.w} style={cellStyle} testID={`cycle-strip-cell-${c.w}`}>
              <RNText
                style={{
                  fontFamily: `${type.mono}-SemiBold`,
                  fontSize: 9,
                  letterSpacing: 1.98,
                  textTransform: 'uppercase',
                  color: eyebrowColor,
                }}
              >
                D{c.w}
              </RNText>
              <RNText
                style={
                  c.deload
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
                        opacity: active || done ? 1 : 0.7,
                      }
                }
              >
                {c.scheme}
              </RNText>
              {done ? (
                <RNText
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 4,
                    fontFamily: `${type.mono}-Regular`,
                    fontSize: 9,
                    color: colors.ink2,
                  }}
                >
                  ✓
                </RNText>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
