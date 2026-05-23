import { Fragment } from 'react';
import { Text as RNText, type StyleProp, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Monochrome side-view barbell visualization (LEDGER plate-v3).
 *
 * Pure-presentational. The caller passes a precomputed `perSide`
 * decomposition (heaviest plate first). Plates stamp their weight number
 * (rotated -90°) when they're tall enough to read.
 *
 * Two variants:
 *   - default (full): bar+collars+plates row + a hairline "PER SIDE" row
 *     showing grouped plates and their per-side total.
 *   - `mini`: same row at smaller dimensions, no PER SIDE row.
 *
 * Ported from PWA `src/components/plate-bar.tsx`.
 */

export type PlateBarProps = {
  /** Plates per side, heaviest first (greedy decomposition order). */
  perSide: readonly number[];
  /** Glyph used in caption + accessibility label ("lb" or "kg"). */
  unitGlyph: string;
  /** Total weight on the bar (for accessibility label). */
  weight: number;
  /** Use the smaller dimensions / no caption. */
  mini?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/** Plate-size ramp. Width of "kg" set ramp is anchored at 1.25 → 25;
 *  "lb" at 2.5 → 45. Anything outside the unit is treated as lb. */
function sizeFor(plate: number, unitGlyph: string): number {
  const isKg = unitGlyph === 'kg';
  const max = isKg ? 25 : 45;
  const min = isKg ? 1.25 : 2.5;
  const t = Math.max(0, Math.min(1, (plate - min) / (max - min)));
  return 0.36 + t * 0.64;
}

type Group = { weight: number; count: number };

function groupPlates(perSide: readonly number[]): Group[] {
  const grouped: Group[] = [];
  for (const p of perSide) {
    const last = grouped[grouped.length - 1];
    if (last && last.weight === p) last.count += 1;
    else grouped.push({ weight: p, count: 1 });
  }
  return grouped;
}

export function PlateBar({
  perSide,
  unitGlyph,
  weight,
  mini = false,
  testID,
  style,
}: PlateBarProps) {
  const { colors } = useTheme();

  const H = mini ? 64 : 96;
  const plateW = mini ? 9 : 12;
  const sleeveH = 2;
  const barMidW = mini ? 32 : 48;
  const collarH = H * 0.32;
  const hasPlates = perSide.length > 0;

  const perSideTotal = perSide.reduce((sum, p) => sum + p, 0);
  const accessibilityLabel = hasPlates
    ? `${weight} ${unitGlyph} loaded — bar plus ${perSideTotal} ${unitGlyph} per side`
    : `${weight} ${unitGlyph} loaded — bar only`;

  const grouped = groupPlates(perSide);

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: mini ? 6 : 10,
  };

  const barRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: H,
  };

  // `row-reverse` so the heaviest plate (index 0 of perSide) sits closest
  // to the bar on the LEFT side. The RIGHT side uses plain `row`.
  const leftStackStyle: ViewStyle = {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 1,
  };
  const rightStackStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  };

  const collarBase: ViewStyle = {
    width: 3,
    height: collarH,
    backgroundColor: colors.ink0,
  };

  const barMidStyle: ViewStyle = {
    width: barMidW,
    height: sleeveH,
    backgroundColor: colors.ink0,
  };

  const perSideRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  };
  const perSideLabelStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 2.2, // 0.22em × 10
    color: colors.ink2,
    textTransform: 'uppercase',
  };
  const perSideValueRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  };
  const groupedNumStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 13,
    lineHeight: 14,
    letterSpacing: -0.13,
    color: colors.ink0,
  };
  const groupedCountStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 11,
    lineHeight: 14,
    color: colors.ink2,
  };
  const plusStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 13,
    lineHeight: 14,
    color: colors.ink3,
  };
  const totalStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Bold',
    fontSize: 13,
    lineHeight: 14,
    color: colors.ink0,
    marginLeft: 4,
  };
  const dashStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 13,
    lineHeight: 14,
    color: colors.ink2,
  };

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[containerStyle, style]}
    >
      <View style={barRowStyle} testID={testID ? `${testID}-row` : undefined}>
        {/* Left plate stack — row-reverse so perSide[0] (heaviest) sits
            closest to the bar. */}
        <View style={leftStackStyle}>
          {perSide.map((p, i) => (
            <PlateRect
              // biome-ignore lint/suspicious/noArrayIndexKey: positional render of a numeric stack
              key={`l-${i}`}
              weight={p}
              height={H * sizeFor(p, unitGlyph)}
              width={plateW}
              mini={mini}
              ink0={colors.ink0}
              bg0={colors.bg0}
              testID={testID ? `${testID}-plate-l-${i}` : undefined}
            />
          ))}
        </View>

        {hasPlates && (
          <View
            style={[collarBase, { marginLeft: 2 }]}
            testID={testID ? `${testID}-collar-l` : undefined}
          />
        )}

        <View style={barMidStyle} testID={testID ? `${testID}-bar` : undefined} />

        {hasPlates && (
          <View
            style={[collarBase, { marginRight: 2 }]}
            testID={testID ? `${testID}-collar-r` : undefined}
          />
        )}

        <View style={rightStackStyle}>
          {perSide.map((p, i) => (
            <PlateRect
              // biome-ignore lint/suspicious/noArrayIndexKey: positional render of a numeric stack
              key={`r-${i}`}
              weight={p}
              height={H * sizeFor(p, unitGlyph)}
              width={plateW}
              mini={mini}
              ink0={colors.ink0}
              bg0={colors.bg0}
              testID={testID ? `${testID}-plate-r-${i}` : undefined}
            />
          ))}
        </View>
      </View>

      {!mini && (
        <View style={perSideRowStyle} testID={testID ? `${testID}-caption` : undefined}>
          <RNText style={perSideLabelStyle}>PER SIDE</RNText>
          <View style={perSideValueRowStyle}>
            {grouped.length === 0 ? (
              <RNText style={dashStyle}>—</RNText>
            ) : (
              <>
                {grouped.map((g, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional render of a grouped stack
                  <Fragment key={`g-${i}`}>
                    {i > 0 ? <RNText style={plusStyle}>+</RNText> : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {g.count > 1 ? (
                        <RNText style={groupedCountStyle}>{`${g.count}× `}</RNText>
                      ) : null}
                      <RNText style={groupedNumStyle}>{g.weight}</RNText>
                    </View>
                  </Fragment>
                ))}
                <RNText style={totalStyle}>{`= ${perSideTotal} ${unitGlyph}`}</RNText>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function PlateRect({
  weight,
  height,
  width,
  mini,
  ink0,
  bg0,
  testID,
}: {
  weight: number;
  height: number;
  width: number;
  mini: boolean;
  ink0: string;
  bg0: string;
  testID: string | undefined;
}) {
  // Only stamp the weight on plates large enough to read.
  const showLabel = height >= 30 && width >= 10;
  const labelStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Bold',
    fontSize: mini ? 7 : 8,
    lineHeight: mini ? 7 : 8,
    letterSpacing: 0.32,
    color: bg0,
  };
  return (
    <View
      testID={testID}
      style={{
        width,
        height,
        backgroundColor: ink0,
        borderRadius: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {showLabel ? (
        <RNText style={[labelStyle, { transform: [{ rotate: '-90deg' }] }]} numberOfLines={1}>
          {weight}
        </RNText>
      ) : null}
    </View>
  );
}
