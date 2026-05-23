import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Rest countdown display. Pure presentational — caller owns the actual
 * countdown driver (`useLiveScreenState`) and passes seconds-remaining in.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * RestTimer.tsx`. The PWA timer counts UP (free-form rest). PE-05's done_when
 * requires a countdown with T-3s + T-0 hooks, so this component renders the
 * value directly from the prop rather than running its own driver.
 */
import { View, type ViewStyle } from 'react-native';

export type RestTimerProps = {
  /** Seconds remaining in the countdown. */
  remaining: number;
  testID?: string;
};

export function RestTimer({ remaining, testID }: RestTimerProps) {
  const { spacing } = useTheme();
  const safe = Math.max(0, Math.floor(remaining));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  const label = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const container: ViewStyle = {
    alignItems: 'center',
    marginTop: spacing.xl,
  };
  return (
    <View testID={testID} style={container} accessibilityLabel="Resting" accessibilityRole="timer">
      <Text
        variant="mono"
        weight="semibold"
        size={10}
        color="ink2"
        style={{ textTransform: 'uppercase', letterSpacing: 2.2, marginBottom: 6 }}
      >
        REST
      </Text>
      <Text
        variant="sans"
        weight="medium"
        size={84}
        color="ink0"
        style={{ letterSpacing: -2 }}
        testID="rest-timer-value"
      >
        {label}
      </Text>
    </View>
  );
}
