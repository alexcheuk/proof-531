import { View } from 'react-native';

/**
 * Four bracket corner ticks framing the PR certificate.
 * Decorative only — no a11y role.
 */
export function CornerTicks({ color }: { color: string }) {
  const base = {
    position: 'absolute' as const,
    width: 10,
    height: 10,
    borderColor: color,
  };
  return (
    <>
      <View style={{ ...base, top: 6, left: 6, borderTopWidth: 1.5, borderLeftWidth: 1.5 }} />
      <View style={{ ...base, top: 6, right: 6, borderTopWidth: 1.5, borderRightWidth: 1.5 }} />
      <View style={{ ...base, bottom: 6, left: 6, borderBottomWidth: 1.5, borderLeftWidth: 1.5 }} />
      <View
        style={{ ...base, bottom: 6, right: 6, borderBottomWidth: 1.5, borderRightWidth: 1.5 }}
      />
    </>
  );
}
