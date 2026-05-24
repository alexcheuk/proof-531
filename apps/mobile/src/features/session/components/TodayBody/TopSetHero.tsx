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
};

/**
 * Today's "NEXT SET" hero — full PlateBar + weight + reps eyebrow.
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
}: TopSetHeroProps) {
  const { colors } = useTheme();
  const heroStyle: ViewStyle = {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  };

  const heroWeightStorage = round(tm * set.pct, storageUnit);
  const heroWeight = displayWeight(heroWeightStorage, storageUnit, renderUnit);
  const heroDecomposed = decompose(heroWeight, plateSet);

  return (
    <View style={heroStyle}>
      <TopSetBlock
        eyebrow="NEXT SET"
        weight={heroWeight}
        unitGlyph={unitGlyph}
        reps={set.reps}
        amrap={!!set.amrap}
        pctLabel={`${Math.round(set.pct * 100)}%`}
        tmLabel={`TM ${tmInDisplay} ${unitGlyph}`}
        perSide={heroDecomposed.perSide}
        plateVariant="full"
        bordered={false}
        testID="today-top-set"
      />
    </View>
  );
}
