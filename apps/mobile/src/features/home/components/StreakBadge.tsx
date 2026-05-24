import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

export type StreakBadgeProps = {
  /** Current trailing day-streak (days). Renders nothing when < 3. */
  streak: number;
};

/**
 * Small "🔥 N-day streak" strip rendered between the Masthead and LiftTabs
 * when the user has a trailing streak of ≥ 3 days. Designed to be a
 * lightweight ambient nudge — not a destination.
 */
export function StreakBadge({ streak }: StreakBadgeProps) {
  const { spacing } = useTheme();
  if (streak < 3) return null;

  const wrap: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  };
  return (
    <View style={wrap} testID="home-streak-badge">
      <Row gap="xs">
        <CapsLabel size="xs" weight="semibold" color="ink1" style={{ letterSpacing: 1.8 }}>
          {`🔥 ${streak}-day streak`}
        </CapsLabel>
        <CapsLabel size="xs" color="ink3" style={{ letterSpacing: 1.4 }}>
          · keep it going
        </CapsLabel>
      </Row>
    </View>
  );
}
