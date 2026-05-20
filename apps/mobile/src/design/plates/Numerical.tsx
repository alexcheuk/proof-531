import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { type PlateInventoryEntry, calcPlates } from '../../domain/plates';
import { Caps } from '../primitives/Caps';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme';

const STANDARD_LBS_INVENTORY: PlateInventoryEntry[] = [
  { size: 45, count: 8 },
  { size: 35, count: 2 },
  { size: 25, count: 2 },
  { size: 10, count: 2 },
  { size: 5, count: 2 },
  { size: 2.5, count: 2 },
];

export type NumericalProps = {
  /** Target weight in lbs. */
  weight: number;
  /** Bar weight (default 45). */
  bar?: number;
  /** Plate inventory (default standard lbs). */
  inventory?: PlateInventoryEntry[];
};

type PlateGroup = { size: number; count: number };

function groupPlates(plates: readonly number[]): PlateGroup[] {
  const counts = new Map<number, number>();
  for (const p of plates) {
    counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([size, count]) => ({ size, count }));
}

export function Numerical({
  weight,
  bar = 45,
  inventory = STANDARD_LBS_INVENTORY,
}: NumericalProps) {
  const theme = useTheme();
  const { plates, remainder } = useMemo(
    () => calcPlates({ target: weight, bar, inventory }),
    [weight, bar, inventory],
  );

  const grouped = useMemo(() => groupPlates(plates), [plates]);

  const containerStyle = useMemo(
    () => ({
      ...styles.container,
      backgroundColor: theme.colors.bg1,
      padding: theme.shape.rMd,
      borderRadius: theme.shape.rMd,
      gap: theme.shape.rXs,
    }),
    [theme],
  );

  const rowStyle = useMemo(() => ({ ...styles.row, gap: theme.shape.rSm }), [theme]);

  return (
    <View testID="numerical" style={containerStyle}>
      <Caps>Per side</Caps>
      {grouped.length === 0 ? (
        <Text variant="subtitle">Bar only ({bar} lb)</Text>
      ) : (
        <View style={rowStyle}>
          {grouped.map((g, i) => (
            <Text key={`${g.size}-${i}`} variant="subtitle">
              {g.count} × {g.size}
            </Text>
          ))}
        </View>
      )}
      {remainder > 0 ? (
        <Text tone="ink2" variant="small">
          Short by {remainder} lb
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
});

export default Numerical;
