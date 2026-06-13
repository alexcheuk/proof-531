/**
 * Caps-style row of enabled lift names. See `LiftTab` for one-tab styling.
 *
 * SegRail isn't used because it doesn't support per-option suffix slots
 * (needed for the in-progress dot + PR star affordances). The lift
 * currently mid-session displays the dot next to its name; lifts that
 * have ever set a PR get a small ★ glyph after their name  -  always-on
 * visual reinforcement of the user's records.
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
  /**
   * Mirror of {@link Masthead}'s `elevated`. When true, paint the same
   * subtle drop shadow beneath the row so the tab strip floats over the
   * scrolling body just like the masthead above it.
   */
  elevated?: boolean;
  onSelect: (lift: Lift) => void;
};

export function LiftTabs({
  enabled,
  selected,
  inProgressLift,
  prLifts,
  elevated = false,
  onSelect,
}: LiftTabsProps) {
  const { colors, spacing } = useTheme();

  const wrapperStyle: ViewStyle = {
    backgroundColor: colors.bg0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg + spacing.xs, // 20 = 16 + 4
    // zIndex puts the (elevated) tab strip above the scrolling carousel
    // beneath it so the cast shadow isn't clipped by sibling content.
    zIndex: 1,
    ...(elevated
      ? {
          // Numbers match Masthead so the two stacked surfaces share one
          // shadow language  -  anything heavier reads as Material, which
          // is wrong for the e-ink-paper aesthetic.
          shadowColor: colors.ink0,
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }
      : null),
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
