import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Pressable, type ViewStyle } from 'react-native';

export type LogSheetFooterProps = {
  pending: boolean;
  onCancel: () => void;
  onSave: () => void;
  cancelTestID: string;
  saveTestID: string;
  cancelA11yLabel: string;
  saveA11yLabel: string;
};

/**
 * Shared Cancel + Save button pair for bottom-sheet rep loggers.
 *
 * Both the AMRAP sheet and the TM Test sheet use this exact visual shape —
 * two full-width bordered buttons side by side, ghost left and filled right,
 * both disabled at 60% opacity while a save is in flight. The only difference
 * between the two sheets is the testID and accessibility label strings.
 */
export function LogSheetFooter({
  pending,
  onCancel,
  onSave,
  cancelTestID,
  saveTestID,
  cancelA11yLabel,
  saveA11yLabel,
}: LogSheetFooterProps) {
  const { colors, spacing } = useTheme();
  const button = (variant: 'primary' | 'ghost'): ViewStyle => ({
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variant === 'primary' ? colors.ink0 : 'transparent',
    borderWidth: 1,
    borderColor: colors.ink0,
    opacity: pending ? 0.6 : 1,
  });

  return (
    <Row gap="md" style={{ marginTop: spacing.lg }}>
      <Pressable
        testID={cancelTestID}
        accessibilityRole="button"
        accessibilityLabel={cancelA11yLabel}
        disabled={pending}
        onPress={onCancel}
        style={button('ghost')}
      >
        <Text
          variant="sans"
          weight="semibold"
          size={13}
          color="ink0"
          style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          Cancel
        </Text>
      </Pressable>
      <Pressable
        testID={saveTestID}
        accessibilityRole="button"
        accessibilityLabel={saveA11yLabel}
        disabled={pending}
        onPress={onSave}
        style={button('primary')}
      >
        <Text
          variant="sans"
          weight="semibold"
          size={13}
          color="bg0"
          style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          Save
        </Text>
      </Pressable>
    </Row>
  );
}
