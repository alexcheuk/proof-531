/**
 * Confirm sheet for the destructive hard reset.
 *
 * Ported from `~/Development/531-pwa/src/features/settings/components/ResetConfirmSheet.tsx`.
 * Mirrors the chrome of `UnitMigrationSheet` byte-for-byte — eyebrow + title +
 * body + filled primary + ghost secondary. No preview table — the body copy
 * names the blast radius. No chromatic red: in the LEDGER e-ink theme the red
 * token aliases to ink-0, so destructive gravity is carried by the filled
 * primary chrome + copy.
 */
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Sheet } from '@/design/primitives/Sheet';
import { useTheme } from '@/design/theme';
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

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
  const { colors, type, spacing } = useTheme();

  const bodyStyle: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.bg2,
    gap: spacing.md,
  };

  const eyebrowStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: 6,
  };

  const titleStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 26,
    letterSpacing: -0.52,
    color: colors.ink0,
  };

  const paragraphStyle: TextStyle = {
    fontFamily: type.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink2,
    marginTop: 10,
    marginBottom: 10,
  };

  const cancelStyle: ViewStyle = {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.ink0,
    opacity: pending ? 0.5 : 1,
  };

  const cancelLabelStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 14,
    color: colors.ink0,
  };

  return (
    <Sheet open={open} onDismiss={onCancel} testID="reset-confirm-sheet" snapPoints={['50%']}>
      <View style={bodyStyle}>
        <View>
          <RNText style={eyebrowStyle}>CONFIRM</RNText>
          <RNText style={titleStyle}>Reset everything?</RNText>
        </View>

        <RNText style={paragraphStyle}>
          This deletes all your training maxes, sessions, set logs, and PRs. You'll start over from
          Onboarding.
        </RNText>

        <PrimaryPillButton
          testID="reset-confirm"
          onPress={onConfirm}
          disabled={pending}
          glyph="→"
          accessibilityLabel="Reset everything and return to onboarding"
        >
          Reset everything
        </PrimaryPillButton>

        <Pressable
          testID="reset-cancel"
          onPress={onCancel}
          disabled={pending}
          accessibilityRole="button"
          accessibilityLabel="Keep my data"
          style={cancelStyle}
        >
          <RNText style={cancelLabelStyle}>Keep my data</RNText>
        </Pressable>
      </View>
    </Sheet>
  );
}
