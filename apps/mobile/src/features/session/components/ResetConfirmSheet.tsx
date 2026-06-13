import { SheetLayout } from '@/design/primitives/SheetLayout';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Pressable, type ViewStyle } from 'react-native';

export type ResetConfirmSheetProps = {
  open: boolean;
  armed: boolean;
  onConfirmFirstTap: () => void;
  onConfirmSecondTap: () => void;
  onDismiss: () => void;
  testID?: string;
};

export function ResetConfirmSheet({
  open,
  armed,
  onConfirmFirstTap,
  onConfirmSecondTap,
  onDismiss,
  testID,
}: ResetConfirmSheetProps) {
  const { colors } = useTheme();

  const destructiveStyle: ViewStyle = {
    paddingVertical: 14,
    backgroundColor: colors.ink0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <SheetLayout
      open={open}
      onDismiss={onDismiss}
      {...(testID !== undefined ? { testID } : {})}
      eyebrow="CONFIRM"
      title="Restart this session?"
      primary={
        <Pressable
          testID="reset-confirm-destructive"
          accessibilityRole="button"
          accessibilityLabel={
            armed ? 'Confirm restart  -  tap again to wipe every set' : 'Restart session from set 1'
          }
          onPress={armed ? onConfirmSecondTap : onConfirmFirstTap}
          style={destructiveStyle}
        >
          <Text
            variant="sans"
            weight="semibold"
            size={13}
            color="bg0"
            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
          >
            {armed ? 'Tap again to wipe sets' : 'Restart session'}
          </Text>
        </Pressable>
      }
      cancel={{
        label: 'Keep going',
        onPress: onDismiss,
        variant: 'outlined',
        testID: 'reset-confirm-dismiss',
        accessibilityLabel: 'Keep going',
      }}
    >
      <Text variant="sans" weight="regular" size={13} color="ink2">
        {armed
          ? 'Tap the dark button once more to wipe every set you logged this session and start over from set 1.'
          : 'Erases every set you logged this session and drops you back at set 1. PRs already saved are kept.'}
      </Text>
    </SheetLayout>
  );
}
