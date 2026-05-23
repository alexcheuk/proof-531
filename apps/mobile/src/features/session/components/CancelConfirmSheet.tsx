import { Sheet } from '@/design/primitives/Sheet';
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
 *   2. Second tap (button now labeled "Tap again to cancel") → invokes
 *      `onConfirmSecondTap`, which actually closes the session.
 *
 * `armed` is owned by the parent (`useLiveScreenState.cancelArmed`) so the
 * armed state survives unmount/remount of the sheet body.
 */
import { Pressable, View, type ViewStyle } from 'react-native';

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
  const { colors, spacing } = useTheme();

  const body: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };
  const confirmButton: ViewStyle = {
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.ink0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  };
  const dismissButton: ViewStyle = {
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.ink0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <Sheet open={open} onDismiss={onDismiss} {...(testID !== undefined ? { testID } : {})}>
      <View style={body}>
        <Text
          variant="mono"
          weight="semibold"
          size={10}
          color="ink2"
          style={{ textTransform: 'uppercase', letterSpacing: 2.2, marginBottom: 8 }}
        >
          CONFIRM
        </Text>
        <Text variant="sans" weight="medium" size={24} color="ink0">
          Cancel this session?
        </Text>
        <Text
          variant="sans"
          weight="regular"
          size={13}
          color="ink2"
          style={{ marginTop: 10, marginBottom: 4 }}
        >
          Sets already completed are kept in history. The session is closed — pick it up tomorrow.
        </Text>

        <Pressable
          testID="cancel-confirm-destructive"
          accessibilityRole="button"
          accessibilityLabel={
            armed ? 'Tap again to cancel session' : 'Cancel session and return to Home'
          }
          onPress={armed ? onConfirmSecondTap : onConfirmFirstTap}
          style={confirmButton}
        >
          <Text
            variant="sans"
            weight="semibold"
            size={13}
            color="bg0"
            style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
          >
            {armed ? 'Tap again to confirm' : 'Cancel session'}
          </Text>
        </Pressable>

        <Pressable
          testID="cancel-confirm-dismiss"
          accessibilityRole="button"
          accessibilityLabel="Keep training"
          onPress={onDismiss}
          style={dismissButton}
        >
          <Text
            variant="sans"
            weight="medium"
            size={14}
            color="ink0"
            style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
          >
            Keep training
          </Text>
        </Pressable>
      </View>
    </Sheet>
  );
}
