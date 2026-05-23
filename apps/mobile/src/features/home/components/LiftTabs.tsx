/**
 * Row of enabled-lift pills. Selected pill fills ink; idle pills are
 * tertiary ink with a hairline border. Tapping a pill calls `onSelect(lift)`.
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/LiftTabs.tsx`.
 * The PWA uses a caps-only underline pattern; the RN port renders pills
 * via `SegRail` for consistency with the rest of the design primitives
 * (border + active fill) and keeps every literal style on the design side.
 */
import { SegRail, type SegRailOption } from '@/design/primitives/SegRail';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { View, type ViewStyle } from 'react-native';

type LiftTabsProps = {
  enabled: readonly Lift[];
  selected: Lift;
  onSelect: (lift: Lift) => void;
};

/** Short label used in the tab row (`Dead` for deadlift, otherwise full name). */
function shortName(lift: Lift): string {
  return lift === 'deadlift' ? 'Dead' : liftDisplayName(lift);
}

export function LiftTabs({ enabled, selected, onSelect }: LiftTabsProps) {
  const { spacing } = useTheme();

  const wrapperStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  };

  const options: SegRailOption<Lift>[] = enabled.map((lift) => ({
    value: lift,
    label: shortName(lift),
  }));

  return (
    <View style={wrapperStyle} testID="lift-tabs">
      <SegRail<Lift>
        value={selected}
        options={options}
        onChange={onSelect}
        testID="lift-tabs-rail"
      />
    </View>
  );
}
