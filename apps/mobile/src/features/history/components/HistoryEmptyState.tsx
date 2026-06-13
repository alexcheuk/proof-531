import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

// No CTA: the tab bar is the right navigation affordance for a fresh-install user.
export function HistoryEmptyState() {
  const { layout, spacing } = useTheme();
  const wrap: ViewStyle = {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.xxxl,
    gap: spacing.md,
  };
  return (
    <View style={wrap} testID="history-empty">
      <CapsLabel style={{ letterSpacing: 1.8 }}>HISTORY · EMPTY</CapsLabel>
      <Text variant="sans" weight="bold" size={36} color="ink0" style={{ letterSpacing: -1.08 }}>
        Nothing filed yet.
      </Text>
      <Text variant="sans" weight="regular" size={15} color="ink2" style={{ lineHeight: 22 }}>
        Finished sessions land here - PRs starred, lifetime volume tallied, streaks tracked. Pop
        over to Today to start one.
      </Text>
    </View>
  );
}
