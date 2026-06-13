import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

/**
 * Empty state rendered on the History tab when the user has zero session
 * rows of any status. The achievement strip above is suppressed in this
 * case, so this block is the only signal the page renders.
 *
 * Replaces the previous one-liner caption (loop-006)  -  a fresh-install
 * user landing on a blank tab needed more orientation than a single
 * 11pt caps line. The eyebrow names the screen, the headline acts as
 * a soft challenge (mirrors the rest of the app's voice), and the
 * supporting copy gestures back to Today without trying to navigate
 * for the user (no CTA  -  the tab bar is the right affordance).
 */
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
