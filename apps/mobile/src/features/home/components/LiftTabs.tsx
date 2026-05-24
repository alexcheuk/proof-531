/**
 * Caps-style row of enabled lift names. See `LiftTab` for one-tab styling.
 *
 * SegRail isn't used because it doesn't support per-option suffix slots
 * (needed for the in-progress dot + PR star affordances). The lift
 * currently mid-session displays the dot next to its name; lifts that
 * have ever set a PR get a small ★ glyph after their name — always-on
 * visual reinforcement of the user's records.
 *
 * Ported from `~/Development/531-pwa/src/features/home/components/LiftTabs.tsx`.
 */
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import type { ViewStyle } from 'react-native';
import { LiftTab } from './LiftTab';

type LiftTabsProps = {
  enabled: readonly Lift[];
  selected: Lift;
  inProgressLift: Lift | null;
  /** Lifts that have ever recorded a PR. Renders a small ★ after the label. */
  prLifts?: ReadonlySet<Lift>;
  onSelect: (lift: Lift) => void;
};

export function LiftTabs({ enabled, selected, inProgressLift, prLifts, onSelect }: LiftTabsProps) {
  const { colors, spacing } = useTheme();

  const wrapperStyle: ViewStyle = {
    backgroundColor: colors.bg0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg + spacing.xs, // 20 = 16 + 4
  };

  return (
    <Row
      justify="center"
      style={[wrapperStyle, { gap: spacing.xl + spacing.xs }]}
      testID="lift-tabs"
    >
      {enabled.map((lift) => (
        <LiftTab
          key={lift}
          lift={lift}
          active={lift === selected}
          inProgress={lift === inProgressLift}
          hasPr={prLifts?.has(lift) ?? false}
          onSelect={onSelect}
        />
      ))}
    </Row>
  );
}
