import { View } from 'react-native';

/**
 * Four bracket corner ticks framing the PR certificate or the
 * celebration screen. Decorative only — no a11y role.
 *
 * `size` is the side length of each corner square (default 14).
 * `thickness` is the border width (default 2). Loop-018 bumped the
 * defaults up — the previous 10×10/1.5 was barely visible at glance
 * on a real device.
 */
export function CornerTicks({
  color,
  size = 14,
  thickness = 2,
  inset = 6,
}: {
  color: string;
  size?: number;
  thickness?: number;
  inset?: number;
}) {
  const base = {
    position: 'absolute' as const,
    width: size,
    height: size,
    borderColor: color,
  };
  return (
    <>
      <View
        style={{
          ...base,
          top: inset,
          left: inset,
          borderTopWidth: thickness,
          borderLeftWidth: thickness,
        }}
      />
      <View
        style={{
          ...base,
          top: inset,
          right: inset,
          borderTopWidth: thickness,
          borderRightWidth: thickness,
        }}
      />
      <View
        style={{
          ...base,
          bottom: inset,
          left: inset,
          borderBottomWidth: thickness,
          borderLeftWidth: thickness,
        }}
      />
      <View
        style={{
          ...base,
          bottom: inset,
          right: inset,
          borderBottomWidth: thickness,
          borderRightWidth: thickness,
        }}
      />
    </>
  );
}
