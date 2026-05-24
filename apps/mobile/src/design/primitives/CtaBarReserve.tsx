import { View, type ViewStyle } from 'react-native';

/**
 * Default reserve height — enough breathing room above the sticky CtaBar
 * that scrolled content settles into a comfortable resting position, not
 * flush against the bar's top edge.
 *
 * Two named sizes:
 *   - `default` (120) — Live screen, where the body is the rest timer or
 *     a single working set and the reader's eye lives mid-screen.
 *   - `dense` (140) — SessionComplete, where the receipt's last line is
 *     dense numeric data and benefits from extra slack.
 *
 * Kept tiny on purpose — the value is design intent, not behavior.
 */
export const CTA_BAR_RESERVE_HEIGHTS = {
  default: 120,
  dense: 140,
} as const;

export type CtaBarReserveSize = keyof typeof CTA_BAR_RESERVE_HEIGHTS;

export type CtaBarReserveProps = {
  size?: CtaBarReserveSize;
};

/**
 * Empty spacer rendered at the tail of a scrollable session surface so
 * the last meaningful row isn't clipped or jammed against the sticky
 * CtaBar overlay. Replaces ad-hoc `<View style={{height:120}} />` magic.
 */
export function CtaBarReserve({ size = 'default' }: CtaBarReserveProps) {
  const style: ViewStyle = { height: CTA_BAR_RESERVE_HEIGHTS[size] };
  return <View style={style} />;
}
