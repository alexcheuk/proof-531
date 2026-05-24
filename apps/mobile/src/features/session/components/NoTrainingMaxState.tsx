import { CapsLabel } from '@/design/primitives/CapsLabel';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { View, type ViewStyle } from 'react-native';

export type NoTrainingMaxStateProps = {
  lift: Lift;
  onOpenSettings: () => void;
};

/**
 * Empty state rendered on Today when no TM exists for the lift. Explains
 * the gap and routes the user to Settings. A blank canvas reads as "broken
 * app", which is why this shipped instead.
 */
export function NoTrainingMaxState({ lift, onOpenSettings }: NoTrainingMaxStateProps) {
  const { colors, spacing } = useTheme();
  const wrap: ViewStyle = {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.bg0,
  };
  return (
    <View style={wrap} testID="today-no-tm">
      <CapsLabel style={{ marginBottom: spacing.md }}>No training max set</CapsLabel>
      <Text variant="sans" weight="bold" size={40} color="ink0" style={{ letterSpacing: -1.2 }}>
        Set your {liftDisplayName(lift)}
        <Text variant="sans" weight="bold" size={40} color="amber">
          .
        </Text>
      </Text>
      <Text
        variant="sans"
        weight="regular"
        size={14}
        color="ink2"
        style={{ marginTop: spacing.md, maxWidth: 280, lineHeight: 21 }}
      >
        Add a training max in Settings so the program can prescribe today's working sets.
      </Text>
      <View style={{ marginTop: spacing.xl }}>
        <PrimaryPillButton testID="today-open-settings" onPress={onOpenSettings} glyph="→">
          Open settings
        </PrimaryPillButton>
      </View>
    </View>
  );
}
