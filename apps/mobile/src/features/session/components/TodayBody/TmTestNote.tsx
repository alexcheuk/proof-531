import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Card } from '@/design/primitives/Card';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View } from 'react-native';

/**
 * Calm one-line guidance card shown on the Week-4 Today screen in place of
 * the BBB band. Reads:
 *
 *   TM TEST · GUIDANCE
 *   Aim for 3 to 5 clean reps.
 *   Stop when bar speed drops.
 *
 * The brief is emphatic: the TM test is data-collection, not a max-effort
 * push. The note's job is to set that expectation before the lifter walks
 * to the bar. No haptics; no animation; no interaction.
 *
 * Composition of existing primitives (`Card` + `CapsLabel` + `Text`). Lives
 * locally  -  feature scope, not a primitive.
 */
export function TmTestNote() {
  const { layout, spacing } = useTheme();
  return (
    <View
      style={{ paddingHorizontal: layout.gutter, paddingTop: spacing.xl }}
      testID="today-tm-test-note"
      accessibilityRole="text"
      accessibilityLabel="TM test guidance: aim for 3 to 5 clean reps. Stop when bar speed drops."
    >
      <Card padding="lg" tone="default">
        <CapsLabel style={{ marginBottom: spacing.sm }}>TM TEST · GUIDANCE</CapsLabel>
        <Text variant="sans" weight="medium" size={15} color="ink0" style={{ lineHeight: 22 }}>
          Aim for 3 to 5 clean reps. Stop when bar speed drops.
        </Text>
      </Card>
    </View>
  );
}
