import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { decompose } from '@/domain/plates';
import type { PlateSet, Unit } from '@/domain/types';
import { displayWeight, round } from '@/domain/units';
import { View, type ViewStyle } from 'react-native';

export type TopSetHeroProps = {
  /** Pre-resolved set spec (pct + reps + amrap flag). */
  set: { pct: number; reps: number; amrap?: boolean };
  tm: number;
  storageUnit: Unit;
  renderUnit: Unit;
  unitGlyph: 'lb' | 'kg';
  tmInDisplay: number;
  plateSet: PlateSet;
  /**
   * Optional eyebrow override (defaults to "NEXT SET"). Week-4 TM-test
   * sessions pass "TM TEST" so the hero reads consistently with the strip.
   */
  eyebrow?: string;
  /**
   * Optional pct-label override. Defaults to `Math.round(set.pct * 100)%`.
   * Week-4 passes `"100% TM"` to make the percentage and TM context one
   * caption rather than two ("100%" + "TM 245 lb" reads as redundant when
   * pct is exactly 100).
   */
  pctLabel?: string;
  /**
   * Optional rep-range tuple. When set, the hero renders `× lo–hi` instead
   * of `× reps`. Week-4 passes `[3, 5]` to communicate the TM test band.
   */
  repsRange?: readonly [number, number];
};

/**
 * Today's "NEXT SET" hero  -  full PlateBar + weight + reps eyebrow.
 *
 * Pure presentation; the parent supplies the resolved set and units.
 */
export function TopSetHero({
  set,
  tm,
  storageUnit,
  renderUnit,
  unitGlyph,
  tmInDisplay,
  plateSet,
  eyebrow,
  pctLabel,
  repsRange,
}: TopSetHeroProps) {
  const { colors, layout, spacing } = useTheme();
  const heroStyle: ViewStyle = {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg + 4,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  };

  const heroWeightStorage = round(tm * set.pct, storageUnit);
  const heroWeight = displayWeight(heroWeightStorage, storageUnit, renderUnit);
  const heroDecomposed = decompose(heroWeight, plateSet);

  return (
    <View style={heroStyle}>
      <TopSetBlock
        eyebrow={eyebrow ?? 'NEXT SET'}
        weight={heroWeight}
        unitGlyph={unitGlyph}
        reps={set.reps}
        amrap={!!set.amrap}
        {...(repsRange ? { repsRange } : {})}
        pctLabel={pctLabel ?? `${Math.round(set.pct * 100)}%`}
        tmLabel={`TM ${tmInDisplay} ${unitGlyph}`}
        perSide={heroDecomposed.perSide}
        plateVariant="full"
        bordered={false}
        testID="today-top-set"
      />
    </View>
  );
}
