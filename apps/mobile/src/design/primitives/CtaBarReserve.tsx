import { View, type ViewStyle } from 'react-native';

export const CTA_BAR_RESERVE_HEIGHTS = {
  default: 120,
  dense: 140,
} as const;

export type CtaBarReserveSize = keyof typeof CTA_BAR_RESERVE_HEIGHTS;

export type CtaBarReserveProps = {
  size?: CtaBarReserveSize;
};

export function CtaBarReserve({ size = 'default' }: CtaBarReserveProps) {
  const style: ViewStyle = { height: CTA_BAR_RESERVE_HEIGHTS[size] };
  return <View style={style} />;
}
