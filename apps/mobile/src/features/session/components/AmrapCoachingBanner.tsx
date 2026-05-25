import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View } from 'react-native';

/**
 * Coaching copy shown on the live AMRAP top set — reminds the lifter
 * what AMRAP means and that the goal is a PR within safe rep ranges.
 *
 * Intentionally tiny + monochrome to match the paper aesthetic. Sits
 * between the TopSetBlock and the bottom Divider on SetPhase.
 */
export function AmrapCoachingBanner({ testID = 'amrap-coaching' }: { testID?: string }) {
  const { spacing } = useTheme();
  return (
    <View testID={testID} style={{ marginTop: spacing.md, gap: spacing.xs }}>
      <CapsLabel size="xs" color="ink3">
        As many reps as possible
      </CapsLabel>
      <Text variant="sans" weight="regular" size={13} color="ink3">
        Push for a PR — but stop when form breaks.
      </Text>
    </View>
  );
}
