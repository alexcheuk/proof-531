import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { SectionBand } from './SectionBand';

/**
 * Three-column "caps label / display value / caps sub" stat readout. The
 * recurring 3-up cell grid used by Home (Last/Best/Cycle), Onboarding
 * (Estimated 1RM / Training max), and Settings (Cycle prescription rows).
 *
 * Wraps a `SectionBand` (default tone, padding 'none') so the band's
 * hairlines and the grid cells stay in lock-step. `divided` toggles vertical
 * hairlines between cells.
 *
 * Ported from PWA `src/components/stat-grid.tsx`.
 */
export type StatCell = {
  label: string;
  /** ReactNode so sites can mix tabular numerics + unit subscripts inline. */
  value: ReactNode;
  sub?: string;
};

export type StatGridProps = {
  cells: readonly [StatCell, StatCell, StatCell];
  divided?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatGrid({ cells, divided = true, testID, style }: StatGridProps) {
  const { colors, type } = useTheme();

  const bandProps = {
    padding: 'none' as const,
    tone: 'default' as const,
    style,
    ...(testID !== undefined ? { testID } : null),
  };

  return (
    <SectionBand {...bandProps}>
      <View style={{ flexDirection: 'row' }}>
        {cells.map((c, i) => {
          const cellStyle: ViewStyle = {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 12,
            ...(divided && i > 0 ? { borderLeftWidth: 1, borderLeftColor: colors.line } : null),
          };

          const isPrimitiveValue = typeof c.value === 'string' || typeof c.value === 'number';
          const cellTestID = testID ? `${testID}-cell-${i}` : undefined;

          return (
            <View
              key={c.label}
              style={cellStyle}
              {...(cellTestID !== undefined ? { testID: cellTestID } : null)}
            >
              <RNText
                style={{
                  fontFamily: `${type.mono}-SemiBold`,
                  fontSize: 9,
                  letterSpacing: 1.98,
                  textTransform: 'uppercase',
                  color: colors.ink2,
                }}
              >
                {c.label}
              </RNText>
              {isPrimitiveValue ? (
                <RNText
                  style={{
                    fontFamily: `${type.sans}-Bold`,
                    fontSize: 22,
                    lineHeight: 22,
                    letterSpacing: -0.66,
                    color: colors.ink0,
                  }}
                >
                  {c.value}
                </RNText>
              ) : (
                <View>{c.value}</View>
              )}
              {c.sub ? (
                <RNText
                  style={{
                    fontFamily: `${type.mono}-Medium`,
                    fontSize: 10,
                    letterSpacing: 1.4,
                    color: colors.ink2,
                  }}
                >
                  {c.sub}
                </RNText>
              ) : null}
            </View>
          );
        })}
      </View>
    </SectionBand>
  );
}
