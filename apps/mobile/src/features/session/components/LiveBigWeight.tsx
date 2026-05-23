import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
/**
 * Live screen's dominant readout: lift+%TM eyebrow above a giant weight and
 * the rep target. Pure presentational.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * LiveBigWeight.tsx`. Caller derives `weight` from the session snapshot.
 */
import { View, type ViewStyle } from 'react-native';

export type LiveBigWeightProps = {
  lift: Lift;
  pct: number;
  weight: number;
  unit: Unit;
  reps: number;
  amrap: boolean;
  testID?: string;
};

export function LiveBigWeight({
  lift,
  pct,
  weight,
  unit,
  reps,
  amrap,
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
  return (
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
            {displayUnit(unit)}
          </Text>
          <Text variant="sans" weight="medium" size={22} color="ink1">
            × {reps}
            {amrap ? '+' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}
