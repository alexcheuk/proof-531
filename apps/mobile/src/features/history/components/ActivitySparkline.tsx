import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';
import { currentStreak } from '../activity';

export type ActivitySparklineProps = {
  /** Oldest-first window of training-day bits, length 14 (default). */
  activity: ReadonlyArray<boolean>;
};

/**
 * 14-day activity sparkline rendered as a row of hairline-tall ticks.
 * Filled ticks mark days with a completed session; muted ticks mark idle
 * days. A trailing streak count is shown next to the row when ≥ 2.
 */
export function ActivitySparkline({ activity }: ActivitySparklineProps) {
  const { colors } = useTheme();
  const streak = currentStreak(activity);

  return (
    <View testID="history-activity-sparkline">
      <Row justify="space-between" align="baseline" style={{ marginBottom: 6 }}>
        <CapsLabel size="xs" color="ink3">
          last {activity.length} days
        </CapsLabel>
        {streak >= 2 ? (
          <CapsLabel size="xs" weight="semibold" color="ink1" testID="history-activity-streak">
            {`${streak}-day streak`}
          </CapsLabel>
        ) : null}
      </Row>
      <Row gap="xs" align="flex-end" style={{ height: 18 }}>
        {activity.map((filled, i) => {
          const tickStyle: ViewStyle = {
            flex: 1,
            height: filled ? 18 : 6,
            backgroundColor: filled ? colors.ink0 : colors.line,
          };
          return (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: positional day tick
              key={`tick-${i}`}
              style={tickStyle}
              testID={filled ? `activity-tick-${i}-filled` : `activity-tick-${i}-empty`}
            />
          );
        })}
      </Row>
    </View>
  );
}
