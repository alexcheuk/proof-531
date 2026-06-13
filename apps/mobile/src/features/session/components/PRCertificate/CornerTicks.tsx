import { View } from 'react-native';

// Decorative only - no a11y role. Defaults (14px/2px border) bumped from 10px/1.5px in loop-018;
// the original was barely visible at a glance on a real device.
export function CornerTicks({
  color,
  size = 14,
  thickness = 2,
  inset = 6,
  hideBottom = false,
}: {
  color: string;
  size?: number;
  thickness?: number;
  inset?: number;
  /** When true, render only the two top corners. */
  hideBottom?: boolean;
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
      {hideBottom ? null : (
        <>
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
      )}
    </>
  );
}
