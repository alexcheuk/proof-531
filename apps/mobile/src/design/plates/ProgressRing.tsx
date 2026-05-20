import { Text } from '@/design/primitives/Text';
import { colors, type } from '@/design/tokens';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { View } from 'react-native';

export type ProgressRingProps = {
  /** 0..1, clamped. */
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
};

export function ProgressRing({
  progress,
  size = 60,
  stroke = 4,
  color = colors.hot,
  trackColor = colors.lineFaint,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const trackPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(cx, cy, r);
    return p;
  }, [cx, cy, r]);

  const arcPath = useMemo(() => {
    const p = Skia.Path.Make();
    const rect = { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
    p.addArc(rect, -90, 360 * clamped);
    return p;
  }, [cx, cy, r, clamped]);

  const percent = Math.round(clamped * 100);

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      testID="progress-ring"
      accessibilityLabel={`${percent} percent`}
    >
      <Canvas style={{ position: 'absolute', width: size, height: size }}>
        <Path path={trackPath} style="stroke" strokeWidth={stroke} color={trackColor} />
        <Path path={arcPath} style="stroke" strokeWidth={stroke} color={color} strokeCap="round" />
      </Canvas>
      <Text style={{ fontFamily: type.mono, fontWeight: '600' }}>{percent}%</Text>
    </View>
  );
}

export default ProgressRing;
