import { SheetLayout } from '@/design/primitives/SheetLayout';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Cancel-session confirm sheet. Per DESIGN.md §12 this is the one place the
 * app breaks the "no confirm modals" rule — cancel is destructive.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/components/
 * CancelConfirmSheet.tsx`. The destructive button uses a two-tap pattern:
 *   1. First tap → fires `Haptics.notificationAsync(Warning)` via the parent's
 *      `onConfirmFirstTap` and arms the destructive state.
 *   2. Second tap (button now labeled "Tap again to discard") → invokes
 *      `onConfirmSecondTap`, which actually closes the session.
 *
 * `armed` is owned by the parent (`useLiveScreenState.cancelArmed`) so the
 * armed state survives unmount/remount of the sheet body.
 */
import { Pressable, type ViewStyle } from 'react-native';

export type CancelConfirmSheetProps = {
  open: boolean;
  armed: boolean;
  onConfirmFirstTap: () => void;
  onConfirmSecondTap: () => void;
  onDismiss: () => void;
  testID?: string;
};

export function CancelConfirmSheet({
  open,
  armed,
  onConfirmFirstTap,
  onConfirmSecondTap,
  onDismiss,
  testID,
}: CancelConfirmSheetProps) {
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
      title="Cancel this session?"
      primary={
        <Pressable
          testID="cancel-confirm-destructive"
          accessibilityRole="button"
          accessibilityLabel={
            armed
              ? 'Confirm cancel — tap again to discard the session'
              : 'Cancel session and return to Home'
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
            {armed ? 'Tap again to discard' : 'Cancel session'}
          </Text>
        </Pressable>
      }
      cancel={{
        label: 'Keep training',
        onPress: onDismiss,
        variant: 'outlined',
        testID: 'cancel-confirm-dismiss',
        accessibilityLabel: 'Keep training',
      }}
    >
      <Text variant="sans" weight="regular" size={13} color="ink2">
        {armed
          ? 'Tap the dark button once more to cancel. Sets already logged stay in your history.'
          : 'Sets already completed are kept in history. The session is closed — pick it up tomorrow.'}
      </Text>
    </SheetLayout>
  );
}
