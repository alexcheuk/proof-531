import { PlateBar } from '@/design/primitives/PlateBar';
import { SectionBand } from '@/design/primitives/SectionBand';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * Live screen's dominant readout: lift+%TM eyebrow above a giant weight and
 * the rep target, followed by a mini `PlateBar` showing the load-out.
 *
 * Pure presentational. Caller derives `weight` from the session snapshot and
 * the matching `perSide` plate decomposition (heaviest first).
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * LiveBigWeight.tsx` + the adjacent `<SectionBand><PlateBar/></SectionBand>`
 * the PWA's `LiveScreen` renders directly below it.
 */
import { View, type ViewStyle } from 'react-native';

export type LiveBigWeightProps = {
  lift: Lift;
  pct: number;
  weight: number;
  unit: Unit;
  reps: number;
  amrap: boolean;
  /** Pre-computed plate decomposition (heaviest first). */
  perSide: readonly number[];
  testID?: string;
};

export function LiveBigWeight({
  lift,
  pct,
  weight,
  unit,
  reps,
  amrap,
  perSide,
  testID,
}: LiveBigWeightProps) {
  const { spacing } = useTheme();
  const container: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  };
  const weightRow: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  };
  const colRight: ViewStyle = {
    marginLeft: spacing.md,
    alignItems: 'flex-start',
  };
  const plateBandStyle: ViewStyle = {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  };
  const unitGlyph = displayUnit(unit);
  return (
    <>
      <View testID={testID} style={container}>
        <Text
          variant="mono"
          weight="semibold"
          size={10}
          color="ink2"
          style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
        >
          {liftDisplayName(lift)} · {Math.round(pct * 100)}% TM
        </Text>
        <View style={weightRow}>
          <Text
            variant="sans"
            weight="medium"
            size={88}
            color="ink0"
            style={{ letterSpacing: -3 }}
            testID="live-weight-value"
          >
            {weight}
          </Text>
          <View style={colRight}>
            <Text
              variant="mono"
              weight="semibold"
              size={20}
              color="ink2"
              style={{ textTransform: 'uppercase', letterSpacing: 2.5 }}
            >
              {unitGlyph}
            </Text>
            <Text variant="sans" weight="medium" size={22} color="ink1">
              × {reps}
              {amrap ? '+' : ''}
            </Text>
          </View>
        </View>
      </View>
      <SectionBand padding="tight" style={plateBandStyle} testID="live-bigweight-plate-band">
        <PlateBar
          perSide={perSide}
          unitGlyph={unitGlyph}
          weight={weight}
          testID="live-bigweight-plate-bar"
        />
      </SectionBand>
    </>
  );
}
