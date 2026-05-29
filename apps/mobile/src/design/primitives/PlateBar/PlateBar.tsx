import { type StyleProp, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { PerSideCaption } from './PerSideCaption';
import { PlateRect } from './PlateRect';
import { groupPlates, sizeFor } from './plateMath';

// Pure-presentational — plate-size ramp and grouping rules live in ./plateMath.ts for independent unit-testing.
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
  const plateW = mini ? 9 : 16;
  const sleeveH = 4;
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

  // `row-reverse` puts the heaviest plate (index 0) closest to the bar on
  // the LEFT side. The RIGHT side uses plain `row`.
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

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[containerStyle, style]}
    >
      <View style={barRowStyle} testID={testID ? `${testID}-row` : undefined}>
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
        <PerSideCaption
          grouped={grouped}
          total={perSideTotal}
          unitGlyph={unitGlyph}
          {...(testID ? { testID: `${testID}-caption` } : {})}
        />
      )}
    </View>
  );
}
