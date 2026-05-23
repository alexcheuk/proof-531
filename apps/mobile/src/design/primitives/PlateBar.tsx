import { Text as RNText, type StyleProp, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Monochrome side-view barbell visualization (LEDGER plate-v3).
 *
 * Pure-presentational. The caller passes a precomputed `perSide`
 * decomposition (heaviest plate first). This primitive does NOT depend on
 * the domain (`calcPlates` lands later as PC-04) — it just lays out the
 * bar, collars, and plate stacks symmetrically with the heaviest plate
 * closest to the bar on each side.
 *
 * Two variants:
 *   - default (full): bar+collars+plates row + a "PER SIDE …" caption.
 *   - `mini`: same row at smaller dimensions, no caption.
 *
 * No SVG, no Skia — View + flex only. Plate height scales with weight
 * (heavier → taller) using the same 0.36 → 1.0 ramp as the PWA.
 *
 * Ported from PWA `src/components/plate-bar.tsx`. The caption is
 * simplified ("PER SIDE: 2 × 45, 1 × 25") to drop the inline running-sum
 * cluster that the PWA renders.
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

  const captionRowStyle: ViewStyle = {
    paddingTop: 6,
  };
  const captionTextStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 9,
    lineHeight: 9,
    letterSpacing: 1.26, // 0.14em × 9
    color: colors.ink2,
    textTransform: 'uppercase',
  };

  const captionText =
    grouped.length === 0
      ? `PER SIDE: — ${unitGlyph}`
      : `PER SIDE: ${grouped.map((g) => `${g.count} × ${g.weight}`).join(', ')} ${unitGlyph}`;

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
              height={H * sizeFor(p, unitGlyph)}
              width={plateW}
              ink0={colors.ink0}
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
              height={H * sizeFor(p, unitGlyph)}
              width={plateW}
              ink0={colors.ink0}
              testID={testID ? `${testID}-plate-r-${i}` : undefined}
            />
          ))}
        </View>
      </View>

      {!mini && hasPlates && (
        <View style={captionRowStyle} testID={testID ? `${testID}-caption` : undefined}>
          <RNText style={captionTextStyle}>{captionText}</RNText>
        </View>
      )}
    </View>
  );
}

function PlateRect({
  height,
  width,
  ink0,
  testID,
}: {
  height: number;
  width: number;
  ink0: string;
  testID: string | undefined;
}) {
  return (
    <View
      testID={testID}
      style={{
        width,
        height,
        backgroundColor: ink0,
        borderRadius: 1,
      }}
    />
  );
}
