/**
 * Confirm sheet for the destructive hard reset.
 *
 * Mirrors the chrome of `UnitMigrationSheet` byte-for-byte — eyebrow + title +
 * body + filled primary + ghost secondary. No chromatic red: in the LEDGER
 * e-ink theme the red token aliases to ink-0, so destructive gravity is
 * carried by the filled primary chrome + copy.
 */
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle } from 'react-native';

export interface ResetConfirmSheetProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  pending?: boolean;
}

export function ResetConfirmSheet({
  open,
  onCancel,
  onConfirm,
  pending = false,
}: ResetConfirmSheetProps) {
  const { colors, type } = useTheme();

  const paragraphStyle: TextStyle = {
    fontFamily: type.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink2,
    marginTop: 10,
    marginBottom: 10,
  };

  return (
    <SheetLayout
      open={open}
      onDismiss={onCancel}
      testID="reset-confirm-sheet"
      snapPoints={['50%']}
      eyebrow="CONFIRM"
      title="Reset everything?"
      pending={pending}
      primary={
        <PrimaryPillButton
          testID="reset-confirm"
          onPress={onConfirm}
          disabled={pending}
          glyph="→"
          accessibilityLabel="Reset everything and return to onboarding"
        >
          Reset everything
        </PrimaryPillButton>
      }
      cancel={{
        label: 'Keep my data',
        onPress: onCancel,
        variant: 'outlined',
        testID: 'reset-cancel',
        accessibilityLabel: 'Keep my data',
      }}
    >
      <RNText style={paragraphStyle}>
        This deletes all your training maxes, sessions, set logs, and PRs. You'll start over from
        Onboarding.
      </RNText>
    </SheetLayout>
  );
}
