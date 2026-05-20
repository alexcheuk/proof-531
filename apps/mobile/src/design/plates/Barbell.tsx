import { Canvas, Group, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
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

// Plate diameter ratios — referenced to a 45 lb plate (100%).
// Lower bound 42% per spec.
const PLATE_DIAMETERS: Record<number, number> = {
  45: 1.0,
  35: 0.85,
  25: 0.75,
  10: 0.55,
  5: 0.46,
  2.5: 0.42,
};

export type BarbellProps = {
  /** Target weight in lbs. */
  weight: number;
  /** Bar weight (default 45). */
  bar?: number;
  /** Plate inventory (default standard lbs). */
  inventory?: PlateInventoryEntry[];
  /** Canvas width in dp (default 320). */
  width?: number;
  /** Canvas height in dp (default 140). */
  height?: number;
};

export function Barbell({
  weight,
  bar = 45,
  inventory = STANDARD_LBS_INVENTORY,
  width = 320,
  height = 140,
}: BarbellProps) {
  const theme = useTheme();
  const { plates } = useMemo(
    () => calcPlates({ target: weight, bar, inventory }),
    [weight, bar, inventory],
  );

  const cx = width / 2;
  const cy = height / 2;
  const barLength = width * 0.7;
  const barHeight = 6;
  const sleeveLength = width * 0.12;
  const sleeveHeight = 14;

  const maxPlateRadius = (height * 0.45) / 2;

  const sleeveLeftX = cx - barLength / 2;
  const sleeveRightX = cx + barLength / 2;

  return (
    <Canvas style={{ width, height }}>
      {/* Bar shaft (between the two sleeves) */}
      <Rect
        x={sleeveLeftX + sleeveLength}
        y={cy - barHeight / 2}
        width={barLength - 2 * sleeveLength}
        height={barHeight}
      >
        <LinearGradient
          start={vec(0, cy - barHeight)}
          end={vec(0, cy + barHeight)}
          colors={[theme.colors.ink2, theme.colors.ink0, theme.colors.ink2]}
        />
      </Rect>

      {/* Left sleeve */}
      <Rect x={sleeveLeftX} y={cy - sleeveHeight / 2} width={sleeveLength} height={sleeveHeight}>
        <LinearGradient
          start={vec(0, cy - sleeveHeight)}
          end={vec(0, cy + sleeveHeight)}
          colors={[theme.colors.ink2, theme.colors.ink0]}
        />
      </Rect>

      {/* Right sleeve */}
      <Rect
        x={sleeveRightX - sleeveLength}
        y={cy - sleeveHeight / 2}
        width={sleeveLength}
        height={sleeveHeight}
      >
        <LinearGradient
          start={vec(0, cy - sleeveHeight)}
          end={vec(0, cy + sleeveHeight)}
          colors={[theme.colors.ink2, theme.colors.ink0]}
        />
      </Rect>

      {/* Plates */}
      <PlateStack
        plates={plates}
        side="left"
        sleeveX={sleeveLeftX}
        cy={cy}
        maxRadius={maxPlateRadius}
        hot={theme.colors.hot}
        ink2={theme.colors.ink2}
      />
      <PlateStack
        plates={plates}
        side="right"
        sleeveX={sleeveRightX}
        cy={cy}
        maxRadius={maxPlateRadius}
        hot={theme.colors.hot}
        ink2={theme.colors.ink2}
      />
    </Canvas>
  );
}

type PlateStackProps = {
  plates: number[];
  side: 'left' | 'right';
  sleeveX: number;
  cy: number;
  maxRadius: number;
  hot: string;
  ink2: string;
};

function PlateStack({ plates, side, sleeveX, cy, maxRadius, hot, ink2 }: PlateStackProps) {
  const plateThickness = 8;
  const collarThickness = 3;
  const collarHeight = 24;

  // The collar sits between the sleeve and the first (largest) plate.
  // For the left side, the sleeve's outer edge is at sleeveX. Plates stack to the LEFT (outward).
  // For the right side, the sleeve's outer edge is at sleeveX. Plates stack to the RIGHT (outward).
  const collarX = side === 'left' ? sleeveX - collarThickness : sleeveX;
  const firstPlateAnchor = side === 'left' ? sleeveX - collarThickness : sleeveX + collarThickness;

  return (
    <Group>
      {/* Collar between sleeve and innermost plate */}
      <Rect x={collarX} y={cy - collarHeight / 2} width={collarThickness} height={collarHeight}>
        <LinearGradient
          start={vec(0, cy - collarHeight / 2)}
          end={vec(0, cy + collarHeight / 2)}
          colors={[ink2, hot]}
        />
      </Rect>

      {plates.map((plate, i) => {
        const ratio = PLATE_DIAMETERS[plate] ?? 0.5;
        const radius = maxRadius * ratio;
        // For left side: each plate's right edge is at firstPlateAnchor - (i * plateThickness).
        //   so plate's x = right edge - thickness.
        // For right side: each plate's left edge is at firstPlateAnchor + (i * plateThickness).
        const plateX =
          side === 'left'
            ? firstPlateAnchor - (i + 1) * plateThickness
            : firstPlateAnchor + i * plateThickness;
        return (
          <Rect
            key={`${side}-${i}-${plate}`}
            x={plateX}
            y={cy - radius}
            width={plateThickness}
            height={radius * 2}
          >
            <LinearGradient
              start={vec(0, cy - radius)}
              end={vec(0, cy + radius)}
              colors={[ink2, hot, ink2]}
            />
          </Rect>
        );
      })}
    </Group>
  );
}

export default Barbell;
