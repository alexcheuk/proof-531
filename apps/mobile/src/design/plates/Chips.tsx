import { Canvas, Group, RoundedRect } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { type PlateInventoryEntry, calcPlates } from '../../domain/plates';
import { useTheme } from '../theme';

const STANDARD_LBS_INVENTORY: PlateInventoryEntry[] = [
  { size: 45, count: 8 },
  { size: 35, count: 2 },
  { size: 25, count: 2 },
  { size: 10, count: 2 },
  { size: 5, count: 2 },
  { size: 2.5, count: 2 },
];

export type ChipsProps = {
  /** Target weight in lbs. */
  weight: number;
  /** Bar weight (default 45). */
  bar?: number;
  /** Plate inventory (default standard lbs). */
  inventory?: PlateInventoryEntry[];
  /** Canvas width in dp (default 320). */
  width?: number;
  /** Canvas height in dp (default 100). */
  height?: number;
};

export function Chips({
  weight,
  bar = 45,
  inventory = STANDARD_LBS_INVENTORY,
  width = 320,
  height = 100,
}: ChipsProps) {
  const theme = useTheme();
  const { plates } = useMemo(
    () => calcPlates({ target: weight, bar, inventory }),
    [weight, bar, inventory],
  );

  const colorFor = (plate: number): string => {
    if (plate === 45) return theme.colors.hot;
    if (plate === 35) return theme.colors.amber;
    if (plate === 25) return theme.colors.lime;
    if (plate === 10) return theme.colors.ice;
    if (plate === 5) return theme.colors.ink1;
    return theme.colors.ink2;
  };

  const chipW = 36;
  const chipH = 22;
  const gap = 4;
  const cx = width / 2;
  const cy = height / 2;
  const startLeft = cx - chipW - gap;
  const startRight = cx + gap;
  const r = chipH / 2;

  return (
    <Canvas style={{ width, height }}>
      <Group>
        {plates.map((plate, i) => (
          <RoundedRect
            key={`L-${i}-${plate}`}
            x={startLeft - i * (chipW + gap)}
            y={cy - chipH / 2}
            width={chipW}
            height={chipH}
            r={r}
            color={colorFor(plate)}
          />
        ))}
      </Group>
      <Group>
        {plates.map((plate, i) => (
          <RoundedRect
            key={`R-${i}-${plate}`}
            x={startRight + i * (chipW + gap)}
            y={cy - chipH / 2}
            width={chipW}
            height={chipH}
            r={r}
            color={colorFor(plate)}
          />
        ))}
      </Group>
    </Canvas>
  );
}

export default Chips;
