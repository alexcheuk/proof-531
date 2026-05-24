import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';
import { Pressable, View, type ViewStyle } from 'react-native';

export type HistoryFilterEmptyStateProps = {
  /** Called when the user taps "Show all sessions" — should reset the active filter. */
  onClearFilter: () => void;
};

/**
 * Empty state rendered when filters are active but match zero rows. Renders
 * an explanation + a button that clears the filter so the user is never
 * stuck staring at an empty page with no obvious recovery.
 */
export function HistoryFilterEmptyState({ onClearFilter }: HistoryFilterEmptyStateProps) {
  const { colors, layout, spacing } = useTheme();
  const wrap: ViewStyle = {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.xl,
    alignItems: 'flex-start',
    gap: spacing.md,
  };
  const buttonStyle: ViewStyle = {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.ink0,
  };
  return (
    <View style={wrap} testID="history-filter-empty">
      <CapsLabel color="ink3">No sessions match this filter.</CapsLabel>
      <Pressable
        onPress={onClearFilter}
        accessibilityRole="button"
        accessibilityLabel="Show all sessions"
        testID="history-filter-empty-show-all"
        style={({ pressed }) => [buttonStyle, pressed ? { opacity: 0.7 } : null]}
      >
        <CapsLabel weight="semibold" color="ink0">
          Show all sessions
        </CapsLabel>
      </Pressable>
    </View>
  );
}
